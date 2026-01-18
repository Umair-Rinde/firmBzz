from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from . import apis
from drf_spectacular.openapi import AutoSchema


class DocumentUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    def post(self, request):
        return apis.DocumentService.upload_document(request.data)
