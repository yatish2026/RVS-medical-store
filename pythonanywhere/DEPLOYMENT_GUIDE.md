# 🏥 PythonAnywhere Deployment Guide (100% Free / Beginner Tier Ready)
**Project:** RVS Medical Store & Hospital Management System  
**Account:** `https://www.pythonanywhere.com/user/yatish/`  
**Backend:** Python 3.10 Flask REST API  
**Database:** Built-in SQLite (`hospital.db`) - **100% Free, Zero Config, Persistent on Disk**  
**Frontend:** React 18 (Pre-compiled into `dist/`)  

---

## 📌 Architecture Overview

On the PythonAnywhere Free/Beginner plan, MySQL is not available without upgrading to a paid plan.
To solve this, your system is built with **built-in SQLite (`hospital.db`)**:
1. **Zero Setup & Free:** Requires NO database setup in PythonAnywhere, NO SQL console, NO payments.
2. **Auto-Initializing:** Flask automatically creates all tables and seeds the demo staff accounts when it starts!
3. **Pre-built React UI:** Served directly by PythonAnywhere Nginx/Flask from `dist/` with zero Node.js setup needed.

---

## 🚀 Step-by-Step Deployment (Only 2 Steps on PythonAnywhere!)

### Step 1: Open Bash Console & Clone Code
1. Go to the **Consoles** tab on [PythonAnywhere](https://www.pythonanywhere.com/user/yatish/).
2. Click on **$ Bash** to open a new terminal.
3. In the terminal, run:
   ```bash
   cd ~
   git clone https://github.com/yatish2026/RVS-medical-store.git
   cd ~/RVS-medical-store
   mkvirtualenv --python=python3.10 rvs-env
   pip install -r pythonanywhere/requirements.txt
   ```
   *(If you already cloned it previously, just run: `cd ~/RVS-medical-store && git pull origin main`)*

---

### Step 2: Configure the Web App
1. Go to the **Web** tab in PythonAnywhere.
2. Click **Add a new web app**:
   - Domain: `yatish.pythonanywhere.com`
   - Select: **Manual configuration** *(Do NOT select Flask quickstart)*
   - Select Python version: **Python 3.10**
3. Once created, configure these sections on the page:

#### A. Virtualenv:
Under the **Virtualenv** section, enter:
```
/home/yatish/.virtualenvs/rvs-env
```
Click the checkmark.

#### B. Code:
Under the **Code** section, enter:
- **Source code:** `/home/yatish/RVS-medical-store`
- **Working directory:** `/home/yatish/RVS-medical-store`

#### C. WSGI Configuration File:
Click the link for **WSGI configuration file** (e.g. `/var/www/yatish_pythonanywhere_com_wsgi.py`).  
Select all text, delete it, and paste this simple configuration:

```python
import sys
import os

# 1. Project path
project_home = '/home/yatish/RVS-medical-store'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# 2. Import Flask Application (auto-creates free SQLite database on start)
from pythonanywhere.app import app as application
```
Click the green **Save** button in the top right.

#### D. Static Files:
In the **Static Files** section of the Web tab, add two entries:
1. **URL:** `/assets/` &nbsp;&nbsp; $\rightarrow$ &nbsp;&nbsp; **Directory:** `/home/yatish/RVS-medical-store/dist/assets`
2. **URL:** `/` &nbsp;&nbsp; $\rightarrow$ &nbsp;&nbsp; **Directory:** `/home/yatish/RVS-medical-store/dist`

---

### Step 3: Reload Your Web App
1. Scroll to the top of the **Web** tab.
2. Click the green button: **Reload yatish.pythonanywhere.com**.
3. Open a new tab in your browser and visit:  
   👉 **`https://yatish.pythonanywhere.com`**

---

## 🔄 Updating to the Latest Version (Whenever You Push Code)
If you have already configured the app once and want to fetch the latest updates:
1. Open your **$ Bash** console on PythonAnywhere.
2. Run:
   ```bash
   cd ~/RVS-medical-store
   git pull origin main
   ```
3. Go to the **Web** tab and click **Reload yatish.pythonanywhere.com**. That's it! Everything is live.

---

## 🔑 Authorized Super Administrator Account

| Role | Username | Password | Privileges & Authority |
|---|---|---|---|
| **Super Admin** | `admin` | `admin123` | **Full Authority**: Overall Bill Package Discounts, Individual Medicine Formulary Discounts, Inward/Edit Stock, Billing, and User/Staff Account Provisioning |

> **Security Note:** Public registration and pre-configured test logins have been removed. Any additional staff accounts (Doctors, Pharmacists, Supervisors) must be provisioned directly by the Super Admin inside the **Users & Roles** portal.
