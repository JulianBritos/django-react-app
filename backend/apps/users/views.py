from django.shortcuts import render, redirect
from django.http import JsonResponse

def email_confirmation(request, key):
    return redirect(f'http://localhost:3000/dj-rest-auth/registration/account-confirm-email/{key}')

def reset_password_confirm(request, uid, token):
    return redirect(f'http://localhost:3000/reset/password/confirm/{uid}/{token}')