from .models import Document
from .serializers import DocumentSerializer
from portal.base import BaseResponse

class DocumentService:
    @staticmethod
    def upload_document(data):
        serializer = DocumentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return BaseResponse(
                message="Document uploaded successfully",
                data=serializer.data,
                status=201
            )
        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )
