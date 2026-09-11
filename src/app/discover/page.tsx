'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CitizenProfile, FieldKey } from '@/lib/types';
import { rankAlternatives } from '@/lib/engine';
import { getFieldDef } from '@/lib/fields';
import { useLang } from '@/lib/i18n/useLang';
import { useT, useTf, type StringKey } from '@/lib/i18n/strings';
import { getStoredProfile, saveProfile } from '@/lib/storage';
import { useSchemeLibrary } from '@/lib/useSchemeLibrary';
import { topFieldsAcrossLibrary } from '@/lib/discoverFields';
import { formatQuickPickLabel } from '@/lib/format';
import { QuestionCard } from '@/components/QuestionCard';
import { OneLineProfileBox } from '@/components/OneLineProfileBox';
import { AltSchemeCard } from '@/components/AltSchemeCard';

interface HistoryEntry {
  field: FieldKey;
  wasSkip: boolean;
}

const TAG_FILTERS: { tag: string; labelKey: StringKey }[] = [
  { tag: 'farmers', labelKey: 'tagFarmers' },
  { tag: 'women', labelKey: 'tagWomen' },
  { tag: 'pension', labelKey: 'tagPension' },
  { tag: 'health', labelKey: 'tagHealth' },
  { tag: 'insurance', labelKey: 'tagInsurance' },
  { tag: 'education', labelKey: 'tagEducation' },
  { tag: 'housing', labelKey: 'tagHousing' },
  { tag: 'loan', labelKey: 'tagLoans' },
];

// "Find schemes for me": one-line intro -> wizard across the whole library -> ranked,
// filterable results. SPEC.md Section 8.5.
export default function DiscoverPage() {
  const { lang } = useLang();
  const t = useT();
  const tf = useTf();
  const schemeLibrary = useSchemeLibrary();

  const [profile, setProfile] = useState<CitizenProfile>({});
  const [initialized, setInitialized] = useState(false);
  const [hadStoredProfile, setHadStoredProfile] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [forceResults, setForceResults] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [skippedFields, setSkippedFields] = useState<FieldKey[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Same shared profile as every scheme check (SPEC 3 USP #6) -- loaded after mount so
  // it can't mismatch server-rendered (empty-profile) markup.
  useEffect(() => {
    const stored = getStoredProfile();
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from localStorage on mount */
    setProfile(stored);
    setHadStoredProfile(Object.keys(stored).length > 0);
    setInitialized(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveProfile(profile);
  }, [profile, initialized]);

  const topFields = useMemo(() => topFieldsAcrossLibrary(schemeLibrary, 8), [schemeLibrary]);
  const remainingFields = useMemo(
    () => topFields.filter((f) => profile[f] === undefined && !skippedFields.includes(f)),
    [topFields, profile, skippedFields],
  );
  const currentField = remainingFields[0];
  const showWizard = !forceResults && Boolean(currentField);
  const showIntro = initialized && !introDone && !hadStoredProfile && history.length === 0;

  const alternatives = useMemo(
    () => rankAlternatives(profile, schemeLibrary, undefined, schemeLibrary.length || 8),
    [profile, schemeLibrary],
  );
  const filtered = activeTag ? alternatives.filter((a) => a.scheme.tags.includes(activeTag)) : alternatives;

  function applyAnswer(field: FieldKey, value: string | number | boolean) {
    setProfile((prev) => ({ ...prev, [field]: value }) as CitizenProfile);
    setHistory((prev) => [...prev, { field, wasSkip: false }]);
  }

  function handleDontKnow() {
    if (!currentField) return;
    setSkippedFields((prev) => [...prev, currentField]);
    setHistory((prev) => [...prev, { field: currentField, wasSkip: true }]);
  }

  function handleBack() {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, -1);
      if (last.wasSkip) {
        setSkippedFields((sf) => sf.filter((f) => f !== last.field));
      } else {
        setProfile((p) => {
          const next = { ...p };
          delete next[last.field];
          return next;
        });
      }
      return rest;
    });
  }

  function handleIntroParsed(parsed: Partial<CitizenProfile>) {
    setProfile((prev) => ({ ...parsed, ...prev }));
    setIntroDone(true);
  }

  function handleSkipIntro() {
    setIntroDone(true);
  }

  if (showIntro) {
    return <OneLineProfileBox onParsed={handleIntroParsed} onSkip={handleSkipIntro} />;
  }

  if (showWizard && currentField) {
    const def = getFieldDef(currentField);
    const options = def.options?.map((o) => ({ value: o.value, label: o.label[lang] }));
    const quickPicks = def.quickPicks?.map((v) => ({ value: v, label: formatQuickPickLabel(v, def.unit, lang) }));
    const remainingLabel = tf(
      remainingFields.length === 1 ? 'moreQuestionsSingular' : 'moreQuestionsPlural',
      { count: remainingFields.length },
    );

    return (
      <QuestionCard
        key={currentField}
        questionText={def.question[lang]}
        helpText={def.help?.[lang]}
        sensitive={def.sensitive}
        type={def.type}
        options={options}
        quickPicks={quickPicks}
        onAnswer={(v) => applyAnswer(currentField, v)}
        onDontKnow={handleDontKnow}
        onBack={history.length > 0 ? handleBack : undefined}
        onShowResult={() => setForceResults(true)}
        remainingLabel={remainingLabel}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      <h1 className="text-3xl font-bold text-ink">{t('discoverActionTitle')}</h1>
      <p className="mt-2 text-base text-slate">{t('resultsForYou')}</p>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium text-slate">{t('filterByCategory')}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
            className={`flex min-h-[40px] items-center rounded-full px-3 text-sm font-medium transition ${
              activeTag === null ? 'bg-ink text-paper' : 'border border-ink/15 bg-white text-ink hover:border-marigold'
            }`}
          >
            {t('tagAll')}
          </button>
          {TAG_FILTERS.map(({ tag, labelKey }) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              aria-pressed={activeTag === tag}
              className={`flex min-h-[40px] items-center rounded-full px-3 text-sm font-medium transition ${
                activeTag === tag ? 'bg-ink text-paper' : 'border border-ink/15 bg-white text-ink hover:border-marigold'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {filtered.length === 0 && <p className="text-base text-slate">{t('noMatchingSchemes')}</p>}
        {filtered.map((alt) => (
          <AltSchemeCard key={alt.scheme.id} suggestion={alt} fullWidth />
        ))}
      </div>
    </div>
  );
}
