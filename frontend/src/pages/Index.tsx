import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard, Product } from "@/components/products/ProductCard";
import { ProductModal } from "@/components/products/ProductModal";
import { products } from "@/data/products";
import { 
  ArrowRight, 
  Truck, 
  Users,
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
  Shield,
  Milk,
  IceCream,
  Store,
  ClipboardCheck,
  BadgePercent
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const featuredProducts = products.slice(0, 4);
  
  // Villages where you operate
const operatingVillages = [
  // Mangaon Taluka
  "Mangaon",
  "Goregaon (Raigad)",
  "Indapur",
  "Lonere",
  "Kolad",
  "Nizampur",
  "Tala",
  "Roha",

  // Mahad Taluka
  "Mahad",
  "Dasgaon",
  "Birwadi",
  "Tamhini",
  "Poladpur",
  "Kemburli",
  "Shirgaon"
];

  const serviceAreas = [
  { name: "Mangaon Taluka", count: 8, icon: MapPin },
  { name: "Mahad Taluka", count: 7, icon: MapPin }
];


  const businessStats = [
    { value: "500+", label: "Retail Shops Served", icon: Store },
    { value: "50+", label: "Daily Deliveries", icon: Truck },
    { value: "100%", label: "Fresh Products", icon: Milk },
    { value: "24/7", label: "Order Support", icon: Phone }
  ];    

  const productCategories = [
    {
      icon: Milk,
      title: "Fresh Dairy Products",
      items: ["Milk", "Curd", "Paneer", "Butter", "Ghee", "Cream"]
    },
    {
      icon: IceCream,
      title: "Ice Cream Supplies",
      items: ["Ice Cream Cones", "Scoops", "Toppings", "Syrups", "Wafers", "Cups"]
    },
    {
  icon: IceCream,
  title: "Frozen Items",
  items: [
    "Frozen Ice Cream Blocks",
    "Kulfi Sticks",
    "Frozen Desserts",
    "Ice Candy",
    "Frozen Milk Products",
    "Deep Freezer Supplies"
  ]
}

  ];

  const processSteps = [
    {
      icon: Phone,
      title: "Place Order",
      description: "Call or WhatsApp your order, or speak to our visiting salesman"
    },
    {
      icon: ClipboardCheck,
      title: "Order Confirmation",
      description: "We confirm stock availability and delivery time"
    },
    {
      icon: Truck,
      title: "Same Day Delivery",
      description: "Fresh products delivered to your shop within hours"
    },
    {
      icon: BadgePercent,
      title: "Best Prices",
      description: "Wholesale rates with volume discounts for retailers"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ================= HERO SECTION - WHOLESALER FOCUS ================= */}
      <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-blue-50 to-amber-50">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-blue-200 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-amber-200 blur-3xl" />
        </div>

        <div className="container relative z-10 flex min-h-[90vh] items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 border border-blue-200 mb-6">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Wholesale Supplier Since 2010
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-blue-700">Dairy & Ice Cream</span>
                <br />
                <span className="text-amber-600">Supplies Wholesaler</span>
              </h1>

              <p className="mt-6 text-lg text-gray-700">
                Serving 500+ retail shops in Gurgaon with fresh dairy products, 
                ice cream supplies, and packaging materials at wholesale prices.
                Our sales team visits shops daily to take your orders.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/products">
                    <Phone className="mr-2 h-5 w-5" />
                    Order Now: 98765-43210
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="border-blue-300">
                  <Link to="/retailers">
                    <Store className="mr-2 h-5 w-5" />
                    Register Your Shop
                  </Link>
                </Button>
              </div>

              {/* Operating Areas */}
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">Serving Areas:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {operatingVillages.slice(0, 6).map((village) => (
                    <span 
                      key={village}
                      className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-sm border border-blue-100"
                    >
                      {village}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6">
              {businessStats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg ₹{
                    index === 0 ? "col-span-2" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ₹{
                      index === 0 ? "bg-blue-100" : 
                      index === 1 ? "bg-green-100" : 
                      index === 2 ? "bg-amber-100" : "bg-purple-100"
                    }`}>
                      <stat.icon className={`h-6 w-6 ₹{
                        index === 0 ? "text-blue-600" : 
                        index === 1 ? "text-green-600" : 
                        index === 2 ? "text-amber-600" : "text-purple-600"
                      }`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900">
              Simple Order Process for Retailers
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Easy ordering through multiple channels with same-day delivery
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 h-full">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 mb-6">
                    <step.icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRODUCT CATEGORIES ================= */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900">
              Our Product Categories
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything a dairy or ice cream shop needs at wholesale prices
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {productCategories.map((category) => (
              <div 
                key={category.title}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-blue-50">
                    <category.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                </div>
                
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <Button asChild variant="outline" className="w-full mt-8 border-blue-300">
                  <Link to="/products">
                    View All {category.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SERVICE AREAS ================= */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-amber-50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900">
              Areas We Serve
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our sales team visits shops in these locations daily
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceAreas.map((area) => (
              <div key={area.name} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <area.icon className="h-8 w-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">{area.name}</h3>
                </div>
                <div className="text-3xl font-bold text-blue-700">{area.count}+</div>
                <div className="text-gray-600">Villages/Sectors</div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">Sample Areas:</div>
                  <div className="mt-2 space-y-1">
                    {operatingVillages
                      .slice(0, 3)
                      .map((village) => (
                        <div key={village} className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-700">{village}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full villages list */}
          <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Complete Coverage Areas:</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {operatingVillages.map((village) => (
                <div key={village} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700">{village}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">
                Featured Products
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Best selling items with special wholesale discounts
              </p>
            </div>
            <Button asChild variant="outline" className="border-blue-300">
              <Link to="/products" className="flex items-center gap-2">
                View Complete Price List
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <ProductCard
                  product={product}
                  onViewDetails={(p) => {
                    setSelectedProduct(p);
                    setModalOpen(true);
                  }}
                />
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">MOQ: 50 units</span>
                    <span className="text-sm font-semibold text-green-600">Bulk discount available</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA FOR RETAILERS ================= */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Shield className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold">
              Ready to Stock Your Shop?
            </h2>
            <p className="mt-4 text-xl opacity-90">
              Join 500+ retailers who trust us for their daily supplies.
              Get fresh products delivered to your shop every day.
            </p>
            
            <div className="mt-10 grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Clock className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Order Timing</h3>
                <p className="opacity-90">Daily: 7 AM - 8 PM</p>
                <p className="opacity-90">Sunday: 8 AM - 6 PM</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Users className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Contact Sales</h3>
                <p className="opacity-90">Phone: 98765-43210</p>
                <p className="opacity-90">WhatsApp: 98765-43210</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 h-14 px-8 rounded-xl"
                asChild
              >
                <Link to="/contact">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now to Order
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 h-14 px-8 rounded-xl"
                asChild
              >
                <Link to="/retailers">
                  <Store className="mr-2 h-5 w-5" />
                  Register Your Shop
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Index;