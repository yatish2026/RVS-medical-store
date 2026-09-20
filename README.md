# 🏥 RVS Medical Store & Hospital Pharmacy Management System

> An enterprise-grade, real-time hospital dispensary & retail pharmacy management application built with **React**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL)**.

---

## 🌟 Key Features

- 🏥 **Hospital Formulary & Inventory**: Multi-batch inventory tracking with generic salt formulas, manufacturer details, rack/bay locations, and low-stock alert thresholds.
- ⚡ **High-Speed Billing (POS Terminal)**: Fast lookup by brand or salt, instant batch selection, clinical discount application, multi-mode payment (UPI / Cash / Card / Hospital Credit), and printable A4/thermal cash invoices.
- ⏳ **Expiry Date Monitoring Radar**: Automated 4-tier risk classification (`Expired`, `Critical <30 Days`, `Warning <60 Days`, `Notice <90 Days`) with 1-click drug quarantine and Return-to-Vendor (RTV) handling.
- 👥 **Patients & UHID Directory**: Hospital patient registry with UHID numbers, allergy flags, prescribing doctors, diagnosis records, and prescription purchase history.
- 🏢 **Ward & Emergency Drug Requisitions**: Real-time drug requisitions for ICU, ER, OT, and general wards with status workflows (`Requested` ➔ `Issued` ➔ `Administered`).
- 🚚 **Suppliers & Vendor Purchasing**: Pharma distributor directory, GSTIN tracking, and accounts payable balances.
- 📱 **Mobile & Phone-Ready UX**: Responsive slide-out drawer, bottom thumb navigation bar, touch-optimized POS controls, and smooth cross-device responsiveness.
- ☁️ **Supabase Cloud PostgreSQL**: Real-time cloud sync with PostgreSQL tables and Row Level Security (RLS).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend & Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel / Netlify

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/yatish2026/RVS-medical-store.git
cd RVS-medical-store
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Setup (Supabase SQL)

Run the SQL script provided in [`supabase-schema.sql`](./supabase-schema.sql) in your **Supabase Dashboard ➔ SQL Editor**:
- Creates `medicines`, `batches`, `patients`, `suppliers`, `sales`, `sale_items`, and `hospital_requisitions` tables.
- Sets up primary keys, UUIDs, foreign keys, and public RLS policies.

---

## 🌐 Deployment Guide (Vercel / Netlify)

### Deploying to Vercel (Recommended)
1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `RVS-medical-store` GitHub repository.
4. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL` = `https://ztcvqqwckiunvdkkvzqd.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
5. Click **"Deploy"**. Your app is live with a global HTTPS URL!

### Deploying to Netlify
1. Log in to [Netlify](https://netlify.com) and click **"Add new site" ➔ "Import an existing project"**.
2. Select GitHub and choose `RVS-medical-store`.
3. Set build command: `npm run build` and publish directory: `dist`.
4. Add the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
5. Click **"Deploy site"**.

---

## 📄 License
This project is proprietary and maintained for **RVS Medical Store & Hospital Management**.
