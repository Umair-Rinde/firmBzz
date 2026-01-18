from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['name', 'content_type', 'object_id', 'created_on']
    list_filter = ['content_type', 'created_on']
    search_fields = ['name', 'object_id']
    readonly_fields = ['created_on', 'updated_on']
    ordering = ['-created_on']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('content_type')
