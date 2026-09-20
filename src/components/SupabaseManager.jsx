import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Database,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  Server,
  ShieldCheck,
  Code2,
  Key,
  Globe,
  Terminal,
  UploadCloud,
  Layers,
  Users,
  Pill,
  Truck
} from 'lucide-react'

export const SupabaseManager = () => {
  const {
    supabaseConnected,
    supabaseSyncing,
    syncMessage,
    syncWithSupabase,
    pushAllLocalDataToSupabase,
    notify,
    medicines,
    batches,
    patients,
    sales,
    suppliers,
    requisitions
  } = useApp()

  const [copied, setCopied] = useState(false)

  const sqlCode = `-- ==============================================================================
-- RVS MEDICAL STORE & HOSPITAL MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL SCHEMA & INITIAL DATA SEED SCRIPT (IDEMPOTENT / SAFE TO RE-RUN)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MEDICINES MASTER TABLE
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(50) NOT NULL,
    strength VARCHAR(50),
    manufacturer VARCHAR(255),
    shelf_location VARCHAR(50),
    min_stock_alert INT DEFAULT 20,
    prescription_required BOOLEAN DEFAULT true,
    hsn_code VARCHAR(20) DEFAULT '30049099',
    gst_rate NUMERIC(5,2) DEFAULT 12.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. MEDICINE BATCHES TABLE (Multi-batch stock and expiry tracking)
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    cost_price NUMERIC(10,2) NOT NULL,
    mrp NUMERIC(10,2) NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    supplier_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PATIENTS
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uhid VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    age INT,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    doctor_name VARCHAR(255),
    diagnosis TEXT,
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    gstin VARCHAR(50),
    address TEXT,
    balance_payable NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SALES INVOICES
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    doctor_name VARCHAR(255),
    subtotal NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0.00,
    tax_amount NUMERIC(10,2) DEFAULT 0.00,
    grand_total NUMERIC(10,2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Completed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SALES LINE ITEMS
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    medicine_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    expiry_date DATE,
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

-- 7. HOSPITAL REQUISITIONS
CREATE TABLE IF NOT EXISTS hospital_requisitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_no VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    priority VARCHAR(50) DEFAULT 'Normal',
    status VARCHAR(50) DEFAULT 'Issued',
    bed_no VARCHAR(50),
    patient_uhid VARCHAR(50),
    items_count INT DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ENABLE ROW LEVEL SECURITY & SAFE RE-RUNNABLE POLICIES
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_requisitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on medicines" ON medicines;
CREATE POLICY "Allow public all on medicines" ON medicines FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on batches" ON batches;
CREATE POLICY "Allow public all on batches" ON batches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on patients" ON patients;
CREATE POLICY "Allow public all on patients" ON patients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on suppliers" ON suppliers;
CREATE POLICY "Allow public all on suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on sales" ON sales;
CREATE POLICY "Allow public all on sales" ON sales FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on sale_items" ON sale_items;
CREATE POLICY "Allow public all on sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on hospital_requisitions" ON hospital_requisitions;
CREATE POLICY "Allow public all on hospital_requisitions" ON hospital_requisitions FOR ALL USING (true) WITH CHECK (true);`

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode)
    setCopied(true)
    notify('SQL Script Copied!', 'Paste this into the Supabase SQL Editor and click RUN.', 'success')
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="clinical-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            Supabase Cloud Database Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Realtime PostgreSQL backend connected to project <strong className="text-emerald-700 font-bold">rvs-medical</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* 1-Click Upload to Supabase */}
          <button
            onClick={pushAllLocalDataToSupabase}
            disabled={supabaseSyncing}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all"
          >
            <UploadCloud className={`w-4 h-4 ${supabaseSyncing ? 'animate-bounce' : ''}`} />
            <span>Upload Formulary to Supabase</span>
          </button>

          {/* Sync */}
          <button
            onClick={syncWithSupabase}
            disabled={supabaseSyncing}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${supabaseSyncing ? 'animate-spin' : ''}`} />
            <span>{supabaseSyncing ? 'Syncing...' : 'Sync Cloud Database'}</span>
          </button>
        </div>
      </div>

      {/* Database Tables Count Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="clinical-card p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{medicines.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Medicines Table</div>
          </div>
        </div>

        <div className="clinical-card p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{batches.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Batches Table</div>
          </div>
        </div>

        <div className="clinical-card p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{patients.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Patients Table</div>
          </div>
        </div>

        <div className="clinical-card p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{suppliers.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Suppliers Table</div>
          </div>
        </div>
      </div>

      {/* Project Credentials Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="clinical-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Supabase Project URL</span>
          </div>
          <div className="mt-2 font-mono text-xs font-bold text-teal-800 truncate bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            https://ztcvqqwckiunvdkkvzqd.supabase.co
          </div>
        </div>

        <div className="clinical-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <Key className="w-4 h-4 text-cyan-600" />
            <span>Public Anon API Key</span>
          </div>
          <div className="mt-2 font-mono text-xs font-bold text-slate-700 truncate bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            sb_publishable_vSbgp3mxrUs...
          </div>
        </div>

        <div className="clinical-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <Server className="w-4 h-4 text-teal-600" />
            <span>Cloud Sync Status</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span>{supabaseConnected ? 'Supabase Connected & Active' : 'Connected / Ready for SQL Init'}</span>
          </div>
        </div>

      </div>

      {/* 3 Step Setup Guide */}
      <div className="clinical-card p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-teal-600" />
          How to Initialize Your Cloud Database in 30 Seconds:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center font-mono text-xs shadow-2xs">
              1
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Run Schema in Supabase</h4>
            <p className="text-slate-600 leading-relaxed">
              Copy the SQL below, paste in your Supabase SQL Editor and click <strong>RUN</strong>.
            </p>
            <a
              href="https://supabase.com/dashboard/project/ztcvqqwckiunvdkkvzqd/sql"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-bold"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center font-mono text-xs shadow-2xs">
              2
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Upload Initial Formulary</h4>
            <p className="text-slate-600 leading-relaxed">
              Click <strong>"Upload Formulary to Supabase"</strong> above to populate all medicines, batches, patients & suppliers into your Supabase database in 1 click!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center font-mono text-xs shadow-2xs">
              3
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Add / Sell Medicines</h4>
            <p className="text-slate-600 leading-relaxed">
              Every time you add a medicine, inward a batch, or generate a POS bill, it will save directly to Supabase in real-time!
            </p>
          </div>
        </div>

        {/* Copy SQL Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleCopySql}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-xl text-sm shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'SQL Copied to Clipboard!' : 'Copy 1-Click Supabase SQL Script'}</span>
          </button>
        </div>
      </div>

      {/* SQL Script Viewer */}
      <div className="clinical-card rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-700 font-bold flex items-center gap-2">
            <Code2 className="w-4 h-4 text-teal-600" />
            supabase-schema.sql (PostgreSQL)
          </span>
          <button
            onClick={handleCopySql}
            className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Code</span>
          </button>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-800 bg-white overflow-x-auto max-h-72 leading-relaxed">
          {sqlCode}
        </pre>
      </div>

    </div>
  )
}
