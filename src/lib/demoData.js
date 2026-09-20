// Initial clinical dataset for RVS Medical Store & Hospital Pharmacy

export const INITIAL_MEDICINES = [
  {
    id: 'med-001',
    name: 'Augmentin 625 Duo',
    generic_name: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
    category: 'Antibiotics',
    dosage_form: 'Tablet',
    strength: '625 mg',
    manufacturer: 'GSK Pharma',
    shelf_location: 'Rack A-01 (Antibiotics)',
    min_stock_alert: 25,
    prescription_required: true,
    hsn_code: '30049099',
    gst_rate: 12.00
  },
  {
    id: 'med-002',
    name: 'Dolo 650',
    generic_name: 'Paracetamol',
    category: 'Analgesics / Antipyretic',
    dosage_form: 'Tablet',
    strength: '650 mg',
    manufacturer: 'Micro Labs Ltd',
    shelf_location: 'Rack B-03 (Fast Movers)',
    min_stock_alert: 50,
    prescription_required: false,
    hsn_code: '30049099',
    gst_rate: 12.00
  },
  {
    id: 'med-003',
    name: 'Monocef 1g Injection',
    generic_name: 'Ceftriaxone Sodium Sterile',
    category: 'Antibiotics (IV/IM)',
    dosage_form: 'Injection',
    strength: '1 gm',
    manufacturer: 'Aristo Pharmaceuticals',
    shelf_location: 'Emergency Refrigerator & Rack E-02',
    min_stock_alert: 20,
    prescription_required: true,
    hsn_code: '30049099',
    gst_rate: 12.00
  },
  {
    id: 'med-004',
    name: 'Telma 40',
    generic_name: 'Telmisartan',
    category: 'Cardiac / Hypertension',
    dosage_form: 'Tablet',
    strength: '40 mg',
    manufacturer: 'Glenmark Pharmaceuticals',
    shelf_location: 'Rack C-05 (Cardiac)',
    min_stock_alert: 30,
    prescription_required: true,
    hsn_code: '30049099',
    gst_rate: 12.00
  },
  {
    id: 'med-005',
    name: 'Pan-D Capsule',
    generic_name: 'Pantoprazole (40mg) + Domperidone (30mg SR)',
    category: 'Gastrointestinal',
    dosage_form: 'Capsule',
    strength: '40mg + 30mg',
    manufacturer: 'Alkem Laboratories',
    shelf_location: 'Rack B-01 (GI)',
    min_stock_alert: 40,
    prescription_required: true,
    hsn_code: '30049099',
    gst_rate: 12.00
  },
  {
    id: 'med-006',
    name: 'Human Mixtard 30/70 100IU',
    generic_name: 'Soluble Insulin (30%) + Isophane Insulin (70%)',
    category: 'Diabetics / Insulin',
    dosage_form: 'Vial / Injection',
    strength: '100 IU/ml (10ml)',
    manufacturer: 'Novo Nordisk',
    shelf_location: 'Cold Chain Vault (2°C - 8°C)',
    min_stock_alert: 15,
    prescription_required: true,
    hsn_code: '30043110',
    gst_rate: 5.00
  },
  {
    id: 'med-007',
    name: 'Asthalin 100mcg Inhaler',
    generic_name: 'Salbutamol',
    category: 'Respiratory / Asthma',
    dosage_form: 'Inhaler / MDI',
    strength: '100 mcg (200 MD)',
    manufacturer: 'Cipla Ltd',
    shelf_location: 'Rack D-04 (Respiratory)',
    min_stock_alert: 15,
    prescription_required: true,
    hsn_code: '30049099',
    gst_rate: 12.00
  },
  {
    id: 'med-008',
    name: 'Normal Saline (NS 0.9%) 500ml',
    generic_name: 'Sodium Chloride 0.9% IV Infusion',
    category: 'IV Fluids & Critical Care',
    dosage_form: 'IV Fluid (Bottle)',
    strength: '500 ml',
    manufacturer: 'Otsuka / Baxter',
    shelf_location: 'Hospital IV Ward Storage Bay 1',
    min_stock_alert: 60,
    prescription_required: true,
    hsn_code: '30049099',
    gst_rate: 12.00
  },
  {
    id: 'med-009',
    name: 'Azithral 500',
    generic_name: 'Azithromycin',
    category: 'Antibiotics',
    dosage_form: 'Tablet',
    strength: '500 mg',
    manufacturer: 'Alembic Pharmaceuticals',
    shelf_location: 'Rack A-03',
    min_stock_alert: 20,
    prescription_required: true,
    hsn_code: '30049099',
    gst_rate: 12.00
  },
  {
    id: 'med-010',
    name: 'Betadine 10% Ointment',
    generic_name: 'Povidone Iodine',
    category: 'Antiseptics & Surgical',
    dosage_form: 'Ointment',
    strength: '100 gm',
    manufacturer: 'Win-Medicare',
    shelf_location: 'Rack S-02 (Surgical Supplies)',
    min_stock_alert: 20,
    prescription_required: false,
    hsn_code: '30049099',
    gst_rate: 12.00
  },
  {
    id: 'med-011',
    name: 'Emeset 4mg Injection',
    generic_name: 'Ondansetron',
    category: 'Gastrointestinal / Antiemetic',
    dosage_form: 'Injection',
    strength: '2 ml Ampoule',
    manufacturer: 'Cipla Ltd',
    shelf_location: 'Emergency Drug Cart',
    min_stock_alert: 25,
    prescription_required: true,
    hsn_code: '30049099',
    gst_rate: 12.00
  },
  {
    id: 'med-012',
    name: 'IV Cannula 20G (Pink)',
    generic_name: 'Intravenous Cannula with Injection Port',
    category: 'Hospital Surgical Consumables',
    dosage_form: 'Medical Device',
    strength: '20 Gauge',
    manufacturer: 'Becton Dickinson (BD)',
    shelf_location: 'Hospital Consumable Bay 3',
    min_stock_alert: 80,
    prescription_required: false,
    hsn_code: '90183900',
    gst_rate: 12.00
  }
]

export const INITIAL_BATCHES = [
  {
    id: 'batch-001',
    medicine_id: 'med-001',
    batch_number: 'AUG-2490',
    expiry_date: '2026-11-30', // ~2 months (warning/safe)
    cost_price: 145.00,
    mrp: 204.50,
    selling_price: 195.00,
    current_stock: 45,
    supplier_name: 'Apollo Pharma Distributors'
  },
  {
    id: 'batch-002',
    medicine_id: 'med-002',
    batch_number: 'DL-8821',
    expiry_date: '2027-08-31', // Healthy
    cost_price: 22.00,
    mrp: 34.00,
    selling_price: 32.00,
    current_stock: 220,
    supplier_name: 'Cipla Care Logistics'
  },
  {
    id: 'batch-003',
    medicine_id: 'med-003',
    batch_number: 'MNF-9904',
    expiry_date: '2026-10-15', // Expiring in < 25 days! (CRITICAL EXPIRY ALERT)
    cost_price: 45.00,
    mrp: 68.00,
    selling_price: 65.00,
    current_stock: 12, // Low stock too
    supplier_name: 'MedLife Surgicals & Biotics'
  },
  {
    id: 'batch-004',
    medicine_id: 'med-004',
    batch_number: 'TLM-5531',
    expiry_date: '2027-04-30',
    cost_price: 98.00,
    mrp: 142.00,
    selling_price: 135.00,
    current_stock: 85,
    supplier_name: 'Apollo Pharma Distributors'
  },
  {
    id: 'batch-005',
    medicine_id: 'med-005',
    batch_number: 'PND-3312',
    expiry_date: '2026-10-25', // Expiring in ~35 days (WARNING EXPIRY ALERT)
    cost_price: 120.00,
    mrp: 175.00,
    selling_price: 168.00,
    current_stock: 35,
    supplier_name: 'Cipla Care Logistics'
  },
  {
    id: 'batch-006',
    medicine_id: 'med-006',
    batch_number: 'INS-0199',
    expiry_date: '2027-01-31',
    cost_price: 165.00,
    mrp: 215.00,
    selling_price: 205.00,
    current_stock: 18,
    supplier_name: 'MedLife Surgicals & Biotics'
  },
  {
    id: 'batch-007',
    medicine_id: 'med-007',
    batch_number: 'AST-7744',
    expiry_date: '2026-08-31', // ALREADY EXPIRED! (TEST EXPIRED ALERT)
    cost_price: 110.00,
    mrp: 160.00,
    selling_price: 155.00,
    current_stock: 6,
    supplier_name: 'Cipla Care Logistics'
  },
  {
    id: 'batch-008',
    medicine_id: 'med-008',
    batch_number: 'NS-5501',
    expiry_date: '2028-02-28',
    cost_price: 28.00,
    mrp: 48.00,
    selling_price: 45.00,
    current_stock: 150,
    supplier_name: 'MedLife Surgicals & Biotics'
  },
  {
    id: 'batch-009',
    medicine_id: 'med-009',
    batch_number: 'AZT-2201',
    expiry_date: '2027-09-30',
    cost_price: 85.00,
    mrp: 130.00,
    selling_price: 122.00,
    current_stock: 40,
    supplier_name: 'Apollo Pharma Distributors'
  },
  {
    id: 'batch-010',
    medicine_id: 'med-010',
    batch_number: 'BTD-8890',
    expiry_date: '2027-06-30',
    cost_price: 115.00,
    mrp: 165.00,
    selling_price: 158.00,
    current_stock: 28,
    supplier_name: 'MedLife Surgicals & Biotics'
  },
  {
    id: 'batch-011',
    medicine_id: 'med-011',
    batch_number: 'EMS-4410',
    expiry_date: '2027-11-30',
    cost_price: 18.00,
    mrp: 32.00,
    selling_price: 30.00,
    current_stock: 8, // Low Stock (Alert)
    supplier_name: 'Cipla Care Logistics'
  },
  {
    id: 'batch-012',
    medicine_id: 'med-012',
    batch_number: 'CAN-1199',
    expiry_date: '2028-05-31',
    cost_price: 24.00,
    mrp: 45.00,
    selling_price: 40.00,
    current_stock: 180,
    supplier_name: 'MedLife Surgicals & Biotics'
  }
]

export const INITIAL_PATIENTS = [
  {
    id: 'pat-001',
    uhid: 'RVS-PAT-1001',
    name: 'Ramesh Kumar',
    phone: '+91 98451 11223',
    age: 48,
    gender: 'Male',
    blood_group: 'B+',
    doctor_name: 'Dr. Ananya Hegde (Cardiology)',
    diagnosis: 'Hypertension & Type 2 Diabetes',
    allergies: 'Penicillin',
    created_at: '2026-09-10T10:00:00Z'
  },
  {
    id: 'pat-002',
    uhid: 'RVS-PAT-1002',
    name: 'Priya Sundaram',
    phone: '+91 97422 33445',
    age: 32,
    gender: 'Female',
    blood_group: 'O+',
    doctor_name: 'Dr. Arvind Swamy (Pulmonology)',
    diagnosis: 'Acute Bronchial Asthma',
    allergies: 'None',
    created_at: '2026-09-12T14:30:00Z'
  },
  {
    id: 'pat-003',
    uhid: 'RVS-PAT-1003',
    name: 'Master Aarav Gowda',
    phone: '+91 99001 55667',
    age: 7,
    gender: 'Male',
    blood_group: 'A+',
    doctor_name: 'Dr. S. K. Murthy (Pediatrics)',
    diagnosis: 'Viral Fever & Pharyngitis',
    allergies: 'Sulfa drugs',
    created_at: '2026-09-15T11:15:00Z'
  },
  {
    id: 'pat-004',
    uhid: 'RVS-PAT-1004',
    name: 'Lakshmi Narayan',
    phone: '+91 98860 77889',
    age: 64,
    gender: 'Female',
    blood_group: 'AB+',
    doctor_name: 'Dr. Preeti Reddy (Orthopedics)',
    diagnosis: 'Osteoarthritis & Calcium Deficiency',
    allergies: 'NSAIDs',
    created_at: '2026-09-18T09:45:00Z'
  }
]

export const INITIAL_SUPPLIERS = [
  {
    id: 'sup-001',
    name: 'Rajesh Sharma',
    company_name: 'Apollo Pharma Distributors',
    phone: '+91 98450 12345',
    email: 'orders@apollopharma.com',
    gstin: '29ABCDE1234F1Z5',
    address: 'Industrial Estate, Phase 2, Bangalore - 560058',
    balance_payable: 14500.00
  },
  {
    id: 'sup-002',
    name: 'Dr. Vikram Rao',
    company_name: 'MedLife Surgicals & Biotics',
    phone: '+91 99880 54321',
    email: 'supply@medlifesurg.com',
    gstin: '29XYZAB5678G2Z3',
    address: 'Ring Road, Medical Complex, Bangalore - 560070',
    balance_payable: 8200.00
  },
  {
    id: 'sup-003',
    name: 'Sunita Patil',
    company_name: 'Cipla Care Logistics',
    phone: '+91 97410 88990',
    email: 'dist@ciplacare.in',
    gstin: '29PQRSM9876H3Z1',
    address: 'Peenya Industrial Area, Bangalore - 560058',
    balance_payable: 0.00
  }
]

export const INITIAL_REQUISITIONS = [
  {
    id: 'req-001',
    requisition_no: 'REQ-2026-081',
    department: 'ICU - Critical Care',
    requested_by: 'Dr. Arvind Swamy',
    priority: 'Emergency',
    status: 'Issued',
    bed_no: 'ICU-Bed-04',
    patient_uhid: 'RVS-PAT-1002',
    items_count: 3,
    notes: 'Immediate IV Salbutamol & Hydrocortisone administered',
    created_at: '2026-09-20T08:15:00Z'
  },
  {
    id: 'req-002',
    requisition_no: 'REQ-2026-082',
    department: 'Emergency / ER',
    requested_by: 'Dr. Preeti Reddy',
    priority: 'High',
    status: 'Issued',
    bed_no: 'ER-Bay-02',
    patient_uhid: 'RVS-PAT-1004',
    items_count: 2,
    notes: 'Tramadol Injection & Normal Saline 500ml',
    created_at: '2026-09-20T07:45:00Z'
  },
  {
    id: 'req-003',
    requisition_no: 'REQ-2026-083',
    department: 'Pediatric Ward',
    requested_by: 'Nurse Kavitha',
    priority: 'Normal',
    status: 'Issued',
    bed_no: 'PED-Bed-12',
    patient_uhid: 'RVS-PAT-1003',
    items_count: 1,
    notes: 'Paracetamol Pediatric Oral Drops',
    created_at: '2026-09-19T16:30:00Z'
  }
]

export const INITIAL_SALES = [
  {
    id: 'sale-001',
    invoice_number: 'RVS-INV-2026-1001',
    patient_id: 'pat-001',
    customer_name: 'Ramesh Kumar',
    customer_phone: '+91 98451 11223',
    doctor_name: 'Dr. Ananya Hegde',
    subtotal: 780.00,
    discount_amount: 39.00,
    tax_amount: 88.92,
    grand_total: 829.92,
    payment_mode: 'UPI',
    payment_status: 'Completed',
    created_at: '2026-09-20T08:45:00Z',
    items: [
      {
        id: 'si-1',
        medicine_name: 'Telma 40',
        batch_number: 'TLM-5531',
        quantity: 2,
        unit_price: 135.00,
        total_price: 270.00
      },
      {
        id: 'si-2',
        medicine_name: 'Human Mixtard 30/70 100IU',
        batch_number: 'INS-0199',
        quantity: 2,
        unit_price: 205.00,
        total_price: 410.00
      },
      {
        id: 'si-3',
        medicine_name: 'Pan-D Capsule',
        batch_number: 'PND-3312',
        quantity: 1,
        unit_price: 168.00,
        total_price: 168.00
      }
    ]
  },
  {
    id: 'sale-002',
    invoice_number: 'RVS-INV-2026-1002',
    patient_id: 'pat-002',
    customer_name: 'Priya Sundaram',
    customer_phone: '+91 97422 33445',
    doctor_name: 'Dr. Arvind Swamy',
    subtotal: 422.00,
    discount_amount: 20.00,
    tax_amount: 48.24,
    grand_total: 450.24,
    payment_mode: 'Cash',
    payment_status: 'Completed',
    created_at: '2026-09-20T09:10:00Z',
    items: [
      {
        id: 'si-4',
        medicine_name: 'Augmentin 625 Duo',
        batch_number: 'AUG-2490',
        quantity: 2,
        unit_price: 195.00,
        total_price: 390.00
      },
      {
        id: 'si-5',
        medicine_name: 'Dolo 650',
        batch_number: 'DL-8821',
        quantity: 1,
        unit_price: 32.00,
        total_price: 32.00
      }
    ]
  }
]
