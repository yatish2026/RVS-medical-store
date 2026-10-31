# ==============================================================================
# PythonAnywhere WSGI Configuration File (/var/www/yatish_pythonanywhere_com_wsgi.py)
# ==============================================================================
# In PythonAnywhere Web Tab -> Click on the "WSGI configuration file" link
# Delete everything inside and paste this:

import sys
import os

# 1. Add your cloned project directory to Python sys.path
project_home = '/home/yatish/RVS-medical-store'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# 2. Import the Flask application (auto-initializes free, zero-config SQLite hospital.db)
from pythonanywhere.app import app as application
