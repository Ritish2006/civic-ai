"""
Smart Bharat – RAG Knowledge Base
Loads official Indian government documents into ChromaDB for retrieval.
"""
import os
import logging
from typing import List, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.schema import Document
from backend.config import settings

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────
# Government knowledge base (built-in corpus)
# ─────────────────────────────────────────
GOVT_KNOWLEDGE = [
    {
        "id": "pmkisan_001",
        "title": "PM Kisan Samman Nidhi Yojana",
        "source": "pmkisan.gov.in",
        "content": """PM Kisan Samman Nidhi Scheme Overview:
The Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector scheme with 100% funding from Government of India.
It provides income support of Rs.6000 per year in three equal installments of Rs.2000 every four months to all land holding farmers' families.

Eligibility:
- Small and marginal farmers with combined land holding up to 2 hectares
- Must be Indian citizen with Aadhaar number
- Active bank account required (linked to Aadhaar)

Exclusions:
- Former/current holders of Constitutional positions
- Former/current Ministers, MPs, MLAs
- Current/retired officers of Central/State Governments (except Group D)
- Income tax payers (last assessment year)
- Professionals like doctors, engineers, lawyers

How to Apply:
1. Visit pmkisan.gov.in
2. Click "New Farmer Registration"
3. Enter Aadhaar number, mobile and captcha
4. Fill personal and land details
5. Submit and note the reference number
6. BLO (Block Level Officer) will verify details

Required Documents:
- Aadhaar Card (mandatory)
- Bank account details with IFSC code
- Land records (Khasra/Khatauni/Patta/RoR)
- Mobile number linked to Aadhaar

Helpline: 155261 or 011-24300606
Website: pmkisan.gov.in
Installment Status: Check at pmkisan.gov.in → Beneficiary Status"""
    },
    {
        "id": "ayushman_001",
        "title": "Ayushman Bharat PM-JAY Health Insurance",
        "source": "pmjay.gov.in",
        "content": """Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY):
World's largest government-funded health insurance scheme providing health cover of Rs. 5 lakh per family per year.

Eligibility:
Based on Socio-Economic Caste Census (SECC) 2011 data:
- Rural: Families in deprived categories (D1-D7) and occupational categories
- Urban: 11 occupational categories of workers (rag pickers, domestic workers, etc.)
- Over 10.74 crore families (approx 50 crore beneficiaries)

Benefits:
- Health cover of Rs.5 lakh per family per year
- Covers pre and post hospitalization expenses
- Cashless treatment at 25,000+ empanelled hospitals
- No cap on family size
- Covers pre-existing diseases from Day 1
- 1949 treatment procedures covered

How to Check Eligibility:
1. Visit pmjay.gov.in or call 14555
2. Enter mobile number and Aadhaar
3. Or visit nearest Ayushman Mitra at empanelled hospital

How to Avail:
1. Visit Ayushman Mitra at hospital
2. Verify identity via biometric/OTP
3. Get Ayushman card printed on spot
4. Avail cashless treatment

Helpline: 14555 (Toll-free, 24x7)
Website: pmjay.gov.in"""
    },
    {
        "id": "passport_001",
        "title": "Passport Application Process India",
        "source": "passportindia.gov.in",
        "content": """Passport Services in India - Complete Guide:

Types of Passports:
- Type P (Personal): For general travel
- Type D (Diplomatic): For government officials
- Type O (Official): For government employees on official duty

Application Types:
1. Fresh Passport (New)
2. Reissue (Renewal or correction)
3. Tatkaal (Emergency - 7 day processing)

Step-by-Step Application Process:
1. Register on passportindia.gov.in
2. Fill application form (fresh/reissue)
3. Upload photo and signature
4. Pay fees online (SBI, debit/credit card, net banking)
5. Book appointment at nearest PSK/POPSK/Passport Adalat
6. Visit PSK with original documents + photocopies
7. Biometric capture and document verification
8. Police verification (normal scheme)
9. Passport dispatched by Speed Post

Processing Time:
- Normal: 30-45 working days
- Tatkaal: 3-7 working days

Fees:
- Fresh Normal (36 pages): Rs.1500
- Fresh Normal (60 pages): Rs.2000
- Fresh Tatkaal (36 pages): Rs.3500
- Fresh Tatkaal (60 pages): Rs.4000
- Reissue Normal: Rs.1500

Required Documents:
Identity Proof (any one): Aadhaar, Voter ID, PAN, Driving License
Date of Birth Proof: Birth Certificate, Aadhaar, Matriculation Certificate
Address Proof: Aadhaar, Utility Bill (last 3 months), Bank Passbook
- 2 Passport-size photographs (white background, 51x51mm)

Helpline: 1800-258-1800 (Toll-free)
Track Application: track.passportindia.gov.in
Website: passportindia.gov.in"""
    },
    {
        "id": "aadhaar_001",
        "title": "Aadhaar Card Services UIDAI",
        "source": "uidai.gov.in",
        "content": """Aadhaar Card - Complete Services Guide (UIDAI):

What is Aadhaar:
Aadhaar is a 12-digit unique identification number issued by UIDAI to residents of India.

Services Available:

1. Download e-Aadhaar:
- Visit myaadhaar.uidai.gov.in
- Enter Aadhaar/EID/VID
- Verify via OTP on registered mobile
- Download password-protected PDF (password: Name + DOB YYYY format)

2. Update Aadhaar Online:
- Mobile/Email update: myaadhaar.uidai.gov.in
- Address update via valid documents
- Name, DOB, Gender: Visit Aadhaar Seva Kendra

3. Lock/Unlock Aadhaar:
- Biometric lock: Prevents misuse of biometrics
- Visit myaadhaar.uidai.gov.in → Lock/Unlock Aadhaar
- Can unlock anytime with OTP

4. Virtual ID (VID):
- Temporary 16-digit number to share instead of Aadhaar
- Generate at myaadhaar.uidai.gov.in

5. Aadhaar-PAN Linking:
- Mandatory by law
- Link at incometax.gov.in or via SMS
- Fee: Rs.1000 if linked after March 2023

Documents for Aadhaar Correction:
Identity: PAN, Passport, Voter ID, Driving License
Address: Bank statement, Utility bill, Rental agreement
Date of Birth: Birth certificate, Passport, Marksheet

Aadhaar Seva Kendra: Locate at appointments.uidai.gov.in
Helpline: 1947 (Toll-free, 24x7 in 12 languages)
Website: uidai.gov.in"""
    },
    {
        "id": "pan_001",
        "title": "PAN Card Application and Services",
        "source": "incometaxindia.gov.in",
        "content": """PAN (Permanent Account Number) - Complete Guide:

What is PAN:
PAN is a 10-character alphanumeric identifier issued by Income Tax Department.
Example: ABCDE1234F (first 5 alpha, next 4 numeric, last 1 alpha)

Why PAN is needed:
- Filing Income Tax Returns
- Opening bank accounts
- Property transactions above Rs.5 lakh
- Cash transactions above Rs.50,000
- Passport application
- Mutual fund investments above Rs.50,000

How to Apply (New PAN):
Option 1 - NSDL Portal:
1. Visit onlineservices.nsdl.com/paam/endUserRegisterContact.html
2. Select Form 49A (Indian citizens) or 49AA (foreigners)
3. Fill personal details, upload photo and signature
4. Pay fee and submit
5. Receive PAN in 15 working days

Option 2 - UTIITSL:
1. Visit utiitsl.com
2. Fill online application
3. Upload documents and pay

Option 3 - Instant e-PAN (Free):
- For Aadhaar holders with linked mobile number
- Visit incometax.gov.in → Quick Links → Instant e-PAN
- Enter Aadhaar, verify OTP, get e-PAN in 10 minutes

Fees:
- Physical PAN: Rs.107 (within India), Rs.1017 (foreign address)
- e-PAN: Rs.72

Required Documents:
Identity: Aadhaar/Passport/Voter ID
Address: Aadhaar/Utility bill/Bank statement
Date of Birth: Aadhaar/Birth certificate/Passport

Aadhaar-PAN Linking:
- Mandatory for all Indian citizens
- Visit incometax.gov.in → e-File → Aadhaar Link
- Or SMS: UIDPAN<12-digit Aadhaar><PAN> to 567678 or 56161

Helpline: 1800-103-0025 (Toll-free)
TIN Helpline: 020-27218080"""
    },
    {
        "id": "voter_001",
        "title": "Voter ID Registration and Services",
        "source": "voters.eci.gov.in",
        "content": """Voter ID (EPIC) Registration Guide - Election Commission of India:

Eligibility:
- Indian citizen
- Minimum age: 18 years as on January 1 of the qualifying year
- Ordinarily resident of the constituency

How to Register as New Voter:
Online:
1. Visit voters.eci.gov.in
2. Click "Register as New Voter"
3. Fill Form 6 with personal details
4. Upload address proof and photo
5. Submit - reference number generated
6. BLO visits for verification
7. EPIC card dispatched by post

Via Voter Helpline App:
1. Download "Voter Helpline" app
2. Register and fill Form 6
3. Track status in real-time

Required Documents:
- Photo (passport size)
- Proof of Age: Aadhaar, Birth certificate, Passport, 10th marksheet
- Proof of Residence: Aadhaar, Utility bill, Bank passbook, Passport

Services Available:
- New Registration (Form 6)
- Correction of entries (Form 8)
- Deletion/Inclusion (Form 7)
- Migration to new address (Form 6)
- Online address update (Form 8A)

Check Name in Voter List:
- voters.eci.gov.in → Search Electoral Roll
- Enter name, DoB and state

Voter ID is valid across India for voting.
NRI voters can register using Form 6A.

Helpline: 1950 (Toll-free)
Website: voters.eci.gov.in"""
    },
    {
        "id": "driving_001",
        "title": "Driving License Application India",
        "source": "parivahan.gov.in",
        "content": """Driving License - Complete Application Guide (Parivahan):

Types:
- Learner License (LL): Temporary license for practice
- Driving License (DL): Permanent license after passing test
- International Driving Permit (IDP): For driving abroad

Vehicle Categories:
- MCWOG: Motorcycles without gear (Gearless/scooter) - age 16+
- MCG: Motorcycles with gear - age 18+
- LMV: Light Motor Vehicle (car) - age 18+
- HMV: Heavy Motor Vehicle - age 20+ (with LMV license for 1 year)

Step-by-Step Process:

Phase 1 - Learner License:
1. Visit parivahan.gov.in → Driving License → Apply for Learner License
2. Fill form with personal details
3. Select vehicle class
4. Pay LL fee (Rs.200 approx.)
5. Book slot for online LL test at RTO
6. Appear for computer-based test (30 questions)
7. Pass 18/30 questions to get LL
8. LL valid for 6 months (minimum 30 days required before DL test)

Phase 2 - Permanent Driving License:
1. Visit parivahan.gov.in after 30 days of holding LL
2. Apply for DL test slot at RTO
3. Pay DL fee (Rs.400-700 depending on vehicle class)
4. Appear with vehicle for driving test
5. DL dispatched to address by post (7-10 working days)

Required Documents:
- Aadhaar/Passport/Voter ID (Identity + Age proof)
- Aadhaar/Utility Bill (Address proof)
- Medical Certificate Form 1/1A (for commercial vehicles)
- Passport-size photographs (2)
- Learner License (for DL application)

Fees (approximate):
- Learner License: Rs.150-200 per vehicle class
- Driving License: Rs.200-400 per vehicle class
- Renewal: Rs.200 + Rs.300 penalty if expired >30 days

Driving License Renewal:
- Apply 1 month before expiry at parivahan.gov.in
- No test required if renewed within 5 years of expiry

Helpline: 1800-120-1553
Website: parivahan.gov.in (Sarathi portal)"""
    },
    {
        "id": "mudra_001",
        "title": "PM Mudra Loan Scheme",
        "source": "mudra.org.in",
        "content": """Pradhan Mantri MUDRA Yojana (PMMY) - Small Business Loan:

Objective:
Provide collateral-free loans up to Rs.10 lakh to non-corporate, non-farm micro and small enterprises.

Loan Categories:
1. Shishu: Loans up to Rs.50,000 (for startups/early stage)
2. Kishore: Loans from Rs.50,001 to Rs.5 lakh (for established businesses needing growth)
3. Tarun: Loans from Rs.5 lakh to Rs.10 lakh (for businesses needing expansion)

Eligibility:
- Any Indian citizen with business plan for non-farm income activities
- Traders, shopkeepers, artisans, food processors, textile units, etc.
- Age: 18-65 years
- No collateral required
- Good credit history preferred (CIBIL score 650+)

Activities Covered:
- Food processing, textile, clothing
- Trading, shopkeeping
- Repairing (vehicles, electronics, etc.)
- Beauty parlors, salons
- Medicine shops, grocery stores
- Transport (auto-rickshaw, goods transport)
- Artisans and craftsmen

How to Apply:
1. Visit nearest bank, MFI or NBFC
2. Apply on mudra.org.in (Udyami Mitra portal)
3. Fill application with business details
4. Submit documents
5. Bank processes in 7-10 working days

Required Documents:
- Aadhaar Card
- PAN Card
- Business proof/Registration
- Bank statement (6 months)
- 2 passport photographs
- Business plan/quotation for equipment

Interest Rate: Varies by bank, typically 8-12% p.a.
Repayment: Up to 5 years

Helpline: 1800-180-1111
Website: mudra.org.in | udyamimitra.in"""
    },
    {
        "id": "scholarship_001",
        "title": "National Scholarship Portal India",
        "source": "scholarships.gov.in",
        "content": """National Scholarship Portal (NSP) - Complete Guide:

What is NSP:
Single platform for all central and state government scholarships for students from pre-matric to PhD level.

Major Scholarships Available:

Central Schemes:
1. Pre-Matric Scholarship (Class 9-10) - SC/ST/OBC/Minority
2. Post-Matric Scholarship (Class 11 onwards) - SC/ST/OBC/Minority
3. Merit-cum-Means Scholarship - Minority students
4. National Means-cum-Merit Scholarship (NMMS) - Class 8 students
5. Central Sector Scholarship - Top merit students from state boards

For SC Students:
- Pre-Matric: Rs.225-525/month + maintenance
- Post-Matric (Class 11-12): Rs.230-380/month
- Post-Matric (Graduation+): Rs.900-1200/month

For ST Students:
- Similar amounts, managed by Ministry of Tribal Affairs

For Minority Students (Muslim/Christian/Sikh/Buddhist/Jain/Parsi):
- Pre-Matric: 30% seats reserved for girls
- Post-Matric: Rs.3000-10,000/year
- Merit-cum-Means: 50% for girls

OBC Students:
- Post-Matric: Up to Rs.15,000 for professional courses

Eligibility (General):
- Indian citizen
- Annual family income below Rs.2.5 lakh (varies by scheme)
- Minimum 50% marks in qualifying exam (varies)
- Enrolled in recognized institution

How to Apply:
1. Visit scholarships.gov.in
2. Register with Aadhaar-linked mobile
3. Select scheme and fill application
4. Upload documents (marksheet, income certificate, caste certificate, bank details)
5. Apply before deadline (October-November typically)
6. Track status on portal

Bank account must be linked to Aadhaar for DBT.
Helpline: 0120-6619540
Website: scholarships.gov.in"""
    },
    {
        "id": "itr_001",
        "title": "Income Tax Return Filing India",
        "source": "incometax.gov.in",
        "content": """Income Tax Return (ITR) Filing Guide:

Who must file ITR:
- Income above basic exemption limit (Rs.2.5 lakh for <60 years, Rs.3 lakh for 60-79, Rs.5 lakh for 80+)
- Those with foreign assets or income
- Depositing >Rs.1 crore in bank in a year
- Foreign travel expenses >Rs.2 lakh in a year
- Electricity bill >Rs.1 lakh in a year

ITR Forms:
- ITR-1 (Sahaj): Salaried, one house property, other sources (income <Rs.50L)
- ITR-2: Multiple house properties, capital gains, foreign income
- ITR-3: Business/profession income
- ITR-4 (Sugam): Presumptive income (44AD/44ADA/44AE)

Due Dates:
- Individuals (no audit): July 31 of assessment year
- Business requiring audit: October 31
- Belated return: December 31 (with penalty)

How to File Online:
1. Visit incometax.gov.in
2. Login with PAN and password (register if new)
3. Go to e-File → File Income Tax Return
4. Select assessment year and ITR form
5. Fill income details, deductions, TDS
6. Verify using Aadhaar OTP, EVC, or DSC
7. File and download acknowledgment (ITR-V)

New vs Old Tax Regime (FY 2024-25):
New Regime (Default):
- No deductions (80C, HRA, etc.)
- Lower tax rates: 0% up to Rs.3L, 5% (3-7L), 10% (7-10L), 15% (10-12L), 20% (12-15L), 30% above 15L
- Standard deduction Rs.75,000 for salaried

Old Regime:
- All deductions allowed (80C up to 1.5L, HRA, LTA, etc.)
- Higher tax rates

Check Refund Status: incometax.gov.in → My Account → Refund/Demand Status
Helpline: 1800-103-0025 (Toll-free)"""
    },
    {
        "id": "pmay_001",
        "title": "PM Awas Yojana Housing Scheme",
        "source": "pmaymis.gov.in",
        "content": """Pradhan Mantri Awas Yojana (PMAY) - Housing for All:

Two Components:
1. PMAY-Urban (PMAY-U): For cities and towns
2. PMAY-Gramin (PMAY-G): For rural areas

PMAY-Urban:
Target: Provide housing to all urban poor by 2022 (extended to 2024)

Beneficiary Categories:
- EWS (Economically Weaker Section): Annual income up to Rs.3 lakh
- LIG (Lower Income Group): Annual income Rs.3-6 lakh
- MIG-I (Middle Income Group): Annual income Rs.6-12 lakh
- MIG-II: Annual income Rs.12-18 lakh

Benefits/Subsidy:
- EWS/LIG: Interest subsidy of 6.5% on loan up to Rs.6 lakh
- MIG-I: Interest subsidy of 4% on loan up to Rs.9 lakh
- MIG-II: Interest subsidy of 3% on loan up to Rs.12 lakh

Conditions:
- Beneficiary family should not own a pucca house in India
- For EWS/LIG: Female member as owner/co-owner mandatory
- First-time home buyer preferred

How to Apply (Urban):
1. Visit pmaymis.gov.in or nearest bank/HFC
2. Check eligibility at pmaymis.gov.in
3. Apply through bank/housing finance company
4. Subsidy credited directly to loan account

PMAY-Gramin:
- Financial assistance of Rs.1.2 lakh (plain areas) or Rs.1.3 lakh (NE/hilly)
- Plus Rs.12,000 for toilet under Swachh Bharat Mission
- For BPL/SC/ST/minorities in rural areas

Helpline: 1800-11-6446 (Urban) / 1800-11-8111 (Gramin)
Website: pmaymis.gov.in"""
    }
]


class RAGKnowledgeBase:
    """Manages the ChromaDB vector store for government documents."""

    def __init__(self):
        self.embeddings = None
        self.vectorstore = None
        self._initialized = False

    def _get_embeddings(self):
        """Initialize Google embeddings (lazy load)."""
        if not self.embeddings:
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=settings.gemini_api_key
            )
        return self.embeddings

    def initialize(self, force_rebuild: bool = False):
        """Initialize or load the ChromaDB vector store."""
        os.makedirs(settings.chroma_persist_dir, exist_ok=True)

        if not settings.gemini_api_key:
            logger.warning("GEMINI_API_KEY not set. RAG disabled.")
            return

        try:
            embeddings = self._get_embeddings()
            chroma_path = settings.chroma_persist_dir
            collection = settings.chroma_collection

            # Check if collection already exists
            existing = Chroma(
                collection_name=collection,
                embedding_function=embeddings,
                persist_directory=chroma_path,
            )

            if force_rebuild or existing._collection.count() == 0:
                logger.info("Building knowledge base from government documents...")
                self._ingest_documents(embeddings, chroma_path, collection)
            else:
                logger.info(f"Loaded existing knowledge base ({existing._collection.count()} chunks).")
                self.vectorstore = existing

            self._initialized = True
        except Exception as e:
            logger.error(f"RAG initialization failed: {e}")

    def _ingest_documents(self, embeddings, chroma_path: str, collection: str):
        """Chunk and embed government documents into ChromaDB."""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150,
            separators=["\n\n", "\n", ".", " "],
        )

        docs: List[Document] = []
        for item in GOVT_KNOWLEDGE:
            chunks = splitter.split_text(item["content"])
            for i, chunk in enumerate(chunks):
                docs.append(Document(
                    page_content=chunk,
                    metadata={
                        "id": f"{item['id']}_{i}",
                        "title": item["title"],
                        "source": item["source"],
                        "chunk": i,
                    }
                ))

        self.vectorstore = Chroma.from_documents(
            documents=docs,
            embedding=embeddings,
            collection_name=collection,
            persist_directory=chroma_path,
        )
        logger.info(f"Ingested {len(docs)} document chunks into ChromaDB.")

    def retrieve(self, query: str, k: int = 4) -> List[Document]:
        """Retrieve top-k relevant documents for a query."""
        if not self._initialized or not self.vectorstore:
            return []
        try:
            return self.vectorstore.similarity_search(query, k=k)
        except Exception as e:
            logger.error(f"Retrieval error: {e}")
            return []

    def add_document(self, content: str, metadata: dict):
        """Add a new document to the knowledge base at runtime."""
        if not self.vectorstore:
            return
        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
        chunks = splitter.split_text(content)
        docs = [Document(page_content=c, metadata=metadata) for c in chunks]
        self.vectorstore.add_documents(docs)


# Singleton instance
knowledge_base = RAGKnowledgeBase()
