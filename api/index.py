import sys
import os

# Dodanie katalogu głównego do ścieżki Python
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.server import app
