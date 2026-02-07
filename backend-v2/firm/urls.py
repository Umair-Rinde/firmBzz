from django.urls import path
from . import routes

urlpatterns = [
    path('setup/', routes.FirmCreateAPIView.as_view()),
    path('all/', routes.FirmListAPIView.as_view()),
    path('<slug:slug>/', routes.FirmDetailAPIView.as_view()),
    path('<slug:slug>/products/', routes.ProductListCreateAPIView.as_view()),
    path('<slug:slug>/users/', routes.FirmUserCreateAPIView.as_view()),
    
    # Vendor Order URLs
    path('<slug:slug>/vendor-orders/', routes.VendorOrderListCreateAPIView.as_view()),
    path('<slug:slug>/vendor-orders/<uuid:order_id>/', routes.VendorOrderDetailAPIView.as_view()),
    path('<slug:slug>/vendor-orders/<uuid:order_id>/receive/', routes.VendorOrderReceiveAPIView.as_view()),
]
