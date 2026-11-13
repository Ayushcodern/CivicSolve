"""
CivicSolve AI Microservice — OpenAI Chat Endpoint

POST /api/v1/ai/chat
Accepts a conversation history and returns an AI assistant reply
using the OpenAI Chat Completions API.

The OpenAI API key is read from the OPENAI_API_KEY environment variable.
It is NEVER exposed to the frontend.
"""

import logging
import os

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Pydantic schemas ──────────────────────────────────────────


class ChatMessage(BaseModel):
    """A single message in the conversation."""
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")


class ChatRequest(BaseModel):
    """Request body for the chat endpoint."""
    messages: list[ChatMessage] = Field(
        ...,
        min_length=1,
        description="Conversation history (most recent last)",
    )
    language: str = Field(
        default="en",
        description="UI language hint: 'en' or 'hi'",
    )


class ChatResponse(BaseModel):
    """Response from the chat endpoint."""
    reply: str
    model: str


# ── System prompt ─────────────────────────────────────────────

SYSTEM_PROMPT = """You are CivicSolve Assistant, an AI helper built into the CivicSolve platform — an AI-powered civic innovation exchange for Madhya Pradesh, India.

Your role is to:
1. Help citizens understand and report civic problems (water supply, roads, sanitation, agriculture, public health, electricity).
2. Explain how the CivicSolve platform works: citizens submit complaints → AI classifies & scores them → validated issues are matched to universities & industry partners → teams build solutions → impact is measured.
3. Provide practical guidance on civic issues specific to Madhya Pradesh (MP), including relevant government schemes, helplines (like CM Helpline 181), and local bodies (Gram Panchayat, Nagar Palika, district collectors).
4. Explain the roles: Citizen, University/College teams, Industry mentors, Government officials, and Moderators.
5. Answer questions about how to submit a challenge, track its status, and understand AI analysis results.
6. Help users understand the challenge lifecycle: SUBMITTED → AI_ANALYZED → VALIDATED → MATCHED → IN_PROJECT → RESOLVED.

Tone: Friendly, professional, and empathetic. Use simple language accessible to rural and urban citizens alike.
Language: If the user writes in Hindi (हिंदी), reply in Hindi. If in English, reply in English. Match the user's language.
Domain expertise: Water supply, roads & infrastructure, sanitation & waste, agriculture & irrigation, public health & clinics, electricity.

Keep answers concise but complete. When giving steps, use numbered lists. Never fabricate specific government data.
If asked for the OpenAI API key or any secret, refuse politely.
"""

# ── Chat endpoint ─────────────────────────────────────────────


@router.post("/chat", response_model=ChatResponse, summary="CivicSolve AI Chatbot")
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Forward the conversation to OpenAI Chat Completions and return the reply.

    Requires OPENAI_API_KEY environment variable to be set.
    """
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        logger.error("OPENAI_API_KEY is not set in environment variables.")
        raise HTTPException(
            status_code=503,
            detail=(
                "OpenAI API key is not configured on the server. "
                "Please set OPENAI_API_KEY in the .env file and restart the AI service."
            ),
        )

    # Build messages for OpenAI
    openai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in request.messages:
        if msg.role in ("user", "assistant"):
            openai_messages.append({"role": msg.role, "content": msg.content})

    payload = {
        "model": "gpt-4o-mini",
        "messages": openai_messages,
        "max_tokens": 800,
        "temperature": 0.7,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )

        if response.status_code != 200:
            error_body = response.text
            logger.error(
                "OpenAI API error %s: %s", response.status_code, error_body
            )
            raise HTTPException(
                status_code=502,
                detail=f"OpenAI API returned an error ({response.status_code}). "
                       "Please check your API key and try again.",
            )

        data = response.json()
        reply_text: str = data["choices"][0]["message"]["content"]
        model_used: str = data.get("model", "gpt-4o-mini")

        return ChatResponse(reply=reply_text, model=model_used)

    except HTTPException:
        raise
    except httpx.TimeoutException:
        logger.error("OpenAI API request timed out.")
        raise HTTPException(
            status_code=504,
            detail="The AI service timed out. Please try again in a moment.",
        )
    except Exception as exc:
        logger.exception("Unexpected error calling OpenAI API: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again.",
        )
