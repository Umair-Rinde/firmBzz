from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, FirmUsers
from firm.models import Firm
from .choices import UserTypeChoices

class AccountAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.firm = Firm.objects.create(name='Test Firm', code='TF1')
        self.user = User.objects.create_user(
            phone='1234567890',
            full_name='Firm Admin',
            email='admin@firm.com',
            password='testpassword'
        )
        self.firm_user = FirmUsers.objects.create(
            user=self.user,
            firm=self.firm,
            role=UserTypeChoices.FIRM_ADMIN
        )
        self.url = '/api/accounts/login/'

    def test_firm_user_login_includes_firm_details(self):
        data = {
            "email": "admin@firm.com",
            "password": "testpassword"
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        user_data = response.data['data']
        self.assertIn('firm', user_data)
        self.assertEqual(user_data['firm']['name'], 'Test Firm')
        self.assertEqual(user_data['firm']['slug'], self.firm.slug)
        self.assertEqual(user_data['firm']['role'], UserTypeChoices.FIRM_ADMIN)
