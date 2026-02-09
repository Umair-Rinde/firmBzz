from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Firm

User = get_user_model()

class FirmAPITests(TestCase):
    def setUp(self):
        import jwt
        from django.conf import settings
        self.client = APIClient()
        self.user = User.objects.create_user(
            phone='1234567890',
            full_name='Test User',
            email='test@example.com',
            password='testpassword'
        )
        payload = {"user_id": str(self.user.id)}
        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        self.client.credentials(HTTP_AUTHORIZATION=token)
        
        self.firm1 = Firm.objects.create(name='Firm 1', code='F1', is_active=True)
        self.firm2 = Firm.objects.create(name='Firm 2', code='F2', is_active=True)
        self.url = '/api/firm/all/'

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
