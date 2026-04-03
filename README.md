# 🚀 AI Invoice Extraction - Full Setup & Feature Guide

Welcome! This system is designed to automatically extract data from invoices (PDFs and Images) using **Tesseract OCR** and **Gemini AI**, then store the results in **Supabase**.

Live link -- https://glittering-khapse-98894c.netlify.app/
## 🛠️ Prerequisites
1.  **Docker Desktop**: Running on your machine.
2.  **Node.js**: Installed for running the frontend.
3.  **Supabase Project**: 
    - Create a table named `invoices` (Columns: `id`, `vendor`, `amount`, `currency`, `date`, `invoice_number`, `file_url`, `raw_text`, `created_at`).
    - Create a public storage bucket named `invoices`.
4.  **Google Gemini API Key**: From Google AI Studio.

---

## ⚡ How to Run the Website

### 1. Start the Backend (Using Docker)
You don't need to install Python or Tesseract locally. Docker handles it all!
Open your terminal in the root directory and run:
```bash
docker compose up -d backend
```
*Wait for the container to start. It will listen on `http://localhost:8000`.*

### 2. Start the Frontend (Locally)
1.  Go to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
*The website will be available at `http://localhost:5173/`.*

---

## ✨ Features to Check

### 1. **Premium Dashboard UI**
- **Glassmorphic Design**: Sleek, modern cards with blur effects and gradients.
- **Smart Analytics**: 
  - **Total Spend**: Aggregated sum of all processed invoices.
  - **Active Vendors**: Count of unique vendors found.
  - **Visual Charts**: Interactive pie and area charts (using Recharts) to visualize your spending trends.

### 2. **AI-Powered Upload Modal**
- **Drag & Drop**: Simply drag your invoice into the zone.
- **Granular Loading States**: Real-time feedback ("Uploading...", "Extracting OCR...", "AI Analysis...") so you know exactly what the system is doing.
- **Duplicate Detection**: The backend automatically checks if an invoice with the same Vendor and Number has already been processed.

### 3. **Smart Extraction Flow**
- **Multi-Format Support**: Works with JPG, PNG, and PDF.
- **OCR Integration**: Robust text extraction from images.
- **Gemini 1.5 Flash**: Advanced AI parsing to understand even complex or messy invoice layouts.

### 4. **Data Management**
- **Processed List**: A clean, sortable table of all your invoices.
- **File Links**: Access the original uploaded file directly from the table.

---

## 🧪 How to Test (Step-by-Step)
1.  Open `http://localhost:5173/`.
2.  Click the **"New Invoice"** button.
3.  Upload a sample invoice file (e.g., a PDF of an Amazon or Uber receipt).
4.  Click **"Process with AI"**.
5.  Watch the progress tracker on the button and in the modal.
6.  Once finished, the dashboard will refresh and your new data will appear in the charts and list!

*If you have any issues, check the Docker logs for the backend (`docker logs demoassignment-backend-1`) or the browser console for the frontend.*
