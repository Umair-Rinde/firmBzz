from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from . import apis
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.utils import extend_schema


class DocumentUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Upload Document",
        description="Upload a document file to the portal.",
        tags=["Portal"]
    )
    def post(self, request):
        return apis.DocumentService.upload_document(request.data)
