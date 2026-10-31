# ==============================================================================
# PythonAnywhere WSGI Configuration File (/var/www/yatish_pythonanywhere_com_wsgi.py)
# ==============================================================================
# In PythonAnywhere, go to Web Tab -> WSGI configuration file -> Click to edit
# Replace the file content with the snippet below:

import sys
import os

# 1. Add your project directory to Python sys.path
project_home = '/home/yatish/rvs-medical-store'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# 2. Set environment variables (for MySQL credentials)
os.environ['DB_USER'] = 'yatish'
os.environ['DB_PASSWORD'] = 'YOUR_MYSQL_PASSWORD_HERE'  # Set the password you created in Database tab
os.environ['DB_HOST'] = 'yatish.mysql.pythonanywhere-services.com'
os.environ['DB_NAME'] = 'yatish$rvs_hospital'

# 3. Import the Flask application from pythonanywhere/app.py
from pythonanywhere.app import app as application
