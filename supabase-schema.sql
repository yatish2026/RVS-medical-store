-- ==============================================================================
-- RVS MEDICAL STORE & HOSPITAL MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL SCHEMA & INITIAL DATA SEED SCRIPT (IDEMPOTENT / SAFE TO RE-RUN)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. MEDICINES MASTER TABLE
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(100) NOT NULL, -- Antibiotics, Analgesics, Cardiac, Diabetics, etc.
    dosage_form VARCHAR(50) NOT NULL, -- Tablet, Syrup, Capsule, Injection, Ointment, IV Fluid
    strength VARCHAR(50), -- 500mg, 10ml, 100IU/ml
    manufacturer VARCHAR(255),
    shelf_location VARCHAR(50), -- Rack A-1, Cold Storage, Shelf B-4
    min_stock_alert INT DEFAULT 20,
    prescription_required BOOLEAN DEFAULT true,
    hsn_code VARCHAR(20) DEFAULT '30049099',
    gst_rate NUMERIC(5,2) DEFAULT 12.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. MEDICINE BATCHES TABLE (Multi-batch stock and expiry tracking)
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

-- 4. PATIENTS & HOSPITAL OPD/IPD DIRECTORY
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uhid VARCHAR(50) UNIQUE NOT NULL, -- RVS-PAT-XXXX
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

-- 5. SUPPLIERS DIRECTORY
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

-- 6. SALES & BILLING INVOICES
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
    payment_mode VARCHAR(50) NOT NULL, -- Cash, UPI, Card, Hospital-Credit
    payment_status VARCHAR(50) DEFAULT 'Completed', -- Completed, Pending, Refunded
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SALES LINE ITEMS
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

-- 8. HOSPITAL WARD & EMERGENCY REQUISITIONS
CREATE TABLE IF NOT EXISTS hospital_requisitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_no VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL, -- ICU, Emergency / ER, OT, General Ward, NICU
    requested_by VARCHAR(255) NOT NULL, -- Dr. / Nurse in-charge
    priority VARCHAR(50) DEFAULT 'Normal', -- Emergency, High, Normal
    status VARCHAR(50) DEFAULT 'Issued', -- Requested, Issued, Returned
    bed_no VARCHAR(50),
    patient_uhid VARCHAR(50),
    items_count INT DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_requisitions ENABLE ROW LEVEL SECURITY;

-- 10. SAFE RE-RUNNABLE RLS POLICIES (DROP FIRST IF EXISTS)
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
CREATE POLICY "Allow public all on hospital_requisitions" ON hospital_requisitions FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 11. INITIAL CLINICAL SEED DATA (RVS Medical Hospital Ready)
-- ==============================================================================

-- Suppliers
INSERT INTO suppliers (name, company_name, phone, email, gstin, address) VALUES
('Rajesh Sharma', 'Apollo Pharma Distributors', '+91 98450 12345', 'orders@apollopharma.com', '29ABCDE1234F1Z5', 'Industrial Estate, Phase 2, Bangalore'),
('Dr. Vikram Rao', 'MedLife Surgicals & Biotics', '+91 99880 54321', 'supply@medlifesurg.com', '29XYZAB5678G2Z3', 'Ring Road, Medical Complex, Bangalore'),
('Sunita Patil', 'Cipla Care Logistics', '+91 97410 88990', 'dist@ciplacare.in', '29PQRSM9876H3Z1', 'Peenya Industrial Area, Bangalore')
ON CONFLICT DO NOTHING;

-- Patients
INSERT INTO patients (uhid, name, phone, age, gender, blood_group, doctor_name, diagnosis, allergies) VALUES
('RVS-P-1001', 'Ramesh Kumar', '+91 98451 11223', 48, 'Male', 'B+', 'Dr. Ananya Hegde (Cardiology)', 'Hypertension & Type 2 Diabetes', 'Penicillin'),
('RVS-P-1002', 'Priya Sundaram', '+91 97422 33445', 32, 'Female', 'O+', 'Dr. Arvind Swamy (Pulmonology)', 'Acute Bronchial Asthma', 'None'),
('RVS-P-1003', 'Master Aarav Gowda', '+91 99001 55667', 7, 'Male', 'A+', 'Dr. S. K. Murthy (Pediatrics)', 'Viral Fever & Pharyngitis', 'Sulfa drugs'),
('RVS-P-1004', 'Lakshmi Narayan', '+91 98860 77889', 64, 'Female', 'AB+', 'Dr. Preeti Reddy (Orthopedics)', 'Osteoarthritis & Calcium Deficiency', 'NSAIDs')
ON CONFLICT DO NOTHING;

-- Hospital Requisitions
INSERT INTO hospital_requisitions (requisition_no, department, requested_by, priority, status, bed_no, patient_uhid, items_count, notes) VALUES
('REQ-2026-081', 'ICU - Critical Care', 'Dr. Arvind Swamy', 'Emergency', 'Issued', 'ICU-Bed-04', 'RVS-P-1002', 3, 'Immediate IV Salbutamol & Hydrocortisone administered'),
('REQ-2026-082', 'Emergency / ER', 'Dr. Preeti Reddy', 'High', 'Issued', 'ER-Bay-02', 'RVS-P-1004', 2, 'Tramadol Injection & Normal Saline 500ml'),
('REQ-2026-083', 'Pediatric Ward', 'Nurse Kavitha', 'Normal', 'Issued', 'PED-Bed-12', 'RVS-P-1003', 1, 'Paracetamol Pediatric Oral Drops')
ON CONFLICT DO NOTHING;
