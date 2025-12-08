import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Users, TrendingUp, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Access Thousands of Buyers",
    description: "Connect with verified businesses looking for products like yours.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Sales",
    description: "Expand your reach and increase revenue with our platform.",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "All payments are protected with our secure payment system.",
  },
  {
    icon: Building2,
    title: "Business Tools",
    description: "Access analytics, inventory management, and more.",
  },
];

const features = [
  "Free to join and list products",
  "Dedicated account manager",
  "Real-time analytics dashboard",
  "Flexible pricing options",
  "Marketing support included",
  "24/7 customer support",
];

const Retailers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient py-20 lg:py-28">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
                <Building2 className="h-4 w-4" />
                For Retailers & Sellers
              </span>
              <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Sell Your Products to{" "}
                <span className="text-primary">Thousands of Businesses</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Join FirmBizz and reach verified buyers across the country. 
                List your products, manage orders, and grow your business.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button variant="hero" size="xl">
                  Start Selling Today
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="hero-outline" size="xl">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-card-hover">
              <h3 className="font-heading text-xl font-bold text-foreground">
                Register as a Seller
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill out the form below to get started
              </p>
              <form className="mt-6 space-y-4">
                <div>
                  <Input placeholder="Business Name" />
                </div>
                <div>
                  <Input placeholder="Contact Email" type="email" />
                </div>
                <div>
                  <Input placeholder="Phone Number" type="tel" />
                </div>
                <div>
                  <Input placeholder="Product Category" />
                </div>
                <Button variant="hero" size="lg" className="w-full">
                  Submit Application
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Why Sell on FirmBizz?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to grow your B2B business
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-border bg-secondary/30 py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                Everything You Need to Succeed
              </h2>
              <p className="mt-4 text-muted-foreground">
                We provide all the tools and support you need to run a successful 
                B2B business on our platform.
              </p>
              <ul className="mt-8 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-card p-6 shadow-card">
                    <p className="font-heading text-3xl font-bold text-primary">10K+</p>
                    <p className="text-sm text-muted-foreground">Active Buyers</p>
                  </div>
                  <div className="rounded-2xl bg-card p-6 shadow-card">
                    <p className="font-heading text-3xl font-bold text-accent">₹50M+</p>
                    <p className="text-sm text-muted-foreground">Monthly Sales</p>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl bg-card p-6 shadow-card">
                    <p className="font-heading text-3xl font-bold text-foreground">98%</p>
                    <p className="text-sm text-muted-foreground">Seller Satisfaction</p>
                  </div>
                  <div className="rounded-2xl bg-card p-6 shadow-card">
                    <p className="font-heading text-3xl font-bold text-foreground">24/7</p>
                    <p className="text-sm text-muted-foreground">Support Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Retailers;
