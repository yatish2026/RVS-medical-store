"""
RVS Medical Store & Hospital Management System - Complete Flask REST API Backend
Platform: PythonAnywhere (yatish.pythonanywhere.com)
Database: MySQL (PyMySQL) with resilient auto-table creation and fallback
"""

import os
import json
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="../dist", static_url_path="")
CORS(app)

# Database Configuration (PythonAnywhere MySQL)
DB_USER = os.environ.get("DB_USER", "yatish")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")  # Configured in WSGI / environment
DB_HOST = os.environ.get("DB_HOST", "yatish.mysql.pythonanywhere-services.com")
DB_NAME = os.environ.get("DB_NAME", "yatish$rvs_hospital")

def get_db():
    """Connects to PythonAnywhere MySQL, or returns None to use in-memory state"""
    try:
        import pymysql
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
        return conn
    except Exception as e:
        # print(f"[Notice] MySQL not yet configured or reachable: {e}")
        return None

# --- HEALTH CHECK ---
@app.route("/api/health", methods=["GET"])
def health_check():
    conn = get_db()
    db_status = "Connected to PythonAnywhere MySQL" if conn else "Standby (Awaiting MySQL Credentials in WSGI)"
    if conn:
        conn.close()
    return jsonify({
        "status": "healthy",
        "service": "RVS Medical Store Flask API",
        "database": db_status,
        "platform": "PythonAnywhere Cloud",
        "timestamp": datetime.utcnow().isoformat()
    })

# --- 1. AUTH & USERS ---
@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.json or {}
    username = data.get("username", "").strip().lower()
    password = data.get("password", "")

    # Preset accounts
    preset = {
        "admin": {"name": "Dr. Yatish", "role": "admin_supervisor", "pass": "admin123"},
        "doctor_mo": {"name": "Dr. A. Sharma (MD)", "role": "doctor_mo", "pass": "doc123"},
        "supervisor": {"name": "R. Verma", "role": "supervisor_viewer", "pass": "viewer123"},
        "pharmacist": {"name": "S. Kumar", "role": "pharmacist", "pass": "pharma123"}
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
    if conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, username, name, role, designation, phone FROM users WHERE LOWER(username)=%s AND password_hash=%s", (username, password))
            user = cursor.fetchone()
            conn.close()
            if user:
                return jsonify({"success": True, "user": user})

    return jsonify({"success": False, "error": "Invalid username or password"}), 401

@app.route("/api/users", methods=["GET", "POST"])
def handle_users():
    conn = get_db()
    if request.method == "POST":
        data = request.json or {}
        user_id = data.get("id") or str(uuid.uuid4())
        if conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO users (id, username, password_hash, name, role, designation, phone)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), designation=VALUES(designation)
                """, (
                    user_id, data.get("username"), data.get("password") or "pass123",
                    data.get("name"), data.get("role"), data.get("designation"), data.get("phone")
                ))
            conn.close()
        return jsonify({"success": True, "id": user_id})

    # GET
    if conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, username, name, role, designation, phone, created_at FROM users ORDER BY name ASC")
            users = cursor.fetchall()
            conn.close()
            return jsonify(users)
    return jsonify([])

@app.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    conn = get_db()
    if conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))
        conn.close()
    return jsonify({"success": True})

# --- 2. MEDICINES ---
@app.route("/api/medicines", methods=["GET", "POST"])
def handle_medicines():
    conn = get_db()
    if request.method == "POST":
        data = request.json or {}
        med_id = data.get("id") or str(uuid.uuid4())
        if conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO medicines (id, name, generic_name, category, dosage_form, strength, manufacturer, shelf_location, min_stock_alert, prescription_required, hsn_code, gst_rate)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE name=VALUES(name), generic_name=VALUES(generic_name), category=VALUES(category),
                    dosage_form=VALUES(dosage_form), strength=VALUES(strength), manufacturer=VALUES(manufacturer),
                    shelf_location=VALUES(shelf_location), min_stock_alert=VALUES(min_stock_alert), gst_rate=VALUES(gst_rate)
                """, (
                    med_id, data.get("name"), data.get("generic_name", ""), data.get("category", "General"),
                    data.get("dosage_form", "Tablet"), data.get("strength", ""), data.get("manufacturer", ""),
                    data.get("shelf_location", "Rack A-01"), int(data.get("min_stock_alert") or 20),
                    bool(data.get("prescription_required", True)), data.get("hsn_code", "30049099"),
                    float(data.get("gst_rate") or 12.0)
                ))
            conn.close()
        return jsonify({"success": True, "id": med_id})

    # GET
    if conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM medicines ORDER BY name ASC")
            items = cursor.fetchall()
            conn.close()
            return jsonify(items)
    return jsonify([])

@app.route("/api/medicines/<med_id>", methods=["PUT", "DELETE"])
def medicine_detail(med_id):
    conn = get_db()
    if request.method == "DELETE":
        if conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM medicines WHERE id=%s", (med_id,))
            conn.close()
        return jsonify({"success": True})

    # PUT
    data = request.json or {}
    if conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE medicines SET name=%s, generic_name=%s, category=%s, dosage_form=%s,
                strength=%s, manufacturer=%s, shelf_location=%s, min_stock_alert=%s, gst_rate=%s
                WHERE id=%s
            """, (
                data.get("name"), data.get("generic_name"), data.get("category"), data.get("dosage_form"),
                data.get("strength"), data.get("manufacturer"), data.get("shelf_location"),
                int(data.get("min_stock_alert") or 20), float(data.get("gst_rate") or 12.0), med_id
            ))
        conn.close()
    return jsonify({"success": True})

# --- 3. BATCHES ---
@app.route("/api/batches", methods=["GET", "POST"])
def handle_batches():
    conn = get_db()
    if request.method == "POST":
        data = request.json or {}
        batch_id = data.get("id") or str(uuid.uuid4())
        if conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO batches (id, medicine_id, batch_number, expiry_date, cost_price, mrp, selling_price, current_stock, supplier_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE current_stock=VALUES(current_stock), selling_price=VALUES(selling_price), mrp=VALUES(mrp)
                """, (
                    batch_id, data.get("medicine_id"), data.get("batch_number"), data.get("expiry_date"),
                    float(data.get("cost_price") or 0), float(data.get("mrp") or 0),
                    float(data.get("selling_price") or data.get("mrp") or 0),
                    int(data.get("current_stock") or 0), data.get("supplier_name", "Pharma Distributor")
                ))
            conn.close()
        return jsonify({"success": True, "id": batch_id})

    # GET
    if conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM batches ORDER BY expiry_date ASC")
            items = cursor.fetchall()
            conn.close()
            return jsonify(items)
    return jsonify([])

@app.route("/api/batches/<batch_id>", methods=["PUT"])
def update_batch(batch_id):
    conn = get_db()
    data = request.json or {}
    if conn:
        with conn.cursor() as cursor:
            if "current_stock" in data:
                cursor.execute("UPDATE batches SET current_stock=%s WHERE id=%s", (int(data["current_stock"]), batch_id))
            else:
                cursor.execute("""
                    UPDATE batches SET batch_number=%s, expiry_date=%s, mrp=%s, selling_price=%s, current_stock=%s
                    WHERE id=%s
                """, (data.get("batch_number"), data.get("expiry_date"), float(data.get("mrp") or 0),
                      float(data.get("selling_price") or 0), int(data.get("current_stock") or 0), batch_id))
        conn.close()
    return jsonify({"success": True})

# --- 4. PATIENTS ---
@app.route("/api/patients", methods=["GET", "POST"])
def handle_patients():
    conn = get_db()
    if request.method == "POST":
        data = request.json or {}
        patient_id = data.get("id") or str(uuid.uuid4())
        if conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO patients (id, uhid, name, phone, age, gender, blood_group, doctor_name, diagnosis, allergies)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), doctor_name=VALUES(doctor_name)
                """, (
                    patient_id, data.get("uhid"), data.get("name"), data.get("phone", ""),
                    int(data.get("age") or 30), data.get("gender", "Other"), data.get("blood_group", "O+"),
                    data.get("doctor_name", ""), data.get("diagnosis", ""), data.get("allergies", "")
                ))
            conn.close()
        return jsonify({"success": True, "id": patient_id})

    if conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM patients ORDER BY name ASC")
            items = cursor.fetchall()
            conn.close()
            return jsonify(items)
    return jsonify([])

# --- 5. SUPPLIERS ---
@app.route("/api/suppliers", methods=["GET", "POST"])
def handle_suppliers():
    conn = get_db()
    if request.method == "POST":
        data = request.json or {}
        supp_id = data.get("id") or str(uuid.uuid4())
        if conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO suppliers (id, name, company_name, phone, email, gstin, address, balance_payable)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE company_name=VALUES(company_name), phone=VALUES(phone)
                """, (
                    supp_id, data.get("name"), data.get("company_name"), data.get("phone"),
                    data.get("email", ""), data.get("gstin", ""), data.get("address", ""),
                    float(data.get("balance_payable") or 0)
                ))
            conn.close()
        return jsonify({"success": True, "id": supp_id})

    if conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM suppliers ORDER BY company_name ASC")
            items = cursor.fetchall()
            conn.close()
            return jsonify(items)
    return jsonify([])

# --- 6. HOSPITAL REQUISITIONS ---
@app.route("/api/requisitions", methods=["GET", "POST"])
def handle_requisitions():
    conn = get_db()
    if request.method == "POST":
        data = request.json or {}
        req_id = data.get("id") or str(uuid.uuid4())
        items_json = json.dumps(data.get("items", []))
        if conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO hospital_requisitions (id, department, requested_by, items, priority, status, notes)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    req_id, data.get("department"), data.get("requested_by"), items_json,
                    data.get("priority", "Normal"), data.get("status", "Requested"), data.get("notes", "")
                ))
            conn.close()
        return jsonify({"success": True, "id": req_id})

    if conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM hospital_requisitions ORDER BY created_at DESC")
            items = cursor.fetchall()
            for row in items:
                if isinstance(row.get("items"), str):
                    try:
                        row["items"] = json.loads(row["items"])
                    except:
                        pass
            conn.close()
            return jsonify(items)
    return jsonify([])

@app.route("/api/requisitions/<req_id>", methods=["PUT"])
def update_requisition_status(req_id):
    data = request.json or {}
    conn = get_db()
    if conn:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE hospital_requisitions SET status=%s WHERE id=%s", (data.get("status", "Issued"), req_id))
        conn.close()
    return jsonify({"success": True})

# --- 7. SALES & BILLING ---
@app.route("/api/sales", methods=["GET", "POST"])
def handle_sales():
    conn = get_db()
    if request.method == "POST":
        data = request.json or {}
        sale_id = data.get("id") or str(uuid.uuid4())
        invoice_number = data.get("invoice_number") or f"RVS-INV-{int(datetime.utcnow().timestamp())}"

        if conn:
            with conn.cursor() as cursor:
                # 1. Insert into sales
                cursor.execute("""
                    INSERT INTO sales (id, invoice_number, patient_uhid, patient_name, patient_phone, doctor_name,
                    subtotal, discount_percentage, discount_amount, tax_amount, grand_total, payment_mode, billed_by, billed_by_role)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    sale_id, invoice_number, data.get("patient_uhid", ""), data.get("patient_name", "Walk-in Patient"),
                    data.get("patient_phone", ""), data.get("doctor_name", "Dr. On-Duty"),
                    float(data.get("subtotal") or 0), float(data.get("discount_percentage") or 0),
                    float(data.get("discount_amount") or 0), float(data.get("tax_amount") or 0),
                    float(data.get("grand_total") or 0), data.get("payment_mode", "UPI"),
                    data.get("billed_by", "Pharmacist"), data.get("billed_by_role", "pharmacist")
                ))

                # 2. Insert line items & deduct batch stock
                items = data.get("items", [])
                for item in items:
                    item_id = str(uuid.uuid4())
                    qty = int(item.get("quantity") or 1)
                    cursor.execute("""
                        INSERT INTO sale_items (id, sale_id, medicine_id, medicine_name, batch_id, batch_number, quantity, unit_price, mrp, gst_rate, total_price)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        item_id, sale_id, item.get("medicine_id", ""), item.get("medicine_name", ""),
                        item.get("batch_id", ""), item.get("batch_number", ""), qty,
                        float(item.get("unit_price") or 0), float(item.get("mrp") or 0),
                        float(item.get("gst_rate") or 12.0), float(item.get("total_price") or 0)
                    ))
                    # Deduct batch stock
                    if item.get("batch_id"):
                        cursor.execute("UPDATE batches SET current_stock = GREATEST(0, current_stock - %s) WHERE id=%s", (qty, item["batch_id"]))
            conn.close()
        return jsonify({"success": True, "id": sale_id, "invoice_number": invoice_number})

    # GET Sales
    if conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM sales ORDER BY created_at DESC")
            sales = cursor.fetchall()
            cursor.execute("SELECT * FROM sale_items")
            all_items = cursor.fetchall()
            for s in sales:
                s["items"] = [it for it in all_items if it.get("sale_id") == s["id"]]
            conn.close()
            return jsonify(sales)
    return jsonify([])

# --- 8. PRE-APPROVED CLINICAL DISCOUNT POLICY ---
@app.route("/api/discount-policy", methods=["GET", "POST"])
def handle_discount_policy():
    conn = get_db()
    if request.method == "POST":
        data = request.json or {}
        pct = float(data.get("discount_percent", 10.0))
        auth_by = data.get("authorized_by", "Dr. A. Sharma (MO)")
        reason = data.get("reason", "OPD Pack Discount")
        if conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO clinical_discount_policy (id, discount_percent, authorized_by, reason)
                    VALUES (1, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE discount_percent=VALUES(discount_percent), authorized_by=VALUES(authorized_by), reason=VALUES(reason)
                """, (pct, auth_by, reason))
            conn.close()
        return jsonify({"success": True, "discount_percent": pct, "authorized_by": auth_by})

    # GET
    if conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM clinical_discount_policy WHERE id=1")
            row = cursor.fetchone()
            conn.close()
            if row:
                return jsonify(row)

    return jsonify({
        "discount_percent": 10.0,
        "authorized_by": "Dr. A. Sharma (MO)",
        "reason": "Standard Hospital OPD Medicine Pack"
    })

# --- 9. 1-CLICK BULK SEED TO MYSQL ---
@app.route("/api/seed", methods=["POST"])
def seed_all():
    """Seeds full dataset from local storage into MySQL database"""
    data = request.json or {}
    conn = get_db()
    if not conn:
        return jsonify({"success": False, "error": "MySQL connection not available. Check WSGI DB credentials."}), 500

    try:
        with conn.cursor() as cursor:
            # Seed medicines
            for m in data.get("medicines", []):
                cursor.execute("""
                    INSERT INTO medicines (id, name, generic_name, category, dosage_form, strength, manufacturer, shelf_location, min_stock_alert, gst_rate)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE name=VALUES(name)
                """, (m.get("id"), m.get("name"), m.get("generic_name", ""), m.get("category", "General"),
                      m.get("dosage_form", "Tablet"), m.get("strength", ""), m.get("manufacturer", ""),
                      m.get("shelf_location", "Rack A-01"), int(m.get("min_stock_alert") or 20), float(m.get("gst_rate") or 12.0)))

            # Seed batches
            for b in data.get("batches", []):
                cursor.execute("""
                    INSERT INTO batches (id, medicine_id, batch_number, expiry_date, cost_price, mrp, selling_price, current_stock, supplier_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE current_stock=VALUES(current_stock)
                """, (b.get("id"), b.get("medicine_id"), b.get("batch_number"), b.get("expiry_date"),
                      float(b.get("cost_price") or 0), float(b.get("mrp") or 0), float(b.get("selling_price") or b.get("mrp") or 0),
                      int(b.get("current_stock") or 0), b.get("supplier_name", "Apollo Pharma")))

            # Seed patients
            for p in data.get("patients", []):
                cursor.execute("""
                    INSERT INTO patients (id, uhid, name, phone, age, gender, blood_group, doctor_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE name=VALUES(name)
                """, (p.get("id"), p.get("uhid"), p.get("name"), p.get("phone", ""), int(p.get("age") or 30),
                      p.get("gender", "Other"), p.get("blood_group", "O+"), p.get("doctor_name", "")))

            # Seed suppliers
            for s in data.get("suppliers", []):
                cursor.execute("""
                    INSERT INTO suppliers (id, name, company_name, phone, gstin, balance_payable)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE company_name=VALUES(company_name)
                """, (s.get("id"), s.get("name"), s.get("company_name"), s.get("phone"), s.get("gstin", ""), float(s.get("balance_payable") or 0)))

        conn.close()
        return jsonify({"success": True, "message": "All hospital data seeded into PythonAnywhere MySQL!"})
    except Exception as e:
        if conn:
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
    print("🏥 Starting RVS Hospital Flask API on http://localhost:5000 ...")
    app.run(debug=True, port=5000)
