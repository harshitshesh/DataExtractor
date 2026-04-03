import os
import json
import logging
import time
from typing import Optional
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key:
    client = genai.Client(api_key=api_key)
    logger.info("Gemini client initialized successfully.")
else:
    logger.error("GEMINI_API_KEY not found in environment variables.")

class InvoiceSchema(BaseModel):
    vendor: str = Field(description="full legal name of the vendor")
    amount: float = Field(description="exact final balance due")
    currency: str = Field(description="ISO 3-letter code, e.g., INR, USD")
    date: str = Field(description="YYYY-MM-DD or ISO 8601")
    invoice_number: str = Field(description="unique identifier for the invoice")
    tax_amount: Optional[float] = Field(None, description="total tax amount calculated or explicitly listed")
    gst_number: Optional[str] = Field(None, description="15-digit GSTIN or local tax ID if present")
    buyer_name: Optional[str] = Field(None, description="full name of the person or company the invoice is billed to")
    due_date: Optional[str] = Field(None, description="when the payment is due, YYYY-MM-DD or ISO format")
    payment_status: Optional[str] = Field(None, description="status of payment if visible, e.g., Paid, Pending, Overdue")

def extract_structured_data(ocr_text: str) -> dict:
    """Send OCR text to Gemini and parse it into structured JSON with robust fallback logic."""
    if not ocr_text or not ocr_text.strip():
        logger.warning("Empty OCR text provided to Gemini.")
        return {}

    if not client:
        logger.error("Google GenAI client is not initialized. Check GEMINI_API_KEY.")
        return {}

    # Updated model list — only currently available models (April 2026)
    models_to_try = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash",
    ]

    prompt = f"""
    You are an expert invoice data extractor. Extract the following structured data from the provided invoice text.
    Carefully identify the Vendor, Date, Invoice Number, Total Amount, Currency, and Tax details.
    If a field is not clearly present, use reasonable defaults or null.
    
    OCR TEXT:
    ---
    {ocr_text}
    ---
    """

    last_err = None
    errors_summary = []

    for i, model_name in enumerate(models_to_try):
        try:
            logger.info(f"Attempting extraction with model: {model_name} (attempt {i+1}/{len(models_to_try)})")
            
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=InvoiceSchema,
                    temperature=0.1,
                )
            )
            
            content = response.text.strip()
            result = json.loads(content)
            logger.info(f"Extraction successful with {model_name}!")
            return result
            
        except Exception as e:
            last_err = e
            error_msg = str(e)
            errors_summary.append(f"{model_name}: {error_msg[:100]}")
            logger.error(f"Model {model_name} failed: {error_msg}")
            
            # If rate limited, wait a bit before trying next model
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                logger.info("Rate limited, waiting 5 seconds before next attempt...")
                time.sleep(5)
            
            continue

    all_errors = " | ".join(errors_summary)
    logger.critical(f"All Gemini models failed. Errors: {all_errors}")
    return {}
