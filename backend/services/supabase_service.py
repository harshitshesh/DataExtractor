import os
import logging
from supabase import create_client, Client
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

_url: str = os.getenv("SUPABASE_URL", "")
_key: str = os.getenv("SUPABASE_KEY", "")

# Only initialize if a valid URL is provided
supabase: Client = create_client(_url, _key) if _url and _url.startswith("http") and _key else None

def upload_to_storage(bucket: str, file_path: str, destination_path: str) -> str:
    """Upload a file to Supabase storage and return the URL."""
    try:
        with open(file_path, "rb") as f:
            supabase.storage.from_(bucket).upload(destination_path, f)
        
        # Get public URL
        res = supabase.storage.from_(bucket).get_public_url(destination_path)
        return getattr(res, 'public_url', res) if not isinstance(res, str) else res
    except Exception as e:
        logger.error(f"Error in Supabase storage upload: {e}")
        raise Exception(f"Failed to upload to Supabase bucket '{bucket}'. Ensure bucket exists.")

def insert_invoice(data: dict) -> dict:
    """Insert extraction result into invoices table."""
    try:
        res = supabase.table("invoices").insert(data).execute()
        if hasattr(res, 'data') and res.data:
            return res.data[0]
        else:
            raise Exception("Insert operation returned no data.")
    except Exception as e:
        logger.error(f"Error in Supabase DB insert: {e}")
        raise Exception(f"Database sync failed. Please update schema in Supabase. Error: {str(e)}")

def get_invoices() -> List[dict]:
    """Retrieve all processed invoices."""
    try:
        res = supabase.table("invoices").select("*").order("created_at", desc=True).execute()
        return res.data if hasattr(res, 'data') else []
    except Exception as e:
        logger.error(f"Error in Supabase DB query: {e}")
        return []

def check_duplicate(vendor: str, invoice_number: str) -> Optional[dict]:
    """Check if an invoice with same vendor and number already exists."""
    try:
        res = supabase.table("invoices").select("*").eq("vendor", vendor).eq("invoice_number", invoice_number).execute()
        return res.data[0] if (hasattr(res, 'data') and res.data) else None
    except Exception as e:
        logger.error(f"Error in duplicate check: {e}")
        # Soft degrade if schema doesn't match yet
        return None
