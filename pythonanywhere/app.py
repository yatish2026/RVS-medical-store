"""
RVS Medical Store & Hospital Management System - Flask REST API Backend
Platform: PythonAnywhere (yatish.pythonanywhere.com)
Database: Built-in SQLite (hospital.db) - 100% Free, Zero Config, Persistent on Disk
Optional: MySQL support enabled if DB_PASSWORD is provided on paid plans
"""

import os
import json
import uuid
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="../dist", static_url_path="")
CORS(app)

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "hospital.db"))

def get_db():
    """Returns SQLite connection with dict-like row access"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables and seeds default demo staff accounts automatically"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            designation TEXT,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS medicines (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            generic_name TEXT,
            category TEXT,
            dosage_form TEXT,
            strength TEXT,
            manufacturer TEXT,
            shelf_location TEXT,
            min_stock_alert INTEGER DEFAULT 20,
            prescription_required INTEGER DEFAULT 1,
            hsn_code TEXT DEFAULT '30049099',
            gst_rate REAL DEFAULT 12.0,
            default_discount_percent REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS batches (
            id TEXT PRIMARY KEY,
            medicine_id TEXT NOT NULL,
            batch_number TEXT NOT NULL,
            expiry_date TEXT NOT NULL,
            cost_price REAL NOT NULL,
            mrp REAL NOT NULL,
            selling_price REAL NOT NULL,
            current_stock INTEGER NOT NULL DEFAULT 0,
            supplier_name TEXT,
            received_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            uhid TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            age INTEGER,
            gender TEXT,
            blood_group TEXT,
            doctor_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS suppliers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            company_name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            address TEXT,
            gstin TEXT,
            balance_payable REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS hospital_requisitions (
            id TEXT PRIMARY KEY,
            department TEXT NOT NULL,
            requested_by TEXT NOT NULL,
            items TEXT,
            priority TEXT DEFAULT 'Normal',
            status TEXT DEFAULT 'Requested',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sales (
            id TEXT PRIMARY KEY,
            invoice_number TEXT UNIQUE NOT NULL,
            patient_uhid TEXT,
            patient_name TEXT,
            patient_phone TEXT,
            doctor_name TEXT,
            subtotal REAL NOT NULL,
            discount_percentage REAL DEFAULT 0.0,
            discount_amount REAL DEFAULT 0.0,
            tax_amount REAL DEFAULT 0.0,
            grand_total REAL NOT NULL,
            payment_mode TEXT DEFAULT 'Cash',
            billed_by TEXT,
            billed_by_role TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sale_items (
            id TEXT PRIMARY KEY,
            sale_id TEXT NOT NULL,
            medicine_id TEXT,
            medicine_name TEXT NOT NULL,
            batch_id TEXT,
            batch_number TEXT,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            mrp REAL NOT NULL,
            gst_rate REAL DEFAULT 12.0,
            total_price REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS clinical_discount_policy (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            discount_percent REAL NOT NULL DEFAULT 15.0,
            authorized_by TEXT DEFAULT 'Dr. A. Sharma (MO)',
            reason TEXT DEFAULT 'Standard OPD Medicine Pack Discount',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Ensure only Super Admin exists by default (purge any old demo staff accounts)
    cursor.execute("DELETE FROM users WHERE username IN ('dr-yatish', 'doctor_mo', 'supervisor', 'pharmacist', 'dinesh')")
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE username='admin'")
    if cursor.fetchone()["count"] == 0:
        cursor.execute("""
            INSERT INTO users (id, username, password_hash, name, role, designation, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ("user-admin", "admin", "admin123", "Dr. Yatish", "admin_supervisor", "Chief Medical Administrator & Super Admin", "+91 98765 43210"))

    # Seed initial discount policy if not present (0% default)
    cursor.execute("SELECT COUNT(*) as count FROM clinical_discount_policy")
    if cursor.fetchone()["count"] == 0:
        cursor.execute("""
            INSERT INTO clinical_discount_policy (id, discount_percent, authorized_by, reason)
            VALUES (1, 0.0, 'None', 'Standard Bill Rate (No Discount Set)')
        """)

    # Ensure default_discount_percent column exists in medicines
    try:
        cursor.execute("ALTER TABLE medicines ADD COLUMN default_discount_percent REAL DEFAULT 0.0")
    except Exception:
        pass

    conn.commit()
    conn.close()

# Auto-initialize database on import
init_db()

# --- HEALTH CHECK ---
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "RVS Medical Store Flask API",
        "database": "Connected to SQLite (hospital.db) - 100% Free & Persistent",
        "platform": "PythonAnywhere Cloud",
        "timestamp": datetime.utcnow().isoformat()
    })

# --- DATABASE EXPLORER ENDPOINTS (For In-App DB Inspector) ---
ALLOWED_TABLES = [
    "users", "medicines", "batches", "patients", "suppliers",
    "hospital_requisitions", "sales", "sale_items", "clinical_discount_policy"
]

@app.route("/api/db/stats", methods=["GET"])
def db_stats():
    conn = get_db()
    cursor = conn.cursor()
    tables_info = []
    total_records = 0
    for tbl in ALLOWED_TABLES:
        try:
            cursor.execute(f"SELECT COUNT(*) as count FROM {tbl}")
            cnt = cursor.fetchone()["count"]
            tables_info.append({"name": tbl, "count": cnt})
            total_records += cnt
        except Exception as e:
            tables_info.append({"name": tbl, "count": 0, "error": str(e)})

    db_size_bytes = 0
    if os.path.exists(DB_PATH):
        db_size_bytes = os.path.getsize(DB_PATH)

    conn.close()
    return jsonify({
        "database_file": DB_PATH,
        "database_engine": "SQLite 3 (Serverless, File-based SQL)",
        "file_size_kb": round(db_size_bytes / 1024, 2),
        "total_records": total_records,
        "tables": tables_info,
        "status": "Online & Persistent"
    })

@app.route("/api/db/table/<table_name>", methods=["GET"])
def db_table_content(table_name):
    if table_name not in ALLOWED_TABLES:
        return jsonify({"error": "Table not allowed or does not exist"}), 400
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name} LIMIT 100")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({
        "table": table_name,
        "count": len(rows),
        "rows": rows
    })


# --- 1. AUTH & USERS ---
@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.json or {}
    username = data.get("username", "").strip().lower()
    password = data.get("password", "")

    # Quick preset fallback (Super Admin only)
    preset = {
        "admin": {"name": "Dr. Yatish", "role": "admin_supervisor", "pass": "admin123"}
    }

    if username in preset and preset[username]["pass"] == password:
        return jsonify({
            "success": True,
            "user": {
                "id": f"user-{username}",
                "username": username,
                "name": preset[username]["name"],
                "role": preset[username]["role"]
            }
        })

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, name, role, designation, phone FROM users WHERE LOWER(username)=? AND password_hash=?", (username, password))
    user = cursor.fetchone()
    conn.close()
    if user:
        return jsonify({"success": True, "user": dict(user)})

    return jsonify({"success": False, "error": "Invalid username or password"}), 401

@app.route("/api/users", methods=["GET", "POST"])
def handle_users():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json or {}
        user_id = data.get("id") or str(uuid.uuid4())
        cursor.execute("""
            INSERT OR REPLACE INTO users (id, username, password_hash, name, role, designation, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, data.get("username"), data.get("password") or "pass123",
            data.get("name"), data.get("role"), data.get("designation"), data.get("phone")
        ))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": user_id})

    # GET
    cursor.execute("SELECT id, username, name, role, designation, phone, created_at FROM users ORDER BY name ASC")
    users = [dict(u) for u in cursor.fetchall()]
    conn.close()
    return jsonify(users)

@app.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id=?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# --- 2. MEDICINES ---
@app.route("/api/medicines", methods=["GET", "POST"])
def handle_medicines():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json or {}
        med_id = data.get("id") or str(uuid.uuid4())
        cursor.execute("""
            INSERT OR REPLACE INTO medicines (id, name, generic_name, category, dosage_form, strength, manufacturer, shelf_location, min_stock_alert, prescription_required, hsn_code, gst_rate, default_discount_percent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            med_id, data.get("name"), data.get("generic_name", ""), data.get("category", "General"),
            data.get("dosage_form", "Tablet"), data.get("strength", ""), data.get("manufacturer", ""),
            data.get("shelf_location", "Rack A-01"), int(data.get("min_stock_alert") or 20),
            1 if data.get("prescription_required", True) else 0, data.get("hsn_code", "30049099"),
            float(data.get("gst_rate") or 12.0),
            float(data.get("default_discount_percent") or 0.0)
        ))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": med_id})

    # GET
    cursor.execute("SELECT * FROM medicines ORDER BY name ASC")
    items = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(items)

@app.route("/api/medicines/<med_id>", methods=["PUT", "DELETE"])
def medicine_detail(med_id):
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "DELETE":
        cursor.execute("DELETE FROM medicines WHERE id=?", (med_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True})

    # PUT
    data = request.json or {}
    cursor.execute("""
        UPDATE medicines SET name=?, generic_name=?, category=?, dosage_form=?,
        strength=?, manufacturer=?, shelf_location=?, min_stock_alert=?, gst_rate=?,
        default_discount_percent=?
        WHERE id=?
    """, (
        data.get("name"), data.get("generic_name"), data.get("category"), data.get("dosage_form"),
        data.get("strength"), data.get("manufacturer"), data.get("shelf_location"),
        int(data.get("min_stock_alert") or 20), float(data.get("gst_rate") or 12.0),
        float(data.get("default_discount_percent") or 0.0), med_id
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# --- 3. BATCHES ---
@app.route("/api/batches", methods=["GET", "POST"])
def handle_batches():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json or {}
        batch_id = data.get("id") or str(uuid.uuid4())
        cursor.execute("""
            INSERT OR REPLACE INTO batches (id, medicine_id, batch_number, expiry_date, cost_price, mrp, selling_price, current_stock, supplier_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            batch_id, data.get("medicine_id"), data.get("batch_number"), data.get("expiry_date"),
            float(data.get("cost_price") or 0), float(data.get("mrp") or 0),
            float(data.get("selling_price") or data.get("mrp") or 0),
            int(data.get("current_stock") or 0), data.get("supplier_name", "Primary Distributor")
        ))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": batch_id})

    # GET
    cursor.execute("SELECT * FROM batches ORDER BY expiry_date ASC")
    batches = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(batches)

@app.route("/api/batches/<batch_id>", methods=["PUT"])
def update_batch(batch_id):
    data = request.json or {}
    conn = get_db()
    cursor = conn.cursor()
    if "current_stock" in data:
        cursor.execute("UPDATE batches SET current_stock=? WHERE id=?", (int(data["current_stock"]), batch_id))
    else:
        cursor.execute("""
            UPDATE batches SET cost_price=?, mrp=?, selling_price=?, expiry_date=?
            WHERE id=?
        """, (
            float(data.get("cost_price") or 0), float(data.get("mrp") or 0),
            float(data.get("selling_price") or 0), data.get("expiry_date"), batch_id
        ))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# --- 4. PATIENTS ---
@app.route("/api/patients", methods=["GET", "POST"])
def handle_patients():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json or {}
        patient_id = data.get("id") or str(uuid.uuid4())
        uhid = data.get("uhid") or f"UHID-{int(datetime.utcnow().timestamp())}"
        cursor.execute("""
            INSERT OR REPLACE INTO patients (id, uhid, name, phone, age, gender, blood_group, doctor_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            patient_id, uhid, data.get("name"), data.get("phone", ""),
            int(data.get("age") or 30), data.get("gender", "Other"),
            data.get("blood_group", "O+"), data.get("doctor_name", "Dr. On-Duty")
        ))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": patient_id, "uhid": uhid})

    cursor.execute("SELECT * FROM patients ORDER BY name ASC")
    items = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(items)

# --- 5. SUPPLIERS ---
@app.route("/api/suppliers", methods=["GET", "POST"])
def handle_suppliers():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json or {}
        supplier_id = data.get("id") or str(uuid.uuid4())
        cursor.execute("""
            INSERT OR REPLACE INTO suppliers (id, name, company_name, phone, gstin, balance_payable)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            supplier_id, data.get("name"), data.get("company_name"),
            data.get("phone"), data.get("gstin", ""), float(data.get("balance_payable") or 0.0)
        ))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": supplier_id})

    cursor.execute("SELECT * FROM suppliers ORDER BY company_name ASC")
    items = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(items)

# --- 6. HOSPITAL REQUISITIONS ---
@app.route("/api/requisitions", methods=["GET", "POST"])
def handle_requisitions():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json or {}
        req_id = data.get("id") or str(uuid.uuid4())
        items_json = json.dumps(data.get("items", []))
        cursor.execute("""
            INSERT OR REPLACE INTO hospital_requisitions (id, department, requested_by, items, priority, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            req_id, data.get("department"), data.get("requested_by"), items_json,
            data.get("priority", "Normal"), data.get("status", "Requested"), data.get("notes", "")
        ))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": req_id})

    cursor.execute("SELECT * FROM hospital_requisitions ORDER BY created_at DESC")
    items = [dict(r) for r in cursor.fetchall()]
    for row in items:
        if isinstance(row.get("items"), str):
            try:
                row["items"] = json.loads(row["items"])
            except:
                pass
    conn.close()
    return jsonify(items)

@app.route("/api/requisitions/<req_id>", methods=["PUT"])
def update_requisition_status(req_id):
    data = request.json or {}
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE hospital_requisitions SET status=? WHERE id=?", (data.get("status", "Issued"), req_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# --- 7. SALES & BILLING ---
@app.route("/api/sales", methods=["GET", "POST"])
def handle_sales():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json or {}
        sale_id = data.get("id") or str(uuid.uuid4())
        invoice_number = data.get("invoice_number") or f"RVS-INV-{int(datetime.utcnow().timestamp())}"

        # 1. Insert into sales
        cursor.execute("""
            INSERT INTO sales (id, invoice_number, patient_uhid, patient_name, patient_phone, doctor_name,
            subtotal, discount_percentage, discount_amount, tax_amount, grand_total, payment_mode, billed_by, billed_by_role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sale_id, invoice_number, data.get("patient_uhid", ""), data.get("patient_name", "Walk-in Patient"),
            data.get("patient_phone", ""), data.get("doctor_name", "Dr. On-Duty"),
            float(data.get("subtotal") or 0), float(data.get("discount_percentage") or 0),
            float(data.get("discount_amount") or 0), float(data.get("tax_amount") or 0),
            float(data.get("grand_total") or 0), data.get("payment_mode", "Cash"),
            data.get("billed_by", "Pharmacist"), data.get("billed_by_role", "pharmacist")
        ))

        # 2. Insert line items & deduct batch stock
        items = data.get("items", [])
        for item in items:
            item_id = str(uuid.uuid4())
            qty = int(item.get("quantity") or 1)
            cursor.execute("""
                INSERT INTO sale_items (id, sale_id, medicine_id, medicine_name, batch_id, batch_number, quantity, unit_price, mrp, gst_rate, total_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item_id, sale_id, item.get("medicine_id", ""), item.get("medicine_name", ""),
                item.get("batch_id", ""), item.get("batch_number", ""), qty,
                float(item.get("unit_price") or 0), float(item.get("mrp") or 0),
                float(item.get("gst_rate") or 12.0), float(item.get("total_price") or 0)
            ))
            # Deduct batch stock safely in SQLite
            if item.get("batch_id"):
                cursor.execute("UPDATE batches SET current_stock = MAX(0, current_stock - ?) WHERE id=?", (qty, item["batch_id"]))

        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": sale_id, "invoice_number": invoice_number})

    # GET Sales
    cursor.execute("SELECT * FROM sales ORDER BY created_at DESC")
    sales = [dict(r) for r in cursor.fetchall()]
    cursor.execute("SELECT * FROM sale_items")
    all_items = [dict(r) for r in cursor.fetchall()]
    for s in sales:
        s["items"] = [it for it in all_items if it.get("sale_id") == s["id"]]
    conn.close()
    return jsonify(sales)

# --- 8. PRE-APPROVED CLINICAL DISCOUNT POLICY ---
@app.route("/api/discount-policy", methods=["GET", "POST"])
def handle_discount_policy():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json or {}
        pct = float(data.get("discount_percent", 0.0))
        auth_by = data.get("authorized_by", "None")
        reason = data.get("reason", "Standard Bill Rate (No Discount Set)")
        cursor.execute("""
            INSERT OR REPLACE INTO clinical_discount_policy (id, discount_percent, authorized_by, reason)
            VALUES (1, ?, ?, ?)
        """, (pct, auth_by, reason))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "discount_percent": pct, "authorized_by": auth_by})

    # GET
    cursor.execute("SELECT * FROM clinical_discount_policy WHERE id=1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify(dict(row))

    return jsonify({
        "discount_percent": 0.0,
        "authorized_by": "None",
        "reason": "Standard Bill Rate (No Discount Set)"
    })

# --- 9. 1-CLICK BULK SEED TO SQLITE ---
@app.route("/api/seed", methods=["POST"])
def seed_all():
    """Seeds full dataset from local storage into SQLite database"""
    data = request.json or {}
    conn = get_db()
    cursor = conn.cursor()
    try:
        # Seed medicines
        for m in data.get("medicines", []):
            cursor.execute("""
                INSERT OR REPLACE INTO medicines (id, name, generic_name, category, dosage_form, strength, manufacturer, shelf_location, min_stock_alert, gst_rate, default_discount_percent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (m.get("id"), m.get("name"), m.get("generic_name", ""), m.get("category", "General"),
                  m.get("dosage_form", "Tablet"), m.get("strength", ""), m.get("manufacturer", ""),
                  m.get("shelf_location", "Rack A-01"), int(m.get("min_stock_alert") or 20), float(m.get("gst_rate") or 12.0),
                  float(m.get("default_discount_percent") or 0.0)))

        # Seed batches
        for b in data.get("batches", []):
            cursor.execute("""
                INSERT OR REPLACE INTO batches (id, medicine_id, batch_number, expiry_date, cost_price, mrp, selling_price, current_stock, supplier_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (b.get("id"), b.get("medicine_id"), b.get("batch_number"), b.get("expiry_date"),
                  float(b.get("cost_price") or 0), float(b.get("mrp") or 0), float(b.get("selling_price") or b.get("mrp") or 0),
                  int(b.get("current_stock") or 0), b.get("supplier_name", "Apollo Pharma")))

        # Seed patients
        for p in data.get("patients", []):
            cursor.execute("""
                INSERT OR REPLACE INTO patients (id, uhid, name, phone, age, gender, blood_group, doctor_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (p.get("id"), p.get("uhid"), p.get("name"), p.get("phone", ""), int(p.get("age") or 30),
                  p.get("gender", "Other"), p.get("blood_group", "O+"), p.get("doctor_name", "")))

        # Seed suppliers
        for s in data.get("suppliers", []):
            cursor.execute("""
                INSERT OR REPLACE INTO suppliers (id, name, company_name, phone, gstin, balance_payable)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (s.get("id"), s.get("name"), s.get("company_name"), s.get("phone"), s.get("gstin", ""), float(s.get("balance_payable") or 0)))

        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "All hospital data seeded into SQLite database successfully!"})
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "error": str(e)}), 500

# --- 10. SERVE STATIC REACT FRONTEND ---
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../dist"))
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    if os.path.exists(os.path.join(dist_dir, "index.html")):
        return send_from_directory(dist_dir, "index.html")
    return jsonify({
        "status": "RVS Medical Store Flask API Active",
        "documentation": "Endpoints available at /api/health, /api/medicines, /api/batches, /api/sales, etc."
    })

if __name__ == "__main__":
    print("🏥 Starting RVS Hospital Flask API with SQLite on http://localhost:5000 ...")
    app.run(debug=True, port=5000)
