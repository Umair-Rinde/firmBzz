from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Firm

User = get_user_model()

class FirmAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.force_authenticate(user=self.user)
        
        self.firm1 = Firm.objects.create(name='Firm 1', code='F1', is_active=True)
        self.firm2 = Firm.objects.create(name='Firm 2', code='F2', is_active=True)
        self.url = '/firm/all/'

    def test_get_all_firms(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # The response structure is wrapped in BaseResponse, so we expect data to be in response.data['data']
        # Based on apis.py: return BaseResponse(data=serializer.data, status=200)
        # And BaseResponse likely returns a dictionary.
        # Let's verify the content.
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 2)
        firm_names = [f['name'] for f in response.data['data']]
        self.assertIn('Firm 1', firm_names)
        self.assertIn('Firm 2', firm_names)
