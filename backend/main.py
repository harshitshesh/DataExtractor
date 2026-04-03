from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
import logging
from typing import List, Optional
from services.ocr_service import extract_text
from services.llm_service import extract_structured_data
from services.supabase_service import upload_to_storage, insert_invoice, get_invoices, check_duplicate, delete_all_invoices
from models.invoice import InvoiceExtraction, InvoiceRecord
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Invoice Extraction API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a temp directory for local processing
TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.get("/health")
async def health_check():
    """Quick health check endpoint."""
    return {
        "status": "ok",
        "service": "AI Invoice Extraction API",
        "gemini_key_set": bool(os.getenv("GEMINI_API_KEY")),
        "supabase_url_set": bool(os.getenv("SUPABASE_URL")),
    }

@app.post("/upload")
async def process_invoice(file: UploadFile = File(...)):
    """Upload, extract, parse, and store invoice data."""
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    temp_path = os.path.join(TEMP_DIR, f"{file_id}{file_ext}")

    # Save to local temp for processing
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"File saved to temp: {temp_path} ({file.filename})")
        
        # 1. OCR Extraction
        ocr_text = extract_text(temp_path)
        if not ocr_text:
            raise HTTPException(status_code=400, detail="Could not extract text from file. Please upload a clearer image or PDF.")
        
        logger.info(f"OCR extracted {len(ocr_text)} characters.")
        
        # 2. LLM Extraction
        extraction = extract_structured_data(ocr_text)
        if not extraction:
            raise HTTPException(
                status_code=500, 
                detail="AI parsing failed. All Gemini models returned errors. Please check your GEMINI_API_KEY in .env and try again."
            )
        
        logger.info(f"AI extraction result: {extraction}")
        
        # 3. Duplicate Detection
        vendor = extraction.get("vendor", "Unknown")
        invoice_num = extraction.get("invoice_number", "Unknown")
        duplicate = check_duplicate(vendor, invoice_num)
        
        if duplicate:
            return {"status": "duplicate", "message": "This invoice has already been processed.", "data": duplicate}

        # 4. Storage Upload (non-blocking — pipeline continues even if storage fails)
        file_url = ""
        try:
            bucket_res = upload_to_storage("invoices", temp_path, f"{file_id}{file_ext}")
            if bucket_res:
                file_url = bucket_res
        except Exception as storage_err:
            logger.warning(f"Storage upload failed (non-critical): {storage_err}")
            file_url = ""

        # 5. Database Store
        record = {
            "vendor": vendor,
            "buyer_name": extraction.get("buyer_name"),
            "amount": float(extraction.get("amount", 0)) if extraction.get("amount") is not None else 0,
            "tax_amount": float(extraction.get("tax_amount")) if extraction.get("tax_amount") is not None else None,
            "currency": extraction.get("currency", "USD"),
            "date": extraction.get("date", ""),
            "due_date": extraction.get("due_date", ""),
            "payment_status": extraction.get("payment_status", ""),
            "invoice_number": invoice_num,
            "gst_number": extraction.get("gst_number", ""),
            "file_url": file_url,
            "raw_text": ocr_text,
            "confidence_score": 0.95,
        }
        
        db_res = insert_invoice(record)
        logger.info(f"Invoice stored in database successfully.")
        
        return {"status": "success", "data": db_res}

    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"Upload processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/invoices")
async def get_all_invoices():
    """Retrieve list of all processed invoices."""
    return get_invoices()

@app.delete("/invoices")
async def clear_all_invoices():
    """Clear all processed invoices from database."""
    success = delete_all_invoices()
    if not success:
        raise HTTPException(status_code=500, detail="Failed to clear invoices from database.")
    return {"status": "success", "message": "All invoices cleared."}

@app.get("/analytics")
async def get_analytics():
    """Aggregate data for the dashboard."""
    invoices = get_invoices()
    
    total_count = len(invoices)
    total_spend = sum(float(inv.get("amount", 0)) for inv in invoices)
    
    vendor_aggregation = {}
    currency_aggregation = {}
    status_aggregation = {}
    monthly_aggregation = {}
    
    for inv in invoices:
        v = inv.get("vendor", "Unknown")
        c = inv.get("currency", "USD")
        amt = float(inv.get("amount", 0))
        status = inv.get("payment_status", "Unknown") or "Unknown"
        date_str = inv.get("date", "")
        
        vendor_aggregation[v] = vendor_aggregation.get(v, 0) + amt
        currency_aggregation[c] = currency_aggregation.get(c, 0) + amt
        status_aggregation[status] = status_aggregation.get(status, 0) + 1
        
        # Monthly aggregation from date field
        if date_str and len(date_str) >= 7:
            month_key = date_str[:7]  # YYYY-MM
            monthly_aggregation[month_key] = monthly_aggregation.get(month_key, 0) + amt
    
    # Calculate averages and tax totals
    total_tax = sum(float(inv.get("tax_amount", 0) or 0) for inv in invoices)
    avg_invoice = total_spend / total_count if total_count > 0 else 0
    
    return {
        "total_count": total_count,
        "total_spend": total_spend,
        "total_tax": total_tax,
        "avg_invoice": round(avg_invoice, 2),
        "vendor_spend": vendor_aggregation,
        "currency_spend": currency_aggregation,
        "status_breakdown": status_aggregation,
        "monthly_spend": monthly_aggregation,
        "recent_invoices": invoices[:10]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
