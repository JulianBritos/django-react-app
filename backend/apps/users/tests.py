from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.conf import settings
from unittest.mock import patch
from django.contrib.auth import get_user_model

class UserTests(TestCase):
    def setUp(self):
        User = get_user_model()  # Obtener el modelo de usuario activo
        User.objects.create_user(username="testuser", password="testpassword")
        self.client = APIClient()
        self.login_url = "/apps/user/login/"
        self.valid_recaptcha_token = "valid_token"
        self.invalid_recaptcha_token = "invalid_token"

    @patch("apps.users.views.external_requests.post")
    def test_login_with_valid_credentials_and_recaptcha(self, mock_post):
        # Simular una respuesta válida de reCAPTCHA
        mock_post.return_value.json.return_value = {
            "success": True,
            "score": 0.9,
        }

        response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "testpassword",
            "recaptchaToken": self.valid_recaptcha_token,
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    @patch("apps.users.views.external_requests.post")
    def test_login_with_invalid_recaptcha(self, mock_post):
        # Simular una respuesta inválida de reCAPTCHA
        mock_post.return_value.json.return_value = {
            "success": False,
            "score": 0.1,
        }

        response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "testpassword",
            "recaptchaToken": self.invalid_recaptcha_token,
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    @patch("apps.users.views.external_requests.post")
    def test_login_with_invalid_credentials(self, mock_post):
        # Simular una respuesta válida de reCAPTCHA
        mock_post.return_value.json.return_value = {
            "success": True,
            "score": 0.9,
        }

        response = self.client.post(self.login_url, {
            "username": "wronguser",
            "password": "wrongpassword",
            "recaptchaToken": self.valid_recaptcha_token,
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", response.data)
