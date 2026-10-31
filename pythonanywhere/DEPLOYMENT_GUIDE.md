# 🏥 Complete PythonAnywhere Deployment Guide (GitHub to Cloud)
**Project:** RVS Medical Store & Hospital Management System  
**Account:** `https://www.pythonanywhere.com/user/yatish/`  
**Backend:** Python 3.10 Flask REST API  
**Database:** PythonAnywhere MySQL (`yatish$rvs_hospital`)  
**Frontend:** React 18 (Built & served via Flask)  

---

## 📌 Architecture Overview

Supabase has been **completely removed** from the project.  
Your application now runs entirely on **PythonAnywhere**:
1. **Flask API Backend (`pythonanywhere/app.py`):** Handles all REST API requests (`/api/medicines`, `/api/batches`, `/api/sales`, `/api/users`, etc.).
2. **PythonAnywhere MySQL:** Stores all hospital data, inventory, patients, and staff logins.
3. **Static File Serving:** Flask automatically serves your pre-compiled React frontend (`dist/`) directly to visitors at `https://yatish.pythonanywhere.com`.

---

## 🚀 Step-by-Step Deployment from GitHub

### Step 1: Push All Updated Code to GitHub (From Your Local Machine)
In your local project terminal (in VS Code or PowerShell):
```bash
git add .
git commit -m "Remove Supabase and integrate PythonAnywhere Flask REST API and MySQL"
git push origin main
```

---

### Step 2: Initialize Your MySQL Database on PythonAnywhere
1. Log in to your [PythonAnywhere Dashboard](https://www.pythonanywhere.com/user/yatish/).
2. Click on the **"Databases"** tab in the top navigation bar.
3. Under **"Create a database"**, enter:
   - Database name: `rvs_hospital` (PythonAnywhere will name it `yatish$rvs_hospital`).
   - If not done already, set your MySQL Password and click **"Save"**.
4. In the same Databases tab, click on **"Start a console on yatish$rvs_hospital"** (this opens an interactive MySQL console).
5. Open [`pythonanywhere/schema.sql`](./schema.sql) in your code editor, copy the entire script, paste it into the MySQL console, and press **Enter**.
   - *This creates all tables: `users`, `medicines`, `batches`, `patients`, `suppliers`, `sales`, and `clinical_discount_policy`.*
6. Type `exit;` and press Enter to close the MySQL console.

---

### Step 3: Clone Your Code in PythonAnywhere Bash Console
1. Go to the **"Consoles"** tab on PythonAnywhere.
2. Click on **"Bash"** to open a new bash terminal.
3. In the bash terminal, clone your GitHub repository:
   ```bash
   cd ~
   git clone https://github.com/yatish2026/RVS-medical-store.git
   cd ~/RVS-medical-store
   ```
   *(Note: If the directory already exists, you can simply pull updates with: `git pull origin main`)*

4. Create and activate a Python 3.10 virtual environment:
   ```bash
   mkvirtualenv --python=python3.10 rvs-env
   pip install -r pythonanywhere/requirements.txt
   ```

---

### Step 4: Configure the Web App on PythonAnywhere
1. Click on the **"Web"** tab in the top navigation bar.
2. If you don't have a web app yet, click **"Add a new web app"**:
   - Choose domain: `yatish.pythonanywhere.com`
   - Select: **Manual configuration**
   - Select Python version: **Python 3.10**
3. Once created, scroll down the Web tab page and set the following paths:

#### A. Virtualenv Path:
Under the **"Virtualenv"** section, enter:
```
/home/yatish/.virtualenvs/rvs-env
```

#### B. Code & Working Directory:
Under the **"Code"** section, enter:
- **Source code:** `/home/yatish/RVS-medical-store`
- **Working directory:** `/home/yatish/RVS-medical-store`

#### C. WSGI Configuration File:
Click on the link for **WSGI configuration file** (e.g. `/var/www/yatish_pythonanywhere_com_wsgi.py`).  
Delete everything in the file and replace it with:

```python
import sys
import os

# 1. Project path
project_home = '/home/yatish/RVS-medical-store'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# 2. Database credentials (set your MySQL password below)
os.environ['DB_USER'] = 'yatish'
os.environ['DB_PASSWORD'] = 'YOUR_MYSQL_PASSWORD_HERE'  # <-- Replace with your MySQL password
os.environ['DB_HOST'] = 'yatish.mysql.pythonanywhere-services.com'
os.environ['DB_NAME'] = 'yatish$rvs_hospital'

# 3. Import the Flask application
from pythonanywhere.app import app as application
```
Click **"Save"** in the top right.

#### D. Static Files:
In the **"Static Files"** section of the Web tab, add two entries:
1. **URL:** `/assets/`  
   **Directory:** `/home/yatish/RVS-medical-store/dist/assets`
2. **URL:** `/`  
   **Directory:** `/home/yatish/RVS-medical-store/dist`

---

### Step 5: Reload Your Web App & Verify
1. Scroll back to the top of the **"Web"** tab.
2. Click the big green button: **"Reload yatish.pythonanywhere.com"**.
3. Open your browser and navigate to:  
   👉 **`https://yatish.pythonanywhere.com`**

You can also test your live API health endpoint:  
👉 **`https://yatish.pythonanywhere.com/api/health`**  
*(Returns: `{"status": "healthy", "database": "Connected to PythonAnywhere MySQL"}`)*

---

## 🔑 Default Staff Credentials for Testing Roles

| Role | Username | Password | Privileges |
|---|---|---|---|
| **Super Admin** | `admin` | `admin123` | Full access + Create staff logins & assign roles |
| **Medical Officer (Doctor / MO)** | `doctor_mo` | `doc123` | Prescribe medicines + Apply complete pack clinical discounts |
| **Supervisor (Read-Only / Auditor)** | `supervisor` | `viewer123` | Audit mode only; all editing and billing checkout buttons are locked |
| **Pharmacist (Dispensary)** | `pharmacist` | `pharma123` | Inward stock, add medicines, POS billing; **discount alteration locked** (reflects Doctor/Admin pre-approved discount) |
