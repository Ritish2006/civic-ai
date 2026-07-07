// Smart Bharat – API Module (Gemini AI Integration)
SB.api = {

  // Generate AI response via Gemini API
  async chat(userMessage, conversationHistory = []) {
    const key = SB.config.geminiApiKey;
    const lang = SB.i18n.currentLang;
    const langName = SB.languages[lang] || 'English';

    const contents = [
      { role: 'user', parts: [{ text: SB.systemPrompt + `\n\nIMPORTANT: Respond in ${langName} language.` }] },
      { role: 'model', parts: [{ text: 'Understood. I will respond as Smart Bharat AI assistant in ' + langName + '.' }] },
      ...conversationHistory.slice(-8).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    // If no real API key, use demo responses
    if (!key || key === 'YOUR_GEMINI_API_KEY') {
      return this.demoResponse(userMessage);
    }

    const res = await fetch(`${SB.config.geminiEndpoint}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 1024, temperature: 0.7 } })
    });
    if (!res.ok) throw new Error('AI API error: ' + res.status);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
  },

  // Scheme recommender via AI
  async recommendSchemes(profile) {
    const prompt = `Based on the following user profile, recommend the most suitable Indian government schemes:
Profile: Age: ${profile.age}, Gender: ${profile.gender}, State: ${profile.state}, Occupation: ${profile.occupation}, Annual Income: ₹${profile.income}, Category: ${profile.category}

From this list: ${SB.govtSchemes.map(s => s.name).join(', ')}

Also suggest any other relevant schemes. For each scheme provide: Name, Why Eligible, Key Benefits, Apply URL.
Format as a clear markdown list.`;

    const key = SB.config.geminiApiKey;
    if (!key || key === 'YOUR_GEMINI_API_KEY') {
      return this.demoSchemeRecommend(profile);
    }

    const res = await fetch(`${SB.config.geminiEndpoint}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024 }
      })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  },

  // Auto-categorize complaint via AI
  async categorizeComplaint(description) {
    const key = SB.config.geminiApiKey;
    if (!key || key === 'YOUR_GEMINI_API_KEY') {
      const categories = ['Road Damage', 'Garbage', 'Water Leakage', 'Electricity', 'Streetlight', 'Drainage', 'Public Sanitation'];
      return { category: categories[Math.floor(Math.random() * categories.length)], dept: 'Municipal Corporation', formal: `Dear Sir/Madam,\n\nI wish to bring to your attention the following civic issue:\n\n${description}\n\nI request you to kindly look into this matter and take necessary action at the earliest.\n\nThank you.` };
    }

    const prompt = `Categorize this complaint: "${description}"
Categories: Road Damage, Garbage, Water Leakage, Electricity, Streetlight, Drainage, Public Sanitation
Respond as JSON: { "category": "...", "dept": "...", "formal": "formal complaint letter..." }`;

    const res = await fetch(`${SB.config.geminiEndpoint}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    try {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    } catch { return { category: 'Other', dept: 'Municipal Corporation', formal: description }; }
  },

  // Demo responses for development (no API key needed)
  demoResponse(question) {
    const q = question.toLowerCase();
    if (q.includes('pm kisan') || q.includes('kisan')) {
      return `## PM Kisan Samman Nidhi Yojana 🌾

**Overview:** The PM Kisan Samman Nidhi is a Central Sector scheme providing income support to all land-holding farmers' families.

### Key Benefits
- ₹6,000 per year in **3 equal installments** of ₹2,000
- Directly transferred to **bank accounts** via DBT
- Covers **14+ crore** farmer families

### Eligibility
- Small & marginal farmers with **landholding up to 2 hectares**
- Must be an Indian citizen
- Excludes institutional landholders, government employees, taxpayers

### How to Apply
1. Visit **pmkisan.gov.in**
2. Click "New Farmer Registration"
3. Enter Aadhaar number and verify OTP
4. Fill in land details and bank account
5. Submit and note your application ID

### Required Documents
- ✅ Aadhaar Card
- ✅ Bank Passbook (with IFSC code)
- ✅ Land Records (Khasra/Khatauni/Patta)
- ✅ Mobile Number linked to Aadhaar

### Helpline
📞 **PM Kisan Helpline: 155261 / 011-24300606**
🌐 **Portal: pmkisan.gov.in**`;
    }
    if (q.includes('passport')) {
      return `## Passport Application Guide 🛂

### New Passport Application

**Official Portal:** passportindia.gov.in

### Step-by-Step Process
1. **Register** on Passport Seva Portal
2. **Fill Form** online (fresh/reissue)
3. **Pay fees** and book appointment
4. **Visit PSK/POPSK** with documents
5. **Police verification**
6. **Receive passport** by Speed Post

### Fees
| Type | Fee |
|------|-----|
| Fresh (Normal, 36 pages) | ₹1,500 |
| Fresh (Tatkaal, 36 pages) | ₹3,500 |
| Renewal | ₹1,500 |

### Required Documents
- ✅ Proof of Identity (Aadhaar/Voter ID/PAN)
- ✅ Proof of Address (Aadhaar/Utility Bill)
- ✅ Date of Birth proof
- ✅ Passport-size photographs (2)

### Helpline
📞 **1800-258-1800** (Toll-free)`;
    }
    if (q.includes('aadhaar')) {
      return `## Aadhaar Services Guide 🪪

### Available Aadhaar Services

**1. Download e-Aadhaar**
- Visit uidai.gov.in → My Aadhaar → Download Aadhaar
- Enter Aadhaar/EID/VID + OTP

**2. Update Aadhaar Details**
- Online: selfservice.uidai.gov.in (for mobile/email)
- Offline: Visit Aadhaar Seva Kendra

**3. Lock/Unlock Biometrics**
- Visit uidai.gov.in → My Aadhaar → Lock/Unlock Biometrics

**4. Virtual ID (VID) Generation**
- Use VID instead of Aadhaar for privacy

### UIDAI Helpline
📞 **1947** (Toll-free, 24x7)
🌐 **uidai.gov.in**`;
    }
    return `## Smart Bharat AI Assistant 🇮🇳

Thank you for your question! I'm here to help you with all Indian government services.

I can help you with:
- 📋 **Government Schemes** – PM Kisan, Ayushman Bharat, PMAY, Mudra Loan
- 🪪 **Documents** – Passport, Aadhaar, PAN, Voter ID, Driving License
- 🎓 **Scholarships** – NSP, state scholarships, merit schemes
- 💰 **Tax Queries** – ITR filing, TDS, GST
- 🏥 **Health Schemes** – PMJAY, CGHS, state health insurance
- 🏠 **Housing** – PM Awas Yojana, Pradhan Mantri Gramin Awas

**Please ask me a specific question** and I'll provide detailed step-by-step guidance!

💡 *Example: "How do I apply for PM Kisan?" or "What documents needed for a Passport?"*

📞 **National Helpline: 1800-11-0001**`;
  },

  demoSchemeRecommend(profile) {
    const recs = SB.govtSchemes.filter(s => {
      if (profile.occupation === 'farmer' && s.category === 'Agriculture') return true;
      if (parseInt(profile.income) < 300000 && s.category === 'Health') return true;
      if (profile.occupation === 'student' && s.category === 'Education') return true;
      if (profile.occupation === 'business' && s.category === 'Business') return true;
      return true;
    }).slice(0, 4);
    return recs;
  }
};
