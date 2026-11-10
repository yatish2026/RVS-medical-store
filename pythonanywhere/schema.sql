-- ==============================================================================
-- RVS MEDICAL STORE & HOSPITAL MANAGEMENT SYSTEM
-- MYSQL DATABASE SCHEMA SCRIPT FOR PYTHONANYWHERE (user: yatish)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS yatish$rvs_hospital DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yatish$rvs_hospital;

-- 1. USERS & ROLES TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin_supervisor', 'doctor_mo', 'supervisor_viewer', 'pharmacist'
    designation VARCHAR(255),
    phone VARCHAR(50),
    store VARCHAR(50) DEFAULT 'UHTC', -- 'UHTC', 'RHTC', 'ALL'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. MEDICINES MASTER TABLE
CREATE TABLE IF NOT EXISTS medicines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(50) NOT NULL,
    strength VARCHAR(50),
    manufacturer VARCHAR(255),
    shelf_location VARCHAR(50),
    min_stock_alert INT DEFAULT 20,
    prescription_required BOOLEAN DEFAULT TRUE,
    hsn_code VARCHAR(20) DEFAULT '30049099',
    gst_rate DECIMAL(5,2) DEFAULT 12.00,
    store VARCHAR(50) DEFAULT 'UHTC', -- 'UHTC', 'RHTC'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. MEDICINE BATCHES TABLE
CREATE TABLE IF NOT EXISTS batches (
    id VARCHAR(50) PRIMARY KEY,
    medicine_id VARCHAR(50) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    supplier_name VARCHAR(255),
    store VARCHAR(50) DEFAULT 'UHTC', -- 'UHTC', 'RHTC'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(50) PRIMARY KEY,
    uhid VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    age INT,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    doctor_name VARCHAR(255),
    diagnosis TEXT,
    allergies TEXT,
    store VARCHAR(50) DEFAULT 'UHTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    gstin VARCHAR(50),
    address TEXT,
    balance_payable DECIMAL(10,2) DEFAULT 0.00,
    store VARCHAR(50) DEFAULT 'UHTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. HOSPITAL REQUISITIONS TABLE
CREATE TABLE IF NOT EXISTS hospital_requisitions (
    id VARCHAR(50) PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    items JSON NOT NULL,
    priority VARCHAR(50) DEFAULT 'Normal',
    status VARCHAR(50) DEFAULT 'Requested',
    notes TEXT,
    store VARCHAR(50) DEFAULT 'UHTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. SALES & BILLING TABLE
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    patient_uhid VARCHAR(50),
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50),
    doctor_name VARCHAR(255),
    subtotal DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL,
    grand_total DECIMAL(10,2) NOT NULL,
    payment_mode VARCHAR(50) DEFAULT 'UPI',
    billed_by VARCHAR(255),
    store VARCHAR(50) DEFAULT 'UHTC',
    billed_by_role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. SALE LINE ITEMS
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(50) PRIMARY KEY,
    sale_id VARCHAR(50) NOT NULL,
    medicine_id VARCHAR(50),
    medicine_name VARCHAR(255) NOT NULL,
    batch_id VARCHAR(50),
    batch_number VARCHAR(50),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    gst_rate DECIMAL(5,2) DEFAULT 12.00,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. PRE-APPROVED CLINICAL DISCOUNT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS clinical_discount_policy (
    id INT PRIMARY KEY AUTO_INCREMENT,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    authorized_by VARCHAR(255) DEFAULT 'None',
    reason VARCHAR(255) DEFAULT 'Standard Bill Rate (No Discount Set)',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INITIAL SEED: Pre-approved discount policy (0% default)
INSERT INTO clinical_discount_policy (discount_percent, authorized_by, reason)
VALUES (0.00, 'None', 'Standard Bill Rate (No Discount Set)')
ON DUPLICATE KEY UPDATE discount_percent=0.00;

-- INITIAL SEED: Initial Accounts (Super Admin and Pharmacist)
INSERT INTO users (id, username, password_hash, name, role, designation, phone) VALUES
('user-admin', 'admin', 'admin123', 'Dr. Yatish', 'admin_supervisor', 'Chief Medical Administrator & Super Admin', '+91 98765 43210'),
('user-dr-yatish', 'dr-yatish', 'Yatish', 'yatish', 'pharmacist', 'Dispensary Pharmacist', '+91 98765 00000')
ON DUPLICATE KEY UPDATE name=VALUES(name);
