// Field registry for the question wizard. One entry per FieldKey.
// See SPEC.md Section 6.2. All questions/labels are hand-written in en/hi/te/ta.

import type { FieldKey, Lang } from './types';

export interface FieldOption {
  value: string;
  label: Record<Lang, string>;
  icon?: string;
}

export interface FieldDef {
  key: FieldKey;
  type: 'number' | 'boolean' | 'enum';
  options?: FieldOption[];
  question: Record<Lang, string>; // simple, one idea per question, <= 12 words
  help?: Record<Lang, string>; // e.g. "Add up yearly earnings of everyone in your home"
  unit?: 'years' | 'INR' | 'acres' | 'percent' | 'people';
  quickPicks?: number[]; // number fields: tap-able chips
  sensitive?: boolean; // show "optional, stays on your phone" note
}

// Indian states and union territories, used by the `state` field.
export const STATE_OPTIONS: FieldOption[] = [
  { value: 'Andhra Pradesh', label: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', te: 'ఆంధ్ర ప్రదేశ్', ta: 'ஆந்திரப் பிரதேசம்' } },
  { value: 'Arunachal Pradesh', label: { en: 'Arunachal Pradesh', hi: 'अरुणाचल प्रदेश', te: 'అరుణాచల్ ప్రదేశ్', ta: 'அருணாசலப் பிரதேசம்' } },
  { value: 'Assam', label: { en: 'Assam', hi: 'असम', te: 'అస్సాం', ta: 'அசாம்' } },
  { value: 'Bihar', label: { en: 'Bihar', hi: 'बिहार', te: 'బీహార్', ta: 'பீகார்' } },
  { value: 'Chhattisgarh', label: { en: 'Chhattisgarh', hi: 'छत्तीसगढ़', te: 'ఛత్తీస్‌గఢ్', ta: 'சத்தீஸ்கர்' } },
  { value: 'Goa', label: { en: 'Goa', hi: 'गोवा', te: 'గోవా', ta: 'கோவா' } },
  { value: 'Gujarat', label: { en: 'Gujarat', hi: 'गुजरात', te: 'గుజరాత్', ta: 'குஜராத்' } },
  { value: 'Haryana', label: { en: 'Haryana', hi: 'हरियाणा', te: 'హర్యానా', ta: 'அரியானா' } },
  { value: 'Himachal Pradesh', label: { en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश', te: 'హిమాచల్ ప్రదేశ్', ta: 'இமாசலப் பிரதேசம்' } },
  { value: 'Jharkhand', label: { en: 'Jharkhand', hi: 'झारखंड', te: 'జార్ఖండ్', ta: 'ஜார்க்கண்ட்' } },
  { value: 'Karnataka', label: { en: 'Karnataka', hi: 'कर्नाटक', te: 'కర్ణాటక', ta: 'கர்நாடகா' } },
  { value: 'Kerala', label: { en: 'Kerala', hi: 'केरल', te: 'కేరళ', ta: 'கேரளா' } },
  { value: 'Madhya Pradesh', label: { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश', te: 'మధ్యప్రదేశ్', ta: 'மத்தியப் பிரதேசம்' } },
  { value: 'Maharashtra', label: { en: 'Maharashtra', hi: 'महाराष्ट्र', te: 'మహారాష్ట్ర', ta: 'மகாராஷ்டிரா' } },
  { value: 'Manipur', label: { en: 'Manipur', hi: 'मणिपुर', te: 'మణిపూర్', ta: 'மணிப்பூர்' } },
  { value: 'Meghalaya', label: { en: 'Meghalaya', hi: 'मेघालय', te: 'మేఘాలయ', ta: 'மேகாலயா' } },
  { value: 'Mizoram', label: { en: 'Mizoram', hi: 'मिज़ोरम', te: 'మిజోరాం', ta: 'மிசோரம்' } },
  { value: 'Nagaland', label: { en: 'Nagaland', hi: 'नागालैंड', te: 'నాగాలాండ్', ta: 'நாகாலாந்து' } },
  { value: 'Odisha', label: { en: 'Odisha', hi: 'ओडिशा', te: 'ఒడిశా', ta: 'ஒடிசா' } },
  { value: 'Punjab', label: { en: 'Punjab', hi: 'पंजाब', te: 'పంజాబ్', ta: 'பஞ்சாப்' } },
  { value: 'Rajasthan', label: { en: 'Rajasthan', hi: 'राजस्थान', te: 'రాజస్థాన్', ta: 'ராஜஸ்தான்' } },
  { value: 'Sikkim', label: { en: 'Sikkim', hi: 'सिक्किम', te: 'సిక్కిం', ta: 'சிக்கிம்' } },
  { value: 'Tamil Nadu', label: { en: 'Tamil Nadu', hi: 'तमिलनाडु', te: 'తమిళనాడు', ta: 'தமிழ்நாடு' } },
  { value: 'Telangana', label: { en: 'Telangana', hi: 'तेलंगाना', te: 'తెలంగాణ', ta: 'தெலங்காணா' } },
  { value: 'Tripura', label: { en: 'Tripura', hi: 'त्रिपुरा', te: 'త్రిపుర', ta: 'திரிபுரா' } },
  { value: 'Uttar Pradesh', label: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश', te: 'ఉత్తర ప్రదేశ్', ta: 'உத்தரப் பிரதேசம்' } },
  { value: 'Uttarakhand', label: { en: 'Uttarakhand', hi: 'उत्तराखंड', te: 'ఉత్తరాఖండ్', ta: 'உத்தராகண்ட்' } },
  { value: 'West Bengal', label: { en: 'West Bengal', hi: 'पश्चिम बंगाल', te: 'పశ్చిమ బెంగాల్', ta: 'மேற்கு வங்காளம்' } },
  { value: 'Andaman and Nicobar Islands', label: { en: 'Andaman and Nicobar Islands', hi: 'अंडमान और निकोबार द्वीप समूह', te: 'అండమాన్ మరియు నికోబార్ దీవులు', ta: 'அந்தமான் நிக்கோபார் தீவுகள்' } },
  { value: 'Chandigarh', label: { en: 'Chandigarh', hi: 'चंडीगढ़', te: 'చండీగఢ్', ta: 'சண்டிகர்' } },
  { value: 'Dadra and Nagar Haveli and Daman and Diu', label: { en: 'Dadra and Nagar Haveli and Daman and Diu', hi: 'दादरा और नगर हवेली और दमन और दीव', te: 'దాద్రా మరియు నగర్ హవేలీ మరియు డామన్ మరియు డయ్యూ', ta: 'தாத்ரா நகர் அவேலி மற்றும் தமன் தியூ' } },
  { value: 'Delhi', label: { en: 'Delhi', hi: 'दिल्ली', te: 'ఢిల్లీ', ta: 'டெல்லி' } },
  { value: 'Jammu and Kashmir', label: { en: 'Jammu and Kashmir', hi: 'जम्मू और कश्मीर', te: 'జమ్మూ మరియు కాశ్మీర్', ta: 'ஜம்மு காஷ்மீர்' } },
  { value: 'Ladakh', label: { en: 'Ladakh', hi: 'लद्दाख', te: 'లడఖ్', ta: 'லடாக்' } },
  { value: 'Lakshadweep', label: { en: 'Lakshadweep', hi: 'लक्षद्वीप', te: 'లక్షద్వీప్', ta: 'இலட்சத்தீவுகள்' } },
  { value: 'Puducherry', label: { en: 'Puducherry', hi: 'पुदुचेरी', te: 'పుదుచ్చేరి', ta: 'புதுச்சேரி' } },
];

export const FIELDS: FieldDef[] = [
  {
    key: 'age',
    type: 'number',
    unit: 'years',
    question: {
      en: 'What is your age?',
      hi: 'आपकी उम्र कितनी है?',
      te: 'మీ వయస్సు ఎంత?',
      ta: 'உங்கள் வயது என்ன?',
    },
  },
  {
    key: 'gender',
    type: 'enum',
    question: {
      en: 'What is your gender?',
      hi: 'आपका लिंग क्या है?',
      te: 'మీ లింగం ఏమిటి?',
      ta: 'உங்கள் பாலினம் என்ன?',
    },
    options: [
      { value: 'male', label: { en: 'Male', hi: 'पुरुष', te: 'పురుషుడు', ta: 'ஆண்' } },
      { value: 'female', label: { en: 'Female', hi: 'महिला', te: 'స్త్రీ', ta: 'பெண்' } },
      { value: 'transgender', label: { en: 'Transgender', hi: 'ट्रांसजेंडर', te: 'ట్రాన్స్‌జెండర్', ta: 'திருநங்கை' } },
    ],
  },
  {
    key: 'state',
    type: 'enum',
    question: {
      en: 'Which state or UT do you live in?',
      hi: 'आप किस राज्य या केंद्र शासित प्रदेश में रहते हैं?',
      te: 'మీరు ఏ రాష్ట్రం లేదా కేంద్రపాలిత ప్రాంతంలో నివసిస్తున్నారు?',
      ta: 'நீங்கள் எந்த மாநிலம் அல்லது யூனியன் பிரதேசத்தில் வசிக்கிறீர்கள்?',
    },
    options: STATE_OPTIONS,
  },
  {
    key: 'residence',
    type: 'enum',
    question: {
      en: 'Do you live in a village or city?',
      hi: 'क्या आप गांव में रहते हैं या शहर में?',
      te: 'మీరు గ్రామంలో ఉంటున్నారా లేదా పట్టణంలో?',
      ta: 'நீங்கள் கிராமத்தில் வசிக்கிறீர்களா அல்லது நகரத்தில்?',
    },
    options: [
      { value: 'rural', label: { en: 'Village', hi: 'गांव', te: 'గ్రామం', ta: 'கிராமம்' } },
      { value: 'urban', label: { en: 'City', hi: 'शहर', te: 'పట్టణం', ta: 'நகரம்' } },
    ],
  },
  {
    key: 'annualFamilyIncome',
    type: 'number',
    unit: 'INR',
    sensitive: true,
    question: {
      en: "What is your family's yearly income?",
      hi: 'आपके परिवार की सालाना आय कितनी है?',
      te: 'మీ కుటుంబ వార్షిక ఆదాయం ఎంత?',
      ta: 'உங்கள் குடும்பத்தின் ஆண்டு வருமானம் என்ன?',
    },
    help: {
      en: 'Add up yearly earnings of everyone in your home',
      hi: 'घर के सभी सदस्यों की सालाना कमाई जोड़ें',
      te: 'మీ ఇంట్లో అందరి వార్షిక సంపాదన కలపండి',
      ta: 'உங்கள் வீட்டில் உள்ள அனைவரின் ஆண்டு வருமானத்தையும் கூட்டவும்',
    },
    quickPicks: [50000, 100000, 250000, 500000],
  },
  {
    key: 'socialCategory',
    type: 'enum',
    sensitive: true,
    question: {
      en: 'What is your social category?',
      hi: 'आपकी सामाजिक श्रेणी क्या है?',
      te: 'మీ సామాజిక వర్గం ఏమిటి?',
      ta: 'உங்கள் சமூகப் பிரிவு என்ன?',
    },
    options: [
      { value: 'general', label: { en: 'General', hi: 'सामान्य', te: 'జనరల్', ta: 'பொது' } },
      { value: 'obc', label: { en: 'OBC', hi: 'ओबीसी', te: 'ఓబీసీ', ta: 'பிற்படுத்தப்பட்டோர் (OBC)' } },
      { value: 'sc', label: { en: 'SC', hi: 'अनुसूचित जाति (SC)', te: 'ఎస్సీ', ta: 'பட்டியல் சாதி (SC)' } },
      { value: 'st', label: { en: 'ST', hi: 'अनुसूचित जनजाति (ST)', te: 'ఎస్టీ', ta: 'பட்டியல் பழங்குடி (ST)' } },
      { value: 'ews', label: { en: 'EWS', hi: 'ईडब्ल्यूएस (EWS)', te: 'ఈడబ్ల్యూఎస్ (EWS)', ta: 'பொருளாதார பலவீனர் (EWS)' } },
    ],
  },
  {
    key: 'occupation',
    type: 'enum',
    question: {
      en: 'What work do you do?',
      hi: 'आप क्या काम करते हैं?',
      te: 'మీరు ఏ పని చేస్తారు?',
      ta: 'நீங்கள் என்ன வேலை செய்கிறீர்கள்?',
    },
    options: [
      { value: 'farmer', label: { en: 'Farmer', hi: 'किसान', te: 'రైతు', ta: 'விவசாயி' } },
      { value: 'agri_labourer', label: { en: 'Farm labourer', hi: 'खेत मजदूर', te: 'వ్యవసాయ కూలీ', ta: 'விவசாய தொழிலாளி' } },
      { value: 'street_vendor', label: { en: 'Street vendor', hi: 'रेहड़ी-पटरी वाला', te: 'వీధి వ్యాపారి', ta: 'தெரு வியாபாரி' } },
      { value: 'artisan', label: { en: 'Artisan / craftsperson', hi: 'कारीगर', te: 'చేతివృత్తి పనివాడు', ta: 'கைவினைஞர்' } },
      { value: 'student', label: { en: 'Student', hi: 'छात्र', te: 'విద్యార్థి', ta: 'மாணவர்' } },
      { value: 'salaried_private', label: { en: 'Private job', hi: 'निजी नौकरी', te: 'ప్రైవేట్ ఉద్యోగం', ta: 'தனியார் வேலை' } },
      { value: 'govt_employee', label: { en: 'Government job', hi: 'सरकारी नौकरी', te: 'ప్రభుత్వ ఉద్యోగం', ta: 'அரசு வேலை' } },
      { value: 'self_employed', label: { en: 'Own business', hi: 'खुद का काम/व्यापार', te: 'సొంత వ్యాపారం', ta: 'சொந்த தொழில்' } },
      { value: 'unemployed', label: { en: 'No job currently', hi: 'फिलहाल कोई काम नहीं', te: 'ప్రస్తుతం పని లేదు', ta: 'தற்போது வேலை இல்லை' } },
      { value: 'homemaker', label: { en: 'Homemaker', hi: 'गृहिणी', te: 'గృహిణి', ta: 'இல்லத்தரசி' } },
      { value: 'retired', label: { en: 'Retired', hi: 'सेवानिवृत्त', te: 'పదవీ విరమణ పొందారు', ta: 'ஓய்வு பெற்றவர்' } },
    ],
  },
  {
    key: 'ownsAgriLand',
    type: 'boolean',
    question: {
      en: 'Do you own farming land?',
      hi: 'क्या आपके पास खेती की जमीन है?',
      te: 'మీకు సొంత వ్యవసాయ భూమి ఉందా?',
      ta: 'உங்களுக்கு சொந்த விவசாய நிலம் உள்ளதா?',
    },
  },
  {
    key: 'landHoldingAcres',
    type: 'number',
    unit: 'acres',
    quickPicks: [1, 2, 5, 10],
    question: {
      en: 'How many acres of land do you have?',
      hi: 'आपके पास कितने एकड़ जमीन है?',
      te: 'మీకు ఎన్ని ఎకరాల భూమి ఉంది?',
      ta: 'உங்களிடம் எத்தனை ஏக்கர் நிலம் உள்ளது?',
    },
  },
  {
    key: 'rationCardType',
    type: 'enum',
    question: {
      en: 'What type of ration card do you have?',
      hi: 'आपके पास किस तरह का राशन कार्ड है?',
      te: 'మీ వద్ద ఏ రకమైన రేషన్ కార్డు ఉంది?',
      ta: 'உங்களிடம் எந்த வகை ரேஷன் கார்டு உள்ளது?',
    },
    options: [
      { value: 'aay', label: { en: 'Antyodaya (AAY)', hi: 'अंत्योदय (AAY)', te: 'అంత్యోదయ (AAY)', ta: 'அந்த்யோதயா (AAY)' } },
      { value: 'phh', label: { en: 'Priority household (PHH)', hi: 'प्राथमिकता वाला परिवार (PHH)', te: 'ప్రాధాన్యత గృహం (PHH)', ta: 'முன்னுரிமை குடும்பம் (PHH)' } },
      { value: 'bpl', label: { en: 'BPL', hi: 'गरीबी रेखा से नीचे (BPL)', te: 'దారిద్ర్య రేఖకు దిగువ (BPL)', ta: 'வறுமைக்கோட்டிற்குக் கீழ் (BPL)' } },
      { value: 'apl', label: { en: 'APL', hi: 'गरीबी रेखा से ऊपर (APL)', te: 'దారిద్ర్య రేఖకు ఎగువ (APL)', ta: 'வறுமைக்கோட்டிற்கு மேல் (APL)' } },
      { value: 'none', label: { en: 'No ration card', hi: 'राशन कार्ड नहीं है', te: 'రేషన్ కార్డు లేదు', ta: 'ரேஷன் கார்டு இல்லை' } },
    ],
  },
  {
    key: 'isIncomeTaxPayer',
    type: 'boolean',
    question: {
      en: 'Do you or your family pay income tax?',
      hi: 'क्या आप या आपका परिवार आयकर भरता है?',
      te: 'మీరు లేదా మీ కుటుంబం ఆదాయపు పన్ను చెల్లిస్తారా?',
      ta: 'நீங்கள் அல்லது உங்கள் குடும்பம் வருமான வரி செலுத்துகிறீர்களா?',
    },
  },
  {
    key: 'isGovtEmployeeInFamily',
    type: 'boolean',
    question: {
      en: 'Is anyone in your family a government employee?',
      hi: 'क्या आपके परिवार में कोई सरकारी कर्मचारी है?',
      te: 'మీ కుటుంబంలో ఎవరైనా ప్రభుత్వ ఉద్యోగి ఉన్నారా?',
      ta: 'உங்கள் குடும்பத்தில் யாராவது அரசு ஊழியரா?',
    },
    help: {
      en: 'Includes serving or retired government employees',
      hi: 'इसमें कार्यरत या सेवानिवृत्त सरकारी कर्मचारी शामिल हैं',
      te: 'పనిచేస్తున్న లేదా పదవీ విరమణ పొందిన ప్రభుత్వ ఉద్యోగులు కూడా ఇందులో ఉన్నారు',
      ta: 'பணியில் உள்ள அல்லது ஓய்வு பெற்ற அரசு ஊழியர்களும் இதில் அடங்குவர்',
    },
  },
  {
    key: 'monthlyPension',
    type: 'number',
    unit: 'INR',
    quickPicks: [5000, 10000, 15000, 25000],
    question: {
      en: 'What is your monthly pension amount?',
      hi: 'आपकी मासिक पेंशन कितनी है?',
      te: 'మీ నెలవారీ పెన్షన్ ఎంత?',
      ta: 'உங்கள் மாத ஓய்வூதியம் எவ்வளவு?',
    },
  },
  {
    key: 'isProfessional',
    type: 'boolean',
    question: {
      en: 'Are you a doctor, engineer, lawyer or similar?',
      hi: 'क्या आप डॉक्टर, इंजीनियर, वकील जैसे पेशेवर हैं?',
      te: 'మీరు డాక్టర్, ఇంజనీర్, న్యాయవాది వంటి వృత్తి నిపుణులా?',
      ta: 'நீங்கள் மருத்துவர், பொறியாளர், வழக்கறிஞர் போன்றவரா?',
    },
    help: {
      en: 'Registered, practising professionals only',
      hi: 'केवल पंजीकृत, कार्यरत पेशेवर',
      te: 'నమోదైన, ప్రాక్టీస్ చేస్తున్న నిపుణులకు మాత్రమే',
      ta: 'பதிவு செய்யப்பட்ட, பயிற்சியில் உள்ள நிபுணர்களுக்கு மட்டும்',
    },
  },
  {
    key: 'hasPuccaHouse',
    type: 'boolean',
    question: {
      en: 'Do you have a pucca (concrete) house?',
      hi: 'क्या आपके पास पक्का मकान है?',
      te: 'మీకు పక్కా (సిమెంట్) ఇల్లు ఉందా?',
      ta: 'உங்களுக்கு பக்கா (கான்கிரீட்) வீடு உள்ளதா?',
    },
  },
  {
    key: 'hasLpgConnection',
    type: 'boolean',
    question: {
      en: 'Does your household have an LPG gas connection?',
      hi: 'क्या आपके घर में एलपीजी गैस कनेक्शन है?',
      te: 'మీ ఇంట్లో ఎల్పీజీ గ్యాస్ కనెక్షన్ ఉందా?',
      ta: 'உங்கள் வீட்டில் எல்பிஜி எரிவாயு இணைப்பு உள்ளதா?',
    },
  },
  {
    key: 'hasBankAccount',
    type: 'boolean',
    question: {
      en: 'Do you have a bank account?',
      hi: 'क्या आपका बैंक खाता है?',
      te: 'మీకు బ్యాంక్ ఖాతా ఉందా?',
      ta: 'உங்களுக்கு வங்கிக் கணக்கு உள்ளதா?',
    },
  },
  {
    key: 'hasAadhaar',
    type: 'boolean',
    question: {
      en: 'Do you have an Aadhaar card?',
      hi: 'क्या आपके पास आधार कार्ड है?',
      te: 'మీ వద్ద ఆధార్ కార్డు ఉందా?',
      ta: 'உங்களிடம் ஆதார் அட்டை உள்ளதா?',
    },
  },
  {
    key: 'maritalStatus',
    type: 'enum',
    sensitive: true,
    question: {
      en: 'What is your marital status?',
      hi: 'आपकी वैवाहिक स्थिति क्या है?',
      te: 'మీ వైవాహిక స్థితి ఏమిటి?',
      ta: 'உங்கள் திருமண நிலை என்ன?',
    },
    options: [
      { value: 'single', label: { en: 'Unmarried', hi: 'अविवाहित', te: 'అవివాహితులు', ta: 'திருமணமாகாதவர்' } },
      { value: 'married', label: { en: 'Married', hi: 'विवाहित', te: 'వివాహితులు', ta: 'திருமணமானவர்' } },
      { value: 'widowed', label: { en: 'Widowed', hi: 'विधवा/विधुर', te: 'వితంతువు', ta: 'விதவை/விதுரர்' } },
      { value: 'divorced', label: { en: 'Divorced', hi: 'तलाकशुदा', te: 'విడాకులు తీసుకున్నారు', ta: 'விவாகரத்து செய்யப்பட்டவர்' } },
    ],
  },
  {
    key: 'familySize',
    type: 'number',
    unit: 'people',
    quickPicks: [1, 2, 4, 6],
    question: {
      en: 'How many people are in your family?',
      hi: 'आपके परिवार में कितने लोग हैं?',
      te: 'మీ కుటుంబంలో ఎంతమంది ఉన్నారు?',
      ta: 'உங்கள் குடும்பத்தில் எத்தனை பேர் உள்ளனர்?',
    },
  },
  {
    key: 'numGirlChildrenUnder10',
    type: 'number',
    quickPicks: [1, 2],
    question: {
      en: 'How many girls under 10 do you have?',
      hi: 'आपकी 10 साल से कम उम्र की कितनी बेटियां हैं?',
      te: 'మీకు 10 సంవత్సరాల లోపు ఎంతమంది కుమార్తెలు ఉన్నారు?',
      ta: 'உங்களுக்கு 10 வயதுக்குட்பட்ட எத்தனை பெண் குழந்தைகள் உள்ளனர்?',
    },
  },
  {
    key: 'disabilityPercent',
    type: 'number',
    unit: 'percent',
    quickPicks: [40, 50, 75],
    question: {
      en: 'What is your disability percentage, if any?',
      hi: 'यदि है, तो आपकी दिव्यांगता कितने प्रतिशत है?',
      te: 'ఉంటే, మీ వైకల్యం శాతం ఎంత?',
      ta: 'இருந்தால், உங்கள் மாற்றுத்திறன் சதவீதம் என்ன?',
    },
  },
  {
    key: 'isPregnantOrLactating',
    type: 'boolean',
    sensitive: true,
    question: {
      en: 'Are you currently pregnant or breastfeeding?',
      hi: 'क्या आप गर्भवती हैं या स्तनपान करा रही हैं?',
      te: 'మీరు ప్రస్తుతం గర్భవతిగా ఉన్నారా లేదా పాలిస్తున్నారా?',
      ta: 'நீங்கள் தற்போது கர்ப்பமாக உள்ளீர்களா அல்லது பாலூட்டுகிறீர்களா?',
    },
  },
  {
    key: 'educationLevel',
    type: 'enum',
    question: {
      en: 'What is your highest level of education?',
      hi: 'आपकी सबसे ऊंची शिक्षा कौन सी है?',
      te: 'మీ అత్యున్నత విద్యార్హత ఏమిటి?',
      ta: 'உங்கள் உயர்ந்த கல்வித் தகுதி என்ன?',
    },
    options: [
      { value: 'none', label: { en: 'No formal schooling', hi: 'कोई औपचारिक शिक्षा नहीं', te: 'అధికారిక చదువు లేదు', ta: 'முறையான கல்வி இல்லை' } },
      { value: 'primary', label: { en: 'Primary school', hi: 'प्राथमिक शिक्षा', te: 'ప్రాథమిక విద్య', ta: 'ஆரம்பப் பள்ளி' } },
      { value: 'secondary', label: { en: 'Secondary school (10th)', hi: 'माध्यमिक शिक्षा (10वीं)', te: 'మాధ్యమిక విద్య (10వ తరగతి)', ta: 'இடைநிலைப் பள்ளி (10ஆம் வகுப்பு)' } },
      { value: 'higher_secondary', label: { en: 'Higher secondary (12th)', hi: 'उच्च माध्यमिक (12वीं)', te: 'ఉన్నత మాధ్యమిక (12వ తరగతి)', ta: 'மேல்நிலைப் பள்ளி (12ஆம் வகுப்பு)' } },
      { value: 'graduate', label: { en: 'Graduate', hi: 'स्नातक', te: 'గ్రాడ్యుయేట్', ta: 'பட்டதாரி' } },
      { value: 'postgraduate', label: { en: 'Postgraduate', hi: 'स्नातकोत्तर', te: 'పోస్ట్ గ్రాడ్యుయేట్', ta: 'முதுகலைப் பட்டதாரி' } },
    ],
  },
];

export const FIELD_MAP: Record<FieldKey, FieldDef> = FIELDS.reduce(
  (acc, f) => {
    acc[f.key] = f;
    return acc;
  },
  {} as Record<FieldKey, FieldDef>,
);

export function getFieldDef(key: FieldKey): FieldDef {
  const def = FIELD_MAP[key];
  if (!def) throw new Error(`No FieldDef registered for field "${key}"`);
  return def;
}
