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

  // Eligibility check wizard (8.3)
  yes: { en: 'Yes', hi: 'हां', te: 'అవును', ta: 'ஆம்' },
  no: { en: 'No', hi: 'नहीं', te: 'కాదు', ta: 'இல்லை' },
  back: { en: 'Back', hi: 'पीछे', te: 'వెనుకకు', ta: 'பின் செல்' },
  iDontKnow: {
    en: "I don't know",
    hi: 'मुझे नहीं पता',
    te: 'నాకు తెలియదు',
    ta: 'எனக்குத் தெரியாது',
  },
  showMyResultNow: {
    en: 'Show my result now',
    hi: 'अभी मेरा परिणाम दिखाएं',
    te: 'ఇప్పుడే నా ఫలితం చూపించు',
    ta: 'இப்போதே என் முடிவைக் காட்டு',
  },
  staysOnYourPhone: {
    en: 'Optional, stays on your phone',
    hi: 'वैकल्पिक, आपके फोन में ही रहेगा',
    te: 'ఐచ్ఛికం, మీ ఫోన్‌లోనే ఉంటుంది',
    ta: 'விருப்பத்தேர்வு, உங்கள் மொபைலிலேயே இருக்கும்',
  },
  otherAmount: {
    en: 'Or type an amount',
    hi: 'या राशि टाइप करें',
    te: 'లేదా మొత్తాన్ని టైప్ చేయండి',
    ta: 'அல்லது தொகையை தட்டச்சு செய்யவும்',
  },
  continueLabel: { en: 'Continue', hi: 'आगे बढ़ें', te: 'కొనసాగించు', ta: 'தொடரவும்' },
  usingWhatYouToldUsBefore: {
    en: 'Using what you told us before',
    hi: 'आपने पहले जो बताया था उसका उपयोग कर रहे हैं',
    te: 'మీరు ముందు చెప్పినదాన్ని ఉపయోగిస్తున్నాము',
    ta: 'நீங்கள் முன்பு கூறியதைப் பயன்படுத்துகிறோம்',
  },
  editProfile: { en: 'Edit', hi: 'बदलें', te: 'మార్చు', ta: 'திருத்து' },
  liveCriteriaHeading: {
    en: 'Your progress so far',
    hi: 'अब तक की स्थिति',
    te: 'ఇప్పటివరకు మీ స్థితి',
    ta: 'இதுவரை நிலை',
  },
  moreQuestionsSingular: {
    en: 'About {count} more question',
    hi: 'लगभग {count} और सवाल',
    te: 'దాదాపు {count} మరో ప్రశ్న',
    ta: 'சுமார் {count} மேலும் கேள்வி',
  },
  moreQuestionsPlural: {
    en: 'About {count} more questions',
    hi: 'लगभग {count} और सवाल',
    te: 'దాదాపు {count} మరో ప్రశ్నలు',
    ta: 'சுமார் {count} மேலும் கேள்விகள்',
  },

  // Result page (8.4)
  confidenceMeter: {
    en: 'Based on {known} of {total} rules',
    hi: '{total} में से {known} नियमों के आधार पर',
    te: '{total} నియమాలలో {known} ఆధారంగా',
    ta: '{total} விதிகளில் {known} அடிப்படையில்',
  },
  youMeet: {
    en: 'You meet',
    hi: 'आप इन पर खरे उतरते हैं',
    te: 'మీరు వీటిని అందుకుంటున్నారు',
    ta: 'நீங்கள் இவற்றை பூர்த்தி செய்கிறீர்கள்',
  },
  youDontMeet: {
    en: "You don't meet",
    hi: 'आप इन पर खरे नहीं उतरते',
    te: 'మీరు వీటిని అందుకోలేదు',
    ta: 'நீங்கள் இவற்றை பூர்த்தி செய்யவில்லை',
  },
  weStillNeedToKnow: {
    en: 'We still need to know',
    hi: 'हमें अभी और जानकारी चाहिए',
    te: 'మాకు ఇంకా తెలియాల్సింది ఉంది',
    ta: 'எங்களுக்கு இன்னும் தெரிய வேண்டியவை',
  },
  seeTheRule: { en: 'See the rule', hi: 'नियम देखें', te: 'నియమం చూడండి', ta: 'விதியைப் பார்க்கவும்' },
  exclusionTag: { en: 'Exclusion', hi: 'अपवाद', te: 'మినహాయింపు', ta: 'விலக்கு' },
  srMet: { en: 'Met', hi: 'पूरा हुआ', te: 'నెరవేరింది', ta: 'பூர்த்தியானது' },
  srNotMet: { en: 'Not met', hi: 'पूरा नहीं हुआ', te: 'నెరవేరలేదు', ta: 'பூர்த்தியாகவில்லை' },
  srUnknown: { en: 'Unknown', hi: 'अज्ञात', te: 'తెలియదు', ta: 'தெரியவில்லை' },
  iHaveThis: { en: 'I have this', hi: 'मेरे पास है', te: 'నా వద్ద ఉంది', ta: 'என்னிடம் உள்ளது' },
  iHaveThisChecked: { en: 'Got it ✓', hi: 'मिल गया ✓', te: 'ఉంది ✓', ta: 'உள்ளது ✓' },
  readinessMeter: {
    en: '{ready} of {total} ready',
    hi: '{total} में से {ready} तैयार',
    te: '{total}లో {ready} సిద్ధంగా ఉన్నాయి',
    ta: '{total}இல் {ready} தயார்',
  },
  otherSchemesForYou: {
    en: 'Other schemes for you',
    hi: 'आपके लिए अन्य योजनाएं',
    te: 'మీ కోసం ఇతర పథకాలు',
    ta: 'உங்களுக்கான பிற திட்டங்கள்',
  },
  open: { en: 'Open', hi: 'खोलें', te: 'తెరువు', ta: 'திற' },
  disclaimerText: {
    en: 'This is a guide, not an official decision. Final approval is by the government office.',
    hi: 'यह एक मार्गदर्शिका है, आधिकारिक निर्णय नहीं। अंतिम मंजूरी सरकारी कार्यालय द्वारा दी जाती है।',
    te: 'ఇది ఒక మార్గదర్శిని మాత్రమే, అధికారిక నిర్ణయం కాదు. తుది ఆమోదం ప్రభుత్వ కార్యాలయం ఇస్తుంది.',
    ta: 'இது ஒரு வழிகாட்டி மட்டுமே, அதிகாரப்பூர்வ முடிவு அல்ல. இறுதி ஒப்புதல் அரசு அலுவலகத்தால் வழங்கப்படும்.',
  },
  backToScheme: {
    en: 'Back to scheme details',
    hi: 'योजना विवरण पर वापस जाएं',
    te: 'పథక వివరాలకు తిరిగి వెళ్ళండి',
    ta: 'திட்ட விவரங்களுக்குத் திரும்பு',
  },
  verdictEligible: { en: 'Eligible', hi: 'पात्र', te: 'అర్హులు', ta: 'தகுதியானவர்' },
  verdictLikelyEligible: {
    en: 'Likely eligible',
    hi: 'संभावित रूप से पात्र',
    te: 'అర్హత ఉండవచ్చు',
    ta: 'தகுதி இருக்கலாம்',
  },
  verdictNeedMoreInfo: {
    en: 'Need more info',
    hi: 'अधिक जानकारी चाहिए',
    te: 'మరింత సమాచారం కావాలి',
    ta: 'மேலும் தகவல் தேவை',
  },
  verdictNotEligible: { en: 'Not eligible', hi: 'अपात्र', te: 'అనర్హులు', ta: 'தகுதியற்றவர்' },

  // Template explanation (7.3 EXPLAIN_SYSTEM shape, built without an LLM)
  explainEligible: {
    en: 'Based on what you told us, you are eligible for {scheme}.',
    hi: 'आपने जो बताया उसके आधार पर, आप {scheme} के लिए पात्र हैं।',
    te: 'మీరు చెప్పిన దాని ఆధారంగా, మీరు {scheme} కోసం అర్హులు.',
    ta: 'நீங்கள் கூறியதன் அடிப்படையில், நீங்கள் {scheme} திட்டத்திற்கு தகுதியானவர்.',
  },
  explainLikely: {
    en: 'Based on what you told us, you are likely eligible for {scheme}.',
    hi: 'आपने जो बताया उसके आधार पर, आप शायद {scheme} के लिए पात्र हैं।',
    te: 'మీరు చెప్పిన దాని ఆధారంగా, మీరు {scheme} కోసం అర్హులు కావచ్చు.',
    ta: 'நீங்கள் கூறியதன் அடிப்படையில், நீங்கள் {scheme} திட்டத்திற்கு தகுதி பெறலாம்.',
  },
  explainNeedInfo: {
    en: 'We need a little more information to be sure about {scheme}.',
    hi: '{scheme} के बारे में निश्चित होने के लिए हमें थोड़ी और जानकारी चाहिए।',
    te: '{scheme} గురించి ఖచ్చితంగా తెలుసుకోవడానికి మాకు కొంచెం ఎక్కువ సమాచారం కావాలి.',
    ta: '{scheme} பற்றி உறுதியாகத் தெரிந்துகொள்ள எங்களுக்கு இன்னும் கொஞ்சம் தகவல் தேவை.',
  },
  explainNotEligible: {
    en: 'Based on what you told us, you are not eligible for {scheme} right now.',
    hi: 'आपने जो बताया उसके आधार पर, आप अभी {scheme} के लिए पात्र नहीं हैं।',
    te: 'మీరు చెప్పిన దాని ఆధారంగా, మీరు ప్రస్తుతం {scheme} కోసం అర్హులు కాదు.',
    ta: 'நீங்கள் கூறியதன் அடிப்படையில், நீங்கள் தற்போது {scheme} திட்டத்திற்கு தகுதியற்றவர்.',
  },
  explainReasonsMet: {
    en: 'You meet: {list}.',
    hi: 'आप इन पर खरे उतरते हैं: {list}।',
    te: 'మీరు వీటిని అందుకుంటున్నారు: {list}.',
    ta: 'நீங்கள் இவற்றை பூர்த்தி செய்கிறீர்கள்: {list}.',
  },
  explainMainReason: {
    en: 'The main reason: {reason}.',
    hi: 'मुख्य कारण: {reason}।',
    te: 'ప్రధాన కారణం: {reason}.',
    ta: 'முக்கிய காரணம்: {reason}.',
  },
  explainNextMissing: {
    en: 'Answer {count} more question(s) to get a fuller picture.',
    hi: 'पूरी जानकारी पाने के लिए {count} और सवालों के जवाब दें।',
    te: 'పూర్తి చిత్రం పొందడానికి {count} మరిన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి.',
    ta: 'முழுமையான படத்தைப் பெற {count} மேலும் கேள்விகளுக்குப் பதிலளிக்கவும்.',
  },
  explainNextDocuments: {
    en: 'Next, gather your documents and apply.',
    hi: 'अब, अपने कागज़ात इकट्ठा करें और आवेदन करें।',
    te: 'తర్వాత, మీ పత్రాలు సేకరించి దరఖాస్తు చేయండి.',
    ta: 'அடுத்து, உங்கள் ஆவணங்களைச் சேகரித்து விண்ணப்பிக்கவும்.',
  },

  // Number field units (used with quick-pick chips)
  unitAcres: { en: 'acres', hi: 'एकड़', te: 'ఎకరాలు', ta: 'ஏக்கர்' },
  unitPeople: { en: 'people', hi: 'लोग', te: 'మంది', ta: 'பேர்' },

  // Upload page (8.1 /upload, 8.6 states)
  uploadPageSubtitle: {
    en: "We'll read the document, find the rules, and explain it simply — with every rule linked back to the original text.",
    hi: 'हम दस्तावेज़ पढ़ेंगे, नियम ढूंढेंगे, और उसे आसान भाषा में समझाएंगे — हर नियम मूल पाठ से जुड़ा होगा।',
    te: 'మేము పత్రాన్ని చదివి, నియమాలను కనుగొని, దాన్ని సులభంగా వివరిస్తాము — ప్రతి నియమం అసలు వచనానికి అనుసంధానించబడి ఉంటుంది.',
    ta: 'நாங்கள் ஆவணத்தைப் படித்து, விதிகளைக் கண்டறிந்து, அதை எளிமையாக விளக்குவோம் — ஒவ்வொரு விதியும் மூல உரையுடன் இணைக்கப்பட்டிருக்கும்.',
  },
  choosePdfFile: {
    en: 'Choose a PDF file',
    hi: 'PDF फ़ाइल चुनें',
    te: 'PDF ఫైల్‌ను ఎంచుకోండి',
    ta: 'PDF கோப்பைத் தேர்ந்தெடுக்கவும்',
  },
  pdfSizeLimit: { en: 'Up to 4 MB', hi: 'अधिकतम 4 MB', te: 'గరిష్టంగా 4 MB', ta: 'அதிகபட்சம் 4 MB' },
  or: { en: 'or', hi: 'या', te: 'లేదా', ta: 'அல்லது' },
  pasteTextPlaceholder: {
    en: 'Paste the scheme text here…',
    hi: 'योजना का पाठ यहां चिपकाएं…',
    te: 'పథక వచనాన్ని ఇక్కడ అతికించండి…',
    ta: 'திட்ட உரையை இங்கே ஒட்டவும்…',
  },
  extractFromText: {
    en: 'Explain this text',
    hi: 'इस पाठ को समझाएं',
    te: 'ఈ వచనాన్ని వివరించండి',
    ta: 'இந்த உரையை விளக்கவும்',
  },
  trySample: {
    en: 'Try a sample scheme',
    hi: 'एक नमूना योजना आज़माएं',
    te: 'ఒక నమూనా పథకాన్ని ప్రయత్నించండి',
    ta: 'ஒரு மாதிரி திட்டத்தை முயற்சிக்கவும்',
  },
  browseLibraryInstead: {
    en: 'Browse the scheme library instead',
    hi: 'इसके बजाय योजना सूची देखें',
    te: 'బదులుగా పథక జాబితాను చూడండి',
    ta: 'அதற்கு பதிலாக திட்டப் பட்டியலைப் பார்க்கவும்',
  },
  extractionDoneTitle: {
    en: 'Done! We turned it into a simple, checkable summary.',
    hi: 'हो गया! हमने इसे आसान, जांचने योग्य सारांश में बदल दिया।',
    te: 'పూర్తయింది! మేము దీన్ని సులభమైన, తనిఖీ చేయదగిన సారాంశంగా మార్చాము.',
    ta: 'முடிந்தது! நாங்கள் அதை எளிய, சரிபார்க்கக்கூடிய சுருக்கமாக மாற்றினோம்.',
  },
  extractionStats: {
    en: '{verified} of {total} rules verified against the original text',
    hi: '{total} में से {verified} नियम मूल पाठ से सत्यापित',
    te: '{total} నియమాలలో {verified} అసలు వచనంతో ధృవీకరించబడ్డాయి',
    ta: '{total} விதிகளில் {verified} மூல உரையுடன் சரிபார்க்கப்பட்டது',
  },
  seeSimplifiedVersion: {
    en: 'See the simplified version',
    hi: 'आसान संस्करण देखें',
    te: 'సరళీకృత వెర్షన్ చూడండి',
    ta: 'எளிமையாக்கப்பட்ட பதிப்பைப் பார்க்கவும்',
  },
  stageReading: {
    en: 'Reading the document…',
    hi: 'दस्तावेज़ पढ़ रहे हैं…',
    te: 'పత్రాన్ని చదువుతోంది…',
    ta: 'ஆவணத்தைப் படிக்கிறது…',
  },
  stageFindingRules: {
    en: 'Finding the rules…',
    hi: 'नियम ढूंढ रहे हैं…',
    te: 'నియమాలను కనుగొంటోంది…',
    ta: 'விதிகளைக் கண்டறிகிறது…',
  },
  stageCheckingRules: {
    en: 'Checking every rule against the text…',
    hi: 'हर नियम को पाठ से जांच रहे हैं…',
    te: 'ప్రతి నియమాన్ని వచనంతో తనిఖీ చేస్తోంది…',
    ta: 'ஒவ்வொரு விதியையும் உரையுடன் சரிபார்க்கிறது…',
  },
  stageSimplifying: {
    en: 'Writing it in simple words…',
    hi: 'इसे आसान शब्दों में लिख रहे हैं…',
    te: 'దీన్ని సులభమైన పదాలలో రాస్తోంది…',
    ta: 'அதை எளிய வார்த்தைகளில் எழுதுகிறது…',
  },
  networkError: {
    en: "We couldn't reach the server. Check your connection and try again.",
    hi: 'हम सर्वर तक नहीं पहुंच सके। अपना कनेक्शन जांचें और फिर से कोशिश करें।',
    te: 'మేము సర్వర్‌ను చేరుకోలేకపోయాము. మీ కనెక్షన్‌ని తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
    ta: 'எங்களால் சேவையகத்தை அடைய முடியவில்லை. உங்கள் இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
  },
  genericError: {
    en: 'Something went wrong. Please try again.',
    hi: 'कुछ गलत हो गया। कृपया फिर से कोशिश करें।',
    te: 'ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    ta: 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.',
  },
  yourUploadedSchemes: {
    en: 'Your uploaded schemes',
    hi: 'आपके अपलोड किए गए दस्तावेज़',
    te: 'మీరు అప్‌లోడ్ చేసిన పథకాలు',
    ta: 'நீங்கள் பதிவேற்றிய திட்டங்கள்',
  },

  // Translation fallback (7.4)
  translationUnavailable: {
    en: 'Translation unavailable right now — showing English.',
    hi: 'अभी अनुवाद उपलब्ध नहीं है — अंग्रेज़ी दिखाई जा रही है।',
    te: 'ప్రస్తుతం అనువాదం అందుబాటులో లేదు — ఆంగ్లంలో చూపిస్తున్నాము.',
    ta: 'தற்போது மொழிபெயர்ப்பு கிடைக்கவில்லை — ஆங்கிலத்தில் காட்டுகிறோம்.',
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

/** Translate a templated string, replacing {name} placeholders with `vars`. */
export function tf(lang: Lang, key: StringKey, vars: Record<string, string | number>): string {
  let result = t(lang, key);
  for (const [name, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${name}}`, String(value));
  }
  return result;
}

/** Returns a templated-translate function bound to the current language from context. */
export function useTf(): (key: StringKey, vars: Record<string, string | number>) => string {
  const { lang } = useLang();
  return (key: StringKey, vars: Record<string, string | number>) => tf(lang, key, vars);
}
