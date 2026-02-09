from django.urls import path
from . import routes

urlpatterns = [
    path('setup/', routes.FirmCreateAPIView.as_view()),
    path('all/', routes.FirmListAPIView.as_view()),
    path('<slug:slug>/', routes.FirmDetailAPIView.as_view()),
    path('<slug:slug>/products/', routes.ProductListCreateAPIView.as_view()),
    path('<slug:slug>/users/', routes.FirmUserCreateAPIView.as_view()),
    path('<slug:slug>/products/<uuid:product_id>/', routes.ProductDetailAPIView.as_view()),
    # Firm User Management
    path('<slug:slug>/firm-users/', routes.FirmUserListCreateAPIView.as_view()),
    path('<slug:slug>/firm-users/<uuid:user_id>/', routes.FirmUserDetailAPIView.as_view()),

    # Vendor Management
    path('<slug:slug>/vendors/', routes.VendorListCreateAPIView.as_view()),
    path('<slug:slug>/vendors/<uuid:vendor_id>/', routes.VendorDetailAPIView.as_view()),

    # Customer/Retailer Management
    path('<slug:slug>/customers/', routes.CustomerListCreateAPIView.as_view()),
    path('<slug:slug>/customers/<uuid:customer_id>/', routes.CustomerDetailAPIView.as_view()),

    # Vendor Order URLs
    path('<slug:slug>/vendor-orders/', routes.VendorOrderListCreateAPIView.as_view()),
    path('<slug:slug>/vendor-orders/<uuid:order_id>/', routes.VendorOrderDetailAPIView.as_view()),
    path('<slug:slug>/vendor-orders/<uuid:order_id>/receive/', routes.VendorOrderReceiveAPIView.as_view()),

]
