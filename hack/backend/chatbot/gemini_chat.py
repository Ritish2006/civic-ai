"""
Smart Bharat – Gemini AI Chatbot with LangChain RAG
"""
import logging
from typing import List, Optional, AsyncGenerator
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.schema.output_parser import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from backend.config import settings
from backend.rag.knowledge_base import knowledge_base

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────
# System Prompt
# ─────────────────────────────────────────
SYSTEM_PROMPT = """You are Smart Bharat AI – India's most helpful and knowledgeable civic assistant, powered by Gemini AI.

Your mission: Help Indian citizens navigate government services, schemes, and processes with clarity and empathy.

You excel at:
🌾 Government Schemes – PM Kisan, Ayushman Bharat, PMAY, Mudra Loan, Scholarships
🪪 Documents – Passport, Aadhaar, PAN, Voter ID, Driving License, Birth/Income Certificates
💰 Tax – ITR filing, GST, TDS, tax saving investments
🎓 Education – Scholarships, skill development, education loans
🏥 Health – PMJAY, CGHS, state health insurance
🏠 Housing – PM Awas Yojana, affordable housing schemes
📋 Complaints – Grievance filing guidance, department routing
🗳️ Elections – Voter registration, polling processes

CONTEXT FROM OFFICIAL DOCUMENTS:
{context}

RULES:
1. Always respond in the user's language: {language}
2. Use the provided context when available; if not, use your training knowledge
3. Cite official portals (passportindia.gov.in, pmkisan.gov.in, uidai.gov.in, etc.)
4. Provide official helpline numbers whenever relevant
5. Use clear markdown formatting: bold for important info, numbered lists for steps, tables for comparisons
6. Be empathetic – many users may be first-time digital service users
7. For eligibility queries, always list both eligible and excluded categories
8. Always mention: processing time, fees, required documents for any service
9. If unsure, say so clearly and direct to official portals
10. Never share political opinions or criticize government policies

FORMAT YOUR RESPONSES WITH:
- ## Section Headers for main topics
- **Bold** for key terms, amounts, deadlines
- Numbered lists for steps
- Bullet points for requirements/benefits
- 📞 for helpline numbers
- 🌐 for website links
- ✅ for eligibility/benefits
- ❌ for exclusions"""

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi (हिन्दी)", "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)", "kn": "Kannada (ಕನ್ನಡ)", "ml": "Malayalam (മലയാളം)"
}


class SmartBharatChatbot:
    """LangChain-powered chatbot with Gemini AI and RAG."""

    def __init__(self):
        self._llm = None
        self._llm_pro = None

    def _get_llm(self, pro: bool = False) -> ChatGoogleGenerativeAI:
        """Lazy-initialize Gemini LLM."""
        if pro:
            if not self._llm_pro:
                self._llm_pro = ChatGoogleGenerativeAI(
                    model=settings.gemini_pro_model,
                    google_api_key=settings.gemini_api_key,
                    temperature=0.4,
                    max_output_tokens=2048,
                )
            return self._llm_pro
        else:
            if not self._llm:
                self._llm = ChatGoogleGenerativeAI(
                    model=settings.gemini_model,
                    google_api_key=settings.gemini_api_key,
                    temperature=0.5,
                    max_output_tokens=1536,
                )
            return self._llm

    def _build_context(self, query: str) -> tuple[str, list]:
        """Retrieve relevant documents and build context string."""
        docs = knowledge_base.retrieve(query, k=4)
        if not docs:
            return "", []

        context_parts = []
        sources = []
        for doc in docs:
            context_parts.append(
                f"[Source: {doc.metadata.get('title', 'Government Document')} | {doc.metadata.get('source', '')}]\n"
                f"{doc.page_content}"
            )
            src = {"title": doc.metadata.get("title", ""), "url": f"https://{doc.metadata.get('source', '')}"}
            if src not in sources:
                sources.append(src)

        return "\n\n---\n\n".join(context_parts), sources

    def _build_history(self, history: List[dict]) -> List:
        """Convert conversation history to LangChain message objects."""
        messages = []
        for msg in history[-10:]:  # Last 10 messages for context window
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
        return messages

    async def chat(
        self,
        user_message: str,
        conversation_history: Optional[List[dict]] = None,
        language: str = "en",
        use_pro: bool = False,
    ) -> dict:
        """Generate a RAG-enhanced AI response."""
        if not settings.gemini_api_key:
            return {
                "content": self._fallback_response(user_message),
                "sources": [],
                "model": "demo"
            }

        try:
            # Step 1: Retrieve relevant context from knowledge base
            context, sources = self._build_context(user_message)

            # Step 2: Build message history
            history = self._build_history(conversation_history or [])
            lang_name = LANGUAGE_NAMES.get(language, "English")

            # Step 3: Build prompt
            system_msg = SYSTEM_PROMPT.format(
                context=context if context else "No specific documents retrieved. Use general knowledge.",
                language=lang_name
            )

            # Step 4: Combine into messages list
            messages = [SystemMessage(content=system_msg)] + history + [HumanMessage(content=user_message)]

            # Step 5: Call Gemini
            llm = self._get_llm(pro=use_pro)
            response = await llm.ainvoke(messages)
            content = response.content

            return {
                "content": content,
                "sources": sources,
                "model": settings.gemini_pro_model if use_pro else settings.gemini_model,
                "context_used": bool(context),
            }

        except Exception as e:
            logger.error(f"Chat error: {e}")
            return {
                "content": f"⚠️ I encountered an error: {str(e)}\n\nPlease check your API key or try again.",
                "sources": [],
                "model": "error"
            }

    async def stream_chat(
        self,
        user_message: str,
        conversation_history: Optional[List[dict]] = None,
        language: str = "en",
    ) -> AsyncGenerator[str, None]:
        """Stream response token by token."""
        if not settings.gemini_api_key:
            text = self._fallback_response(user_message)
            for char in text:
                yield char
            return

        try:
            context, sources = self._build_context(user_message)
            history = self._build_history(conversation_history or [])
            lang_name = LANGUAGE_NAMES.get(language, "English")

            system_msg = SYSTEM_PROMPT.format(
                context=context if context else "Use your general knowledge about Indian government services.",
                language=lang_name
            )
            messages = [SystemMessage(content=system_msg)] + history + [HumanMessage(content=user_message)]

            llm = self._get_llm()
            async for chunk in llm.astream(messages):
                if chunk.content:
                    yield chunk.content

        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"\n\n⚠️ Error: {str(e)}"

    async def recommend_schemes(self, profile: dict, language: str = "en") -> str:
        """AI-powered scheme recommendation based on user profile."""
        prompt = f"""Based on this citizen profile, recommend the most suitable Indian government schemes:

Profile:
- Age: {profile.get('age', 'Unknown')}
- Gender: {profile.get('gender', 'Unknown')}
- State: {profile.get('state', 'Unknown')}
- Occupation: {profile.get('occupation', 'Unknown')}
- Annual Income: ₹{profile.get('income', 'Unknown')}
- Category: {profile.get('category', 'General')}

Respond in {LANGUAGE_NAMES.get(language, 'English')}.

For each recommended scheme, provide:
1. **Scheme Name** and Ministry
2. **Why Eligible** – specific to the profile
3. **Key Benefits** – amounts, coverage
4. **How to Apply** – portal link
5. **Documents Needed**

List at least 4-6 schemes. Be specific about eligibility match."""

        try:
            llm = self._get_llm()
            response = await llm.ainvoke([HumanMessage(content=prompt)])
            return response.content
        except Exception as e:
            logger.error(f"Scheme recommendation error: {e}")
            return "Unable to generate recommendations. Please try again."

    async def categorize_complaint(self, description: str) -> dict:
        """AI categorizes a complaint and generates a formal complaint letter."""
        prompt = f"""Analyze this civic complaint and respond ONLY with valid JSON (no markdown):

Complaint: "{description}"

{{
  "category": "one of: Road Damage, Garbage, Water Leakage, Electricity, Streetlight, Drainage, Public Sanitation, Other",
  "department": "specific department name responsible",
  "priority": "High/Medium/Low",
  "formal_complaint": "a formal 3-paragraph complaint letter for the department",
  "suggested_portals": ["portal1.gov.in", "portal2.gov.in"]
}}"""

        try:
            llm = self._get_llm()
            response = await llm.ainvoke([HumanMessage(content=prompt)])
            import json, re
            text = response.content.strip()
            # Strip markdown code blocks if present
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
            return json.loads(text)
        except Exception as e:
            logger.error(f"Complaint categorization error: {e}")
            return {
                "category": "Other",
                "department": "Municipal Corporation",
                "priority": "Medium",
                "formal_complaint": f"Dear Sir/Madam,\n\nI wish to report the following civic issue:\n\n{description}\n\nI request immediate action.\n\nYours faithfully",
                "suggested_portals": ["pgportal.gov.in"]
            }

    def _fallback_response(self, query: str) -> str:
        """Demo response when no API key is configured."""
        q = query.lower()
        if "pm kisan" in q or "kisan" in q:
            return "## PM Kisan Samman Nidhi 🌾\n\n**₹6,000/year** in 3 installments for small farmers.\n\n**Apply at:** pmkisan.gov.in\n**Helpline:** 155261"
        if "passport" in q:
            return "## Passport Application 🛂\n\n**Portal:** passportindia.gov.in\n**Fee:** ₹1,500 (Normal) | ₹3,500 (Tatkaal)\n**Helpline:** 1800-258-1800"
        if "ayushman" in q or "pmjay" in q:
            return "## Ayushman Bharat PM-JAY 🏥\n\n**Health cover:** ₹5 lakh/family/year\n**Check eligibility:** pmjay.gov.in\n**Helpline:** 14555"
        return "## Smart Bharat AI 🇮🇳\n\nI can help with government schemes, documents (Passport, Aadhaar, PAN), ITR filing, scholarships and more.\n\n**Please add your Gemini API key** in `backend/.env` to enable full AI capabilities.\n\n📞 National Helpline: **1800-11-0001**"


# Singleton
chatbot = SmartBharatChatbot()
