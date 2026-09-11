// Static UI strings, hand-written in en/hi/te/ta. See SPEC.md Section 10.
// Scheme *content* (names, benefits, rules) is translated separately via /api/translate (Phase 5).

import { useLang } from './useLang';
import type { Lang } from '../types';

export const STRINGS = {
  appName: { en: 'Yojana Saathi', hi: 'योजना साथी', te: 'యోజన సాథి', ta: 'யோஜனா சாத்தி' },
  tagline: {
    en: 'Find out if a scheme is for you — and exactly why.',
    hi: 'जानिए कि कोई योजना आपके लिए है या नहीं — और बिल्कुल सही वजह के साथ।',
    te: 'తెలుసుకోండి — ఈ పథకం మీ కోసమేనా, మరియు ఎందుకు.',
    ta: 'ஒரு திட்டம் உங்களுக்குப் பொருந்துமா என்று அறியுங்கள் — சரியான காரணத்துடன்.',
  },

  // Landing page (9.6)
  heroPrompt: {
    en: 'Which scheme do you want to understand?',
    hi: 'आप किस योजना को समझना चाहते हैं?',
    te: 'మీరు ఏ పథకాన్ని అర్థం చేసుకోవాలని అనుకుంటున్నారు?',
    ta: 'நீங்கள் எந்தத் திட்டத்தைப் புரிந்துகொள்ள விரும்புகிறீர்கள்?',
  },
  uploadActionTitle: {
    en: 'Upload a scheme document',
    hi: 'योजना दस्तावेज़ अपलोड करें',
    te: 'పథక పత్రాన్ని అప్‌లోడ్ చేయండి',
    ta: 'திட்ட ஆவணத்தை பதிவேற்றவும்',
  },
  uploadActionDesc: {
    en: "PDF or pasted text — we'll explain it simply",
    hi: 'PDF या टेक्स्ट पेस्ट करें — हम इसे आसान भाषा में समझाएंगे',
    te: 'PDF లేదా టెక్స్ట్ పేస్ట్ చేయండి — మేము దీన్ని సులభంగా వివరిస్తాము',
    ta: 'PDF அல்லது உரையை ஒட்டவும் — நாங்கள் அதை எளிமையாக விளக்குவோம்',
  },
  pickActionTitle: {
    en: 'Pick from common schemes',
    hi: 'आम योजनाओं में से चुनें',
    te: 'సాధారణ పథకాల నుండి ఎంచుకోండి',
    ta: 'பொதுவான திட்டங்களில் இருந்து தேர்ந்தெடுக்கவும்',
  },
  pickActionDesc: {
    en: '8 popular central schemes, ready to explore',
    hi: '8 लोकप्रिय केंद्रीय योजनाएं, देखने के लिए तैयार',
    te: '8 ప్రసిద్ధ కేంద్ర పథకాలు, చూడటానికి సిద్ధంగా ఉన్నాయి',
    ta: '8 பிரபலமான மத்திய திட்டங்கள், பார்க்க தயாராக உள்ளன',
  },
  discoverActionTitle: {
    en: 'Find schemes for me',
    hi: 'मेरे लिए योजनाएं ढूंढें',
    te: 'నా కోసం పథకాలను కనుగొనండి',
    ta: 'எனக்கான திட்டங்களைக் கண்டறியவும்',
  },
  discoverActionDesc: {
    en: 'Answer a few questions, see what fits you',
    hi: 'कुछ सवालों के जवाब दें, देखें आपके लिए क्या सही है',
    te: 'కొన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి, మీకు ఏది సరిపోతుందో చూడండి',
    ta: 'சில கேள்விகளுக்குப் பதிலளிக்கவும், உங்களுக்கு எது பொருந்துகிறது எனப் பாருங்கள்',
  },
  libraryHeading: {
    en: 'Common schemes',
    hi: 'आम योजनाएं',
    te: 'సాధారణ పథకాలు',
    ta: 'பொதுவான திட்டங்கள்',
  },

  // Scheme Explainer (8.2)
  backToHome: { en: 'Back to home', hi: 'होम पर वापस जाएं', te: 'హోమ్‌కు తిరిగి వెళ్ళండి', ta: 'முகப்புக்குத் திரும்பு' },
  schemeNotFound: {
    en: "We couldn't find this scheme.",
    hi: 'हमें यह योजना नहीं मिली।',
    te: 'మాకు ఈ పథకం కనిపించలేదు.',
    ta: 'இந்தத் திட்டத்தை எங்களால் கண்டுபிடிக்க முடியவில்லை.',
  },
  levelCentral: { en: 'Central scheme', hi: 'केंद्रीय योजना', te: 'కేంద్ర పథకం', ta: 'மத்தியத் திட்டம்' },
  levelState: { en: 'State scheme', hi: 'राज्य योजना', te: 'రాష్ట్ర పథకం', ta: 'மாநிலத் திட்டம்' },
  original: { en: 'Original', hi: 'मूल', te: 'అసలు', ta: 'மூலம்' },
  here: { en: 'Here', hi: 'यहां', te: 'ఇక్కడ', ta: 'இங்கே' },
  words: { en: 'words', hi: 'शब्द', te: 'పదాలు', ta: 'சொற்கள்' },
  minRead: { en: 'min read', hi: 'मिनट का पढ़ना', te: 'నిమిషాల చదవడం', ta: 'நிமிட வாசிப்பு' },
  whatYouGet: { en: 'What you get', hi: 'आपको क्या मिलेगा', te: 'మీకు ఏమి లభిస్తుంది', ta: 'உங்களுக்கு என்ன கிடைக்கும்' },
  whoCanApply: { en: 'Who can apply', hi: 'कौन आवेदन कर सकता है', te: 'ఎవరు దరఖాస్తు చేసుకోవచ్చు', ta: 'யார் விண்ணப்பிக்கலாம்' },
  whoCannotApply: {
    en: 'Who cannot apply',
    hi: 'कौन आवेदन नहीं कर सकता',
    te: 'ఎవరు దరఖాస్తు చేసుకోలేరు',
    ta: 'யார் விண்ணப்பிக்க முடியாது',
  },
  papersYouNeed: {
    en: 'Papers you need',
    hi: 'आपको किन कागज़ों की ज़रूरत है',
    te: 'మీకు కావలసిన పత్రాలు',
    ta: 'உங்களுக்குத் தேவையான ஆவணங்கள்',
  },
  mandatory: { en: 'Required', hi: 'ज़रूरी', te: 'తప్పనిసరి', ta: 'அவசியம்' },
  howToApply: { en: 'How to apply', hi: 'आवेदन कैसे करें', te: 'ఎలా దరఖాస్తు చేయాలి', ta: 'எப்படி விண்ணப்பிப்பது' },
  officialWebsite: {
    en: 'Official website',
    hi: 'आधिकारिक वेबसाइट',
    te: 'అధికారిక వెబ్‌సైట్',
    ta: 'அதிகாரப்பூர்வ இணையதளம்',
  },
  notClearInDocument: {
    en: 'Not clear in the document',
    hi: 'दस्तावेज़ में यह स्पष्ट नहीं है',
    te: 'పత్రంలో ఇది స్పష్టంగా లేదు',
    ta: 'ஆவணத்தில் இது தெளிவாக இல்லை',
  },
  checkIfICanApply: {
    en: 'Check if I can apply',
    hi: 'जांचें कि क्या मैं आवेदन कर सकता हूं',
    te: 'నేను దరఖాస్తు చేసుకోవచ్చో లేదో తనిఖీ చేయండి',
    ta: 'நான் விண்ணப்பிக்க முடியுமா எனச் சரிபார்க்கவும்',
  },
  showSource: {
    en: 'Show where it says this',
    hi: 'यहां दिखाएं कि यह कहां लिखा है',
    te: 'ఇది ఎక్కడ రాసి ఉందో చూపించు',
    ta: 'இது எங்கு கூறப்பட்டுள்ளது எனக் காட்டு',
  },
  close: { en: 'Close', hi: 'बंद करें', te: 'మూసివేయి', ta: 'மூடு' },
  verified: { en: 'Verified', hi: 'सत्यापित', te: 'ధృవీకరించబడింది', ta: 'சரிபார்க்கப்பட்டது' },
  checkManually: {
    en: 'Check manually',
    hi: 'खुद जांच लें',
    te: 'మీరే తనిఖీ చేయండి',
    ta: 'நீங்களே சரிபார்க்கவும்',
  },
} satisfies Record<string, Record<Lang, string>>;

export type StringKey = keyof typeof STRINGS;

export function t(lang: Lang, key: StringKey): string {
  return STRINGS[key][lang];
}

/** Returns a translate function bound to the current language from context. */
export function useT(): (key: StringKey) => string {
  const { lang } = useLang();
  return (key: StringKey) => t(lang, key);
}
