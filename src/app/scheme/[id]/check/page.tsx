'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { CitizenProfile, FieldKey, Lang, Rule, Scheme } from '@/lib/types';
import { evaluateScheme, nextQuestion, rankAlternatives, type NextQuestion } from '@/lib/engine';
import { getFieldDef } from '@/lib/fields';
import { useLang } from '@/lib/i18n/useLang';
import { useT, useTf } from '@/lib/i18n/strings';
import { getStoredProfile, saveProfile, clearProfile } from '@/lib/storage';
import { useSchemeById, useSchemeLibrary } from '@/lib/useSchemeLibrary';
import { useTranslatedScheme } from '@/lib/useTranslatedScheme';
import { formatQuickPickLabel } from '@/lib/format';
import { buildTemplateExplanation } from '@/lib/explainTemplate';
import { buildExplainPayload } from '@/lib/explainPayload';
import { QuestionCard } from '@/components/QuestionCard';
import { CriteriaPanel } from '@/components/CriteriaPanel';
import { CriterionRow } from '@/components/CriterionRow';
import { VerdictStamp } from '@/components/VerdictStamp';
import { DocChecklist } from '@/components/DocChecklist';
import { ApplySteps } from '@/components/ApplySteps';
import { AltSchemeCard } from '@/components/AltSchemeCard';
import { Disclaimer } from '@/components/Disclaimer';

type HistoryEntry =
  | { type: 'answer-field'; field: FieldKey }
  | { type: 'answer-custom'; customKey: string }
  | { type: 'skip-field'; field: FieldKey }
  | { type: 'skip-custom'; customKey: string };

// Finds the full Rule behind a NextQuestion (the engine only returns field/customKey).
function findRuleForQuestion(scheme: Scheme, q: NextQuestion): Rule | undefined {
  const matches = (rule: Rule) =>
    q.kind === 'field' ? rule.field === q.field : rule.field === 'custom' && rule.customKey === q.customKey;
  for (const group of scheme.eligibility) {
    const found = group.rules.find(matches);
    if (found) return found;
  }
  return scheme.exclusions.find(matches);
}

function resolveCustomQuestionText(rule: Rule | undefined, lang: Lang, fallback: string): string {
  if (!rule?.customQuestion) return fallback;
  if (typeof rule.customQuestion === 'string') return rule.customQuestion;
  return rule.customQuestion[lang] ?? rule.customQuestion.en ?? fallback;
}

// Eligibility check: question wizard (8.3) then result (8.4), same route, phase switch.
export default function EligibilityCheckPage() {
  const { id } = useParams<{ id: string }>();
  const { scheme, checked } = useSchemeById(id);
  const schemeLibrary = useSchemeLibrary();
  const {
    summary: translatedSummary,
    labelFor,
    unavailable: translationFailed,
  } = useTranslatedScheme(scheme);
  const { lang } = useLang();
  const t = useT();
  const tf = useTf();

  const [profile, setProfile] = useState<CitizenProfile>({});
  const [initialized, setInitialized] = useState(false);
  const [hadStoredProfile, setHadStoredProfile] = useState(false);
  // True once the citizen explicitly asks to see the result ("Show my result now", or
  // returning from an inline answer on the result page). Reaching the *natural* end of
  // the wizard needs no state of its own -- see `showWizard` below.
  const [forceResult, setForceResult] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [skippedFields, setSkippedFields] = useState<FieldKey[]>([]);
  const [skippedCustom, setSkippedCustom] = useState<string[]>([]);
  const [manualQuestion, setManualQuestion] = useState<NextQuestion | null>(null);
  const [llmExplanation, setLlmExplanation] = useState<string | null>(null);

  // Load the one shared profile once, on mount (SPEC 3 USP #6: one profile, all schemes).
  // This runs after the server-rendered (empty-profile) markup has hydrated, so it can't
  // mismatch -- reading localStorage during render instead would differ between server and client.
  useEffect(() => {
    const stored = getStoredProfile();
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from localStorage on mount */
    setProfile(stored);
    setHadStoredProfile(Object.keys(stored).length > 0);
    setInitialized(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist every change back to it.
  useEffect(() => {
    if (!initialized) return;
    saveProfile(profile);
  }, [profile, initialized]);

  const evaluation = useMemo(() => (scheme ? evaluateScheme(scheme, profile) : null), [scheme, profile]);

  const computedQuestion = useMemo(() => {
    if (!scheme) return null;
    return nextQuestion(scheme, profile, schemeLibrary, { fields: skippedFields, custom: skippedCustom });
  }, [scheme, profile, schemeLibrary, skippedFields, skippedCustom]);

  const currentQuestion = manualQuestion ?? computedQuestion;
  // Early stop: once the verdict is decided or nothing is left to ask, currentQuestion
  // is null and we fall straight through to the result below -- no state needed for that.
  const showWizard = !forceResult && currentQuestion !== null;

  const alternatives = useMemo(() => {
    if (!scheme) return [];
    return rankAlternatives(profile, schemeLibrary, scheme.id, 5);
  }, [scheme, profile, schemeLibrary]);

  // Fetch a nicer LLM-written explanation once per result view (never on each answer,
  // per SPEC 7.5); the template version below renders instantly and stays as the
  // fallback if this never resolves. No profile values leave the browser (7.3).
  useEffect(() => {
    if (showWizard || !scheme || !evaluation) return;
    let cancelled = false;
    // Clear any explanation left over from a previous verdict -- the template fallback
    // (computed fresh from `evaluation` at render time) covers the gap until this resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting before a new fetch, not deriving state from props
    setLlmExplanation(null);
    const payload = buildExplainPayload(scheme, evaluation, alternatives, labelFor);
    fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summaryPayload: payload, lang }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { explanation?: string } | null) => {
        if (!cancelled && typeof data?.explanation === 'string') setLlmExplanation(data.explanation);
      })
      .catch(() => {
        // Network/LLM failure: the template explanation already rendered, nothing to do.
      });
    return () => {
      cancelled = true;
    };
  }, [showWizard, scheme, evaluation, alternatives, lang, labelFor]);

  if (!scheme || !evaluation) {
    // Not yet checked (could still be an uploaded scheme found in localStorage) -> stay
    // quiet rather than flashing "not found" for a scheme that's about to appear.
    if (!checked) return null;
    return (
      <div className="mx-auto max-w-[720px] px-4 py-10 text-center">
        <p className="text-lg text-ink">{t('schemeNotFound')}</p>
        <Link href="/" className="mt-4 inline-block text-marigold underline">
          {t('backToHome')}
        </Link>
      </div>
    );
  }

  function applyAnswer(question: NextQuestion, value: string | number | boolean) {
    setProfile((prev) => {
      const next: CitizenProfile = { ...prev };
      if (question.kind === 'field') {
        (next as unknown as Record<FieldKey, unknown>)[question.field] = value;
      } else {
        next.custom = { ...(next.custom ?? {}), [question.customKey]: Boolean(value) };
      }
      return next;
    });
    setHistory((prev) => [
      ...prev,
      question.kind === 'field'
        ? { type: 'answer-field', field: question.field }
        : { type: 'answer-custom', customKey: question.customKey },
    ]);
    if (manualQuestion) {
      setManualQuestion(null);
      setForceResult(true);
    }
  }

  function handleDontKnow() {
    if (!currentQuestion) return;
    if (currentQuestion.kind === 'field') {
      const field = currentQuestion.field;
      setSkippedFields((prev) => [...prev, field]);
      setHistory((prev) => [...prev, { type: 'skip-field', field }]);
    } else {
      const customKey = currentQuestion.customKey;
      setSkippedCustom((prev) => [...prev, customKey]);
      setHistory((prev) => [...prev, { type: 'skip-custom', customKey }]);
    }
    if (manualQuestion) {
      setManualQuestion(null);
      setForceResult(true);
    }
  }

  function handleBack() {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, -1);
      if (last.type === 'answer-field') {
        setProfile((p) => {
          const n = { ...p };
          delete n[last.field];
          return n;
        });
      } else if (last.type === 'answer-custom') {
        setProfile((p) => {
          const custom = { ...(p.custom ?? {}) };
          delete custom[last.customKey];
          return { ...p, custom };
        });
      } else if (last.type === 'skip-field') {
        setSkippedFields((sf) => sf.filter((f) => f !== last.field));
      } else if (last.type === 'skip-custom') {
        setSkippedCustom((sc) => sc.filter((c) => c !== last.customKey));
      }
      return rest;
    });
  }

  function handleAnswerInline(rule: Rule) {
    if (rule.field === 'custom') {
      setManualQuestion({
        kind: 'custom',
        customKey: rule.customKey ?? '',
        question: resolveCustomQuestionText(rule, lang, rule.label),
        score: 0,
      });
    } else {
      setManualQuestion({ kind: 'field', field: rule.field, score: 0 });
    }
    setForceResult(false);
  }

  function handleEditProfile() {
    clearProfile();
    setProfile({});
    setHistory([]);
    setSkippedFields([]);
    setSkippedCustom([]);
    setHadStoredProfile(false);
    setManualQuestion(null);
    setForceResult(false);
  }

  // ---- Wizard phase ----
  if (showWizard && currentQuestion) {
    const matchedRule = findRuleForQuestion(scheme, currentQuestion);
    let questionText: string;
    let helpText: string | undefined;
    let sensitive: boolean | undefined;
    let type: 'boolean' | 'enum' | 'number' = 'boolean';
    let options: { value: string; label: string }[] | undefined;
    let quickPicks: { value: number; label: string }[] | undefined;

    if (currentQuestion.kind === 'field') {
      const def = getFieldDef(currentQuestion.field);
      questionText = def.question[lang];
      helpText = def.help?.[lang];
      sensitive = def.sensitive;
      type = def.type;
      options = def.options?.map((o) => ({ value: o.value, label: o.label[lang] }));
      quickPicks = def.quickPicks?.map((v) => ({ value: v, label: formatQuickPickLabel(v, def.unit, lang) }));
    } else {
      questionText = resolveCustomQuestionText(matchedRule, lang, currentQuestion.question);
    }

    const remainingCount = evaluation.missingFields.length + evaluation.missingCustom.length;
    const remainingLabel = tf(remainingCount === 1 ? 'moreQuestionsSingular' : 'moreQuestionsPlural', {
      count: remainingCount,
    });

    return (
      <div className="lg:mx-auto lg:grid lg:max-w-[960px] lg:grid-cols-[1fr_320px] lg:gap-6 lg:px-4 lg:py-8">
        <QuestionCard
          questionText={questionText}
          helpText={helpText}
          sensitive={sensitive}
          type={type}
          options={options}
          quickPicks={quickPicks}
          onAnswer={(v) => applyAnswer(currentQuestion, v)}
          onDontKnow={handleDontKnow}
          onBack={
            manualQuestion
              ? () => {
                  setManualQuestion(null);
                  setForceResult(true);
                }
              : history.length > 0
                ? handleBack
                : undefined
          }
          onShowResult={() => setForceResult(true)}
          remainingLabel={remainingLabel}
        />
        <div className="px-4 pb-8 lg:px-0 lg:pb-0">
          {hadStoredProfile && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-ink/5 p-3 text-sm text-slate">
              <span>{t('usingWhatYouToldUsBefore')}</span>
              <button
                type="button"
                onClick={handleEditProfile}
                className="flex-none font-medium text-marigold underline focus-visible:outline-none"
              >
                {t('editProfile')}
              </button>
            </div>
          )}
          <CriteriaPanel evaluation={evaluation} />
        </div>
      </div>
    );
  }

  // ---- Result phase ----
  const allResults = [...evaluation.groups.flatMap((g) => g.results), ...evaluation.exclusions];
  const met = allResults.filter((r) => r.status === 'PASS' && r.kind === 'eligibility');
  const notMet = allResults.filter((r) => r.status === 'FAIL');
  const unknown = allResults.filter((r) => r.status === 'UNKNOWN');
  const totalRules = allResults.length;
  const knownRules = allResults.filter((r) => r.status !== 'UNKNOWN').length;
  const explanation =
    llmExplanation ??
    buildTemplateExplanation(buildExplainPayload(scheme, evaluation, alternatives, labelFor), lang);

  return (
    <div className="mx-auto max-w-[720px] px-4 pb-16 pt-6">
      <Link
        href={`/scheme/${scheme.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden="true" /> {t('backToScheme')}
      </Link>

      {/* 1. Verdict stamp + confidence meter */}
      <div className="flex flex-col items-center py-4">
        <VerdictStamp verdict={evaluation.verdict} />
        <p className="mt-3 text-sm text-slate">{tf('confidenceMeter', { known: knownRules, total: totalRules })}</p>
      </div>

      {/* 2. Personal explanation */}
      <section className="mb-6 rounded-xl border border-ink/10 bg-white p-4 text-base text-ink">
        <p>{explanation}</p>
        {translationFailed && <p className="mt-2 text-xs text-haldi">{t('translationUnavailable')}</p>}
      </section>

      {/* 3. Why -- criteria breakdown */}
      <section className="mb-6 space-y-5">
        {met.length > 0 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold text-leaf">{t('youMeet')}</h2>
            <div className="space-y-2">
              {met.map((r) => (
                <CriterionRow
                  key={r.rule.id}
                  label={labelFor(r.rule)}
                  status={r.status}
                  kind={r.kind}
                  sourceQuote={r.rule.sourceQuote}
                  verified={r.rule.verified}
                />
              ))}
            </div>
          </div>
        )}
        {notMet.length > 0 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold text-sindoor">{t('youDontMeet')}</h2>
            <div className="space-y-2">
              {notMet.map((r) => (
                <CriterionRow
                  key={r.rule.id}
                  label={labelFor(r.rule)}
                  status={r.status}
                  kind={r.kind}
                  nearMiss={r.nearMiss}
                  sourceQuote={r.rule.sourceQuote}
                  verified={r.rule.verified}
                />
              ))}
            </div>
          </div>
        )}
        {unknown.length > 0 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold text-haldi">{t('weStillNeedToKnow')}</h2>
            <div className="space-y-2">
              {unknown.map((r) => (
                <CriterionRow
                  key={r.rule.id}
                  label={labelFor(r.rule)}
                  status={r.status}
                  kind={r.kind}
                  sourceQuote={r.rule.sourceQuote}
                  verified={r.rule.verified}
                  onTapUnknown={() => handleAnswerInline(r.rule)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. Papers checklist */}
      <section className="mb-6">
        <h2 className="mb-3 text-xl font-semibold text-ink">{t('papersYouNeed')}</h2>
        <DocChecklist documents={translatedSummary.documents} />
      </section>

      {/* 6. How to apply */}
      <section className="mb-6">
        <h2 className="mb-3 text-xl font-semibold text-ink">{t('howToApply')}</h2>
        <ApplySteps
          steps={translatedSummary.howToApply}
          jargon={scheme.jargon}
          officialUrl={translatedSummary.officialUrl}
          helpline={translatedSummary.helpline}
        />
      </section>

      {/* 7. Other schemes for you */}
      {alternatives.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-xl font-semibold text-ink">{t('otherSchemesForYou')}</h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {alternatives.map((alt) => (
              <AltSchemeCard key={alt.scheme.id} suggestion={alt} />
            ))}
          </div>
        </section>
      )}

      {/* 9. Disclaimer -- always visible */}
      <Disclaimer />
    </div>
  );
}
