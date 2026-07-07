// Smart Bharat – App Configuration
window.SB = window.SB || {};

SB.config = {
  appName: 'Smart Bharat',
  version: '1.0.0',
  // Replace with your actual Gemini API key
  geminiApiKey: 'YOUR_GEMINI_API_KEY',
  geminiModel: 'gemini-1.5-flash',
  geminiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  // Firebase config (replace with your project)
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID'
  },
  backendUrl: 'http://localhost:8000',
  mapCenter: [20.5937, 78.9629], // India center
  mapZoom: 5
};

// System prompt for civic AI assistant
SB.systemPrompt = `You are Smart Bharat AI – India's most helpful civic AI assistant. You help Indian citizens with:
- Government schemes (PM Kisan, Ayushman Bharat, etc.)
- Documents: Passport, Aadhaar, PAN, Voter ID, Driving License, Birth/Income Certificates
- Tax queries (ITR, GST, TDS)
- Scholarships and education benefits
- Public grievances and complaint redressal
- State and central government services

Rules:
- Always respond in the user's chosen language
- Provide step-by-step guidance when asked
- Cite official government portals (India.gov.in, myGov.in, etc.)
- Be empathetic, clear, and helpful
- Format responses using markdown with clear headings and bullet points
- For schemes, always mention: Eligibility, Benefits, How to Apply, Required Documents
- Always mention official helpline numbers when relevant
- If unsure, direct users to official government portals`;

SB.suggestedQuestions = [
  'How do I apply for PM Kisan Samman Nidhi?',
  'What documents are needed for a new Passport?',
  'How to link Aadhaar with PAN card?',
  'Am I eligible for Ayushman Bharat Yojana?',
  'How to register for Voter ID online?',
  'What is the process for Driving License renewal?',
  'How to check ITR refund status?',
  'List all scholarships for OBC students in Tamil Nadu',
  'How to file a complaint on DigiLocker?',
  'What is PM Awas Yojana eligibility?'
];

SB.languages = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം'
};

SB.govtOffices = [
  { name: 'Regional Passport Office Mumbai', type: 'Passport', lat: 19.0760, lng: 72.8777, address: 'Bhavishya Nidhi Bhavan, Bandra' },
  { name: 'Regional Passport Office Delhi', type: 'Passport', lat: 28.6139, lng: 77.2090, address: 'Patiala House, New Delhi' },
  { name: 'Regional Passport Office Chennai', type: 'Passport', lat: 13.0827, lng: 80.2707, address: 'Shastri Bhavan, Chennai' },
  { name: 'District Collector Office Delhi', type: 'Collector', lat: 28.6448, lng: 77.2167, address: 'Old Secretariat, Delhi' },
  { name: 'District Collector Office Mumbai', type: 'Collector', lat: 19.0821, lng: 72.8416, address: 'New Administrative Building' },
  { name: 'RTO Delhi', type: 'RTO', lat: 28.6600, lng: 77.2300, address: 'Burari, New Delhi' },
  { name: 'RTO Chennai', type: 'RTO', lat: 13.0700, lng: 80.2500, address: 'Guindy, Chennai' },
  { name: 'Delhi Police HQ', type: 'Police', lat: 28.6250, lng: 77.1900, address: 'ITO, New Delhi' },
  { name: 'Mumbai Police HQ', type: 'Police', lat: 18.9400, lng: 72.8347, address: 'Crawford Market, Mumbai' },
  { name: 'Taluk Office Coimbatore', type: 'Taluk', lat: 11.0168, lng: 76.9558, address: 'Coimbatore, Tamil Nadu' },
  { name: 'Taluk Office Jaipur', type: 'Taluk', lat: 26.9124, lng: 75.7873, address: 'Jaipur, Rajasthan' },
  { name: 'Regional Passport Office Kolkata', type: 'Passport', lat: 22.5726, lng: 88.3639, address: 'Shantipath, Kolkata' },
];

SB.govtSchemes = [
  {
    id: 1, name: 'PM Kisan Samman Nidhi', ministry: 'Ministry of Agriculture',
    category: 'Agriculture', tags: ['farmer', 'income support'],
    description: 'Direct income support of ₹6,000/year to small & marginal farmers in three installments.',
    benefits: ['₹6,000 annual benefit', 'Direct bank transfer', 'Covers 14+ crore farmers'],
    eligibility: 'Small & marginal farmers with less than 2 hectares of land.',
    documents: ['Aadhaar Card', 'Bank Passbook', 'Land Records (Khasra/Khatauni)'],
    applyUrl: 'https://pmkisan.gov.in'
  },
  {
    id: 2, name: 'Ayushman Bharat PM-JAY', ministry: 'Ministry of Health',
    category: 'Health', tags: ['health insurance', 'BPL', 'hospital'],
    description: 'Health coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
    benefits: ['₹5 Lakh health cover', 'Cashless treatment', '25,000+ hospitals'],
    eligibility: 'Socially & economically deprived families as per SECC data.',
    documents: ['Aadhaar Card', 'Ration Card', 'SECC eligibility proof'],
    applyUrl: 'https://pmjay.gov.in'
  },
  {
    id: 3, name: 'PM Awas Yojana (Urban)', ministry: 'Ministry of Housing',
    category: 'Housing', tags: ['housing', 'subsidy', 'urban'],
    description: 'Affordable housing for urban poor. Interest subsidy up to 6.5% on home loans.',
    benefits: ['Interest subsidy', 'Affordable housing', 'Credit linked subsidy'],
    eligibility: 'EWS/LIG/MIG families without pucca house.',
    documents: ['Aadhaar', 'Income certificate', 'Domicile proof', 'Bank statement'],
    applyUrl: 'https://pmaymis.gov.in'
  },
  {
    id: 4, name: 'Pradhan Mantri Mudra Yojana', ministry: 'Ministry of Finance',
    category: 'Business', tags: ['loan', 'business', 'MSME'],
    description: 'Collateral-free loans up to ₹10 lakh for non-corporate, non-farm micro enterprises.',
    benefits: ['Loan up to ₹10 Lakh', 'No collateral required', 'Low interest rates'],
    eligibility: 'Non-corporate, non-farm small/micro enterprises.',
    documents: ['Aadhaar', 'PAN', 'Business plan', 'Bank statement (6 months)'],
    applyUrl: 'https://mudra.org.in'
  },
  {
    id: 5, name: 'National Scholarship Portal', ministry: 'Ministry of Education',
    category: 'Education', tags: ['scholarship', 'student', 'minority'],
    description: 'Centralized scholarships for SC/ST/OBC/Minority students for school and higher education.',
    benefits: ['Financial aid', 'Merit-cum-means based', 'Pre & post matric'],
    eligibility: 'SC/ST/OBC/Minority students with income below threshold.',
    documents: ['Aadhaar', 'Income certificate', 'Caste certificate', 'Mark sheets'],
    applyUrl: 'https://scholarships.gov.in'
  },
  {
    id: 6, name: 'Stand Up India', ministry: 'Ministry of Finance',
    category: 'Business', tags: ['women', 'SC/ST', 'entrepreneurship'],
    description: 'Bank loans between ₹10 lakh and ₹1 crore to SC/ST and women borrowers for greenfield enterprises.',
    benefits: ['Loan ₹10L–₹1Cr', 'Women & SC/ST focused', 'Greenfield enterprises'],
    eligibility: 'SC/ST or women borrowers above 18 years, for greenfield projects.',
    documents: ['Aadhaar', 'PAN', 'Business plan', 'Caste/gender certificate'],
    applyUrl: 'https://standupmitra.in'
  }
];

SB.documentServices = {
  passport: {
    name: 'Passport', icon: 'fa-passport',
    description: 'Apply for a new passport or renew your existing passport.',
    processingTime: '30–45 working days (Normal), 7 days (Tatkaal)',
    fees: { normal: '₹1,500', tatkaal: '₹3,500' },
    requiredDocs: ['Aadhaar Card / Voter ID / PAN (Proof of Identity)', 'Birth Certificate / Aadhaar (Date of Birth proof)', 'Electricity Bill / Bank Statement (Address proof)', 'Recent Passport-size photographs'],
    steps: [
      { title: 'Register on Passport Seva Portal', desc: 'Visit passportindia.gov.in and create an account.' },
      { title: 'Fill Online Application Form', desc: 'Complete the application form with personal details.' },
      { title: 'Pay Fees & Book Appointment', desc: 'Pay online and schedule your PSK/POPSK appointment.' },
      { title: 'Visit Passport Seva Kendra', desc: 'Carry originals and photocopies of all documents.' },
      { title: 'Police Verification', desc: 'Local police will verify your address.' },
      { title: 'Passport Dispatched', desc: 'Passport sent via Speed Post to your address.' }
    ],
    faqs: [
      { q: 'Can I apply online?', a: 'Yes, apply at passportindia.gov.in' },
      { q: 'Is Aadhaar mandatory?', a: 'Not mandatory but accepted as supporting document.' }
    ],
    helpline: '1800-258-1800', portal: 'https://passportindia.gov.in'
  },
  driving: {
    name: 'Driving License', icon: 'fa-car',
    description: 'Apply for a new driving license, learner license, or renewal.',
    processingTime: '30 working days after test',
    fees: { ll: '₹200', dl: '₹400', renewal: '₹200' },
    requiredDocs: ['Aadhaar / Voter ID (Identity proof)', 'Aadhaar / Birth Certificate (Age proof)', 'Utility Bill (Address proof)', 'Medical Certificate (Form 1/1A)', 'Passport-size photographs'],
    steps: [
      { title: 'Apply for Learner License', desc: 'Visit Parivahan portal and apply for LL.' },
      { title: 'Pass Learner License Test', desc: 'Appear for online LL test at RTO.' },
      { title: 'Practice Driving (30 days)', desc: 'Practice driving with LL for at least 30 days.' },
      { title: 'Apply for Driving License', desc: 'Apply online and book driving test slot.' },
      { title: 'Appear for Driving Test', desc: 'Visit RTO and pass the driving skill test.' },
      { title: 'License Dispatched', desc: 'DL sent to your address via post.' }
    ],
    faqs: [
      { q: 'What is the minimum age?', a: '16 years for gearless, 18 years for all vehicles.' },
      { q: 'Can I apply online?', a: 'Yes, via parivahan.gov.in' }
    ],
    helpline: '1800-120-1553', portal: 'https://parivahan.gov.in'
  },
  voter: {
    name: 'Voter ID', icon: 'fa-vote-yea',
    description: 'Register as a voter or get your Voter ID (EPIC) card.',
    processingTime: '30 working days',
    fees: { new: 'Free', duplicate: '₹25' },
    requiredDocs: ['Aadhaar / PAN (Identity proof)', 'Utility Bill / Bank Statement (Address proof)', 'Recent photograph'],
    steps: [
      { title: 'Register on Voter Portal', desc: 'Visit voters.eci.gov.in or download Voter Helpline App.' },
      { title: 'Fill Form 6', desc: 'Fill new voter registration form online.' },
      { title: 'Upload Documents', desc: 'Upload identity and address proof documents.' },
      { title: 'BLO Verification', desc: 'Booth Level Officer verifies your details.' },
      { title: 'Card Dispatched', desc: 'EPIC card sent to your address.' }
    ],
    faqs: [
      { q: 'Minimum age to register?', a: '18 years as of January 1 of the qualifying year.' },
      { q: 'Can NRIs register?', a: 'Yes, NRIs can register as overseas voters.' }
    ],
    helpline: '1950', portal: 'https://voters.eci.gov.in'
  },
  pan: {
    name: 'PAN Card', icon: 'fa-id-card',
    description: 'Apply for a new PAN card or corrections to existing PAN.',
    processingTime: '15 working days',
    fees: { new: '₹107 (physical), ₹72 (e-PAN)', correction: '₹107' },
    requiredDocs: ['Aadhaar / Passport (Identity proof)', 'Aadhaar / Birth Certificate (Date of birth proof)', 'Aadhaar / Utility Bill (Address proof)'],
    steps: [
      { title: 'Visit NSDL/UTIITSL Portal', desc: 'Go to onlineservices.nsdl.com or utiitsl.com.' },
      { title: 'Fill Form 49A / 49AA', desc: 'Fill the PAN application form.' },
      { title: 'Pay Fees Online', desc: 'Pay application fee online.' },
      { title: 'Upload Documents', desc: 'Upload photo, signature, and supporting docs.' },
      { title: 'Biometric (if needed)', desc: 'Some applicants may need biometric verification.' },
      { title: 'PAN Dispatched', desc: 'PAN card sent to your address within 15 days.' }
    ],
    faqs: [
      { q: 'Is Aadhaar mandatory?', a: 'Yes, Aadhaar is required to link with PAN.' },
      { q: 'Can I get an instant e-PAN?', a: 'Yes, using Aadhaar OTP via incometax.gov.in' }
    ],
    helpline: '020-27218080', portal: 'https://onlineservices.nsdl.com'
  }
};
