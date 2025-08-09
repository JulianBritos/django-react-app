#!/usr/bin/env python3

# Script para probar el matching de paths
import os
import sys

# Agregar el directorio del proyecto al path
sys.path.insert(0, '/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projectsSettings.settings')

import django
django.setup()

from apps.users.constants import GUEST_ALLOWED_PATHS, PUBLIC_PATHS
from apps.users.utils import is_guest_allowed_path, is_public_path

def test_path_matching():
    test_paths = [
        '/apps/carts/api/carts/current/',
        '/apps/carts/api/carts/test/',
        '/apps/carts/api/',
        '/apps/products/products/',
        '/apps/orders/api/orders/checkout/',
    ]
    
    print("=== GUEST ALLOWED PATHS ===")
    for path in GUEST_ALLOWED_PATHS:
        print(f"  {path}")
    
    print("\n=== PUBLIC PATHS ===")
    for path in PUBLIC_PATHS:
        print(f"  {path}")
    
    print("\n=== TESTING PATH MATCHING ===")
    for test_path in test_paths:
        is_guest = is_guest_allowed_path(test_path, GUEST_ALLOWED_PATHS)
        is_public = is_public_path(test_path, PUBLIC_PATHS)
        print(f"Path: {test_path}")
        print(f"  Guest allowed: {is_guest}")
        print(f"  Public: {is_public}")
        print()

if __name__ == '__main__':
    test_path_matching()
