import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Shield, Users, BarChart3, Wallet, CheckCircle2, Clock, Settings, Sparkles, ChevronDown, ChevronUp, Mail, X, Menu, Star, Phone, MapPin, Calendar, Zap, TrendingUp, Award } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const LandingPage = () => {
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for FAQ accordion
  const [openFAQ, setOpenFAQ] = useState(null);
  
  // State for testimonial carousel
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // State for scroll effects
  const [isScrolled, setIsScrolled] = useState(false);
  
  // State for pricing toggle
  const [isYearly, setIsYearly] = useState(false);
  
  // Refs for smooth scrolling
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const pricingRef = useRef(null);
  const faqRef = useRef(null);
  const testimonials = [
    {
      id: 1,
      name: "Rajesh Kumar",
      role: "PG Owner, Bangalore",
      image: "RK",
      text: "PGMate has transformed how I run my 3 PG properties. The time saved on administrative tasks alone has been worth the investment. The dashboard gives me real-time insights I never had before.",
      rating: 5,
      company: "Kumar Properties"
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Property Manager, Delhi",
      image: "PS",
      text: "The financial tracking features have given me complete visibility into our cash flow. I can now make data-driven decisions with confidence. The automated rent collection is a game-changer.",
      rating: 5,
      company: "Sharma Real Estate"
    },
    {
      id: 3,
      name: "Vikram Singh",
      role: "Director, Mumbai PG Network",
      image: "VS",
      text: "Our tenant satisfaction has increased dramatically since implementing PGMate. The maintenance request system alone has cut our response time in half. Highly recommended!",
      rating: 5,
      company: "Mumbai PG Network"
    },
    {
      id: 4,
      name: "Anjali Patel",
      role: "Property Owner, Pune",
      image: "AP",
      text: "The mobile app is fantastic! I can manage my properties from anywhere. The tenant portal has reduced so many phone calls and made everything more organized.",
      rating: 5,
      company: "Patel Properties"
    }
  ];
  
  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll function
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };
  
  // FAQ toggle handler
  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  
  // FAQ data
  const faqs = [
    {
      question: "What is the pricing structure for the PG management system?",
      answer: "We offer a tiered pricing model based on the number of beds you manage. We have four plans: Starter, Growth, Pro, and Enterprise, designed to fit different business sizes and needs. You can choose to pay monthly or get a discount with an annual subscription."
    },
    {
      question: "What is the difference between the plans?",
      answer: "The main difference lies in the number of beds and properties you can manage, as well as the advanced features and support included. The Starter plan is for small PGs with up to 50 beds. The Growth plan is for businesses with up to 150 beds and includes multi-property management. The Pro plan is for larger PGs with up to 200 beds and offers advanced analytics. The Enterprise plan provides unlimited beds and a complete, customized solution with dedicated support."
    },
    {
      question: "Can I manage multiple properties on a single plan?",
      answer: "Yes, multi-property management is available starting from the Growth plan, which allows you to manage up to 5 properties. The Pro plan allows up to 10 properties, and the Enterprise plan provides unlimited properties."
    },
    {
      question: "Are there any discounts for paying annually?",
      answer: "Yes, we offer a 16% discount on our plans when you choose an annual subscription over a monthly one."
    },
    {
      question: "What are the limits on staff accounts?",
      answer: "The Starter plan includes up to 5 staff accounts, and the Growth plan accommodates up to 15. The Pro and Enterprise plans offer unlimited staff accounts to support larger teams."
    },
    {
      question: "How do the SMS and email reminders work?",
      answer: "All our plans include a set number of free SMS reminders per month. Starter: 100 SMS per month, Growth: 500 SMS per month, Pro: 750 SMS per month, Enterprise: Unlimited SMS. All plans include unlimited email reminders."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes, we offer a free trial for you to experience our features before committing to a plan. Please check our website for the latest trial details."
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes, all our plans include standard customer support via email and chat. The Growth and Pro plans include a dedicated account manager and priority support. For our Enterprise clients, we provide 24/7 priority phone support."
    },
    {
      question: "What are the key features for managing expenses?",
      answer: "All plans include basic expense tracking. The Growth, Pro, and Enterprise plans offer advanced expense and revenue tracking, along with detailed financial reports to help you monitor your PG's profitability."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can upgrade your plan at any time as your business grows. You can also downgrade your plan if your needs change. Our system will automatically adjust your billing accordingly."
    },
    {
      question: "What is the backend technology used for the application?",
      answer: "Our application is built using ReactJS for the front end and a combination of Node.js, Express, and MongoDB for the backend."
    },
    {
      question: "Is GST included in the pricing?",
      answer: "The prices listed do not include Goods and Services Tax (GST). All prices are exclusive of GST, which will be added at the time of payment as per the government regulations."
    }
  ];

  // Pricing data
  const pricingPlans = [
    {
      name: "Starter",
      monthlyPrice: 499,
      yearlyPrice: 4999,
      description: "Perfect for small to medium PG owners",
      bedLimit: "Up to 50 beds",
      features: [
        "Tenant & Staff Management (up to 5 staff)",
        "Property & Room Management (up to 2 properties)",
        "Automated Rent Reminders (100 SMS/month)",
        "Expense Tracking",
        "Basic Service Request Management",
        "Dashboard & Basic Reports",
        "Standard Customer Support"
      ],
      notIncluded: [
        "Multi-property management",
        "Advanced analytics",
        "Priority support"
      ],
      popular: false
    },
    {
      name: "Growth",
      monthlyPrice: 999,
      yearlyPrice: 9999,
      description: "Most Popular - For established PG owners",
      bedLimit: "Up to 150 beds",
      features: [
        "Everything in Starter, plus:",
        "Multi-Property Management (up to 5 properties)",
        "Unlimited Staff Accounts (15 staff)",
        "Advanced Expense & Revenue Tracking",
        "Automated Welcome & Dues Reminders (500 SMS/month)",
        "Advanced Analytics & Financial Reports",
        "Dedicated Account Manager & Priority Support"
      ],
      notIncluded: [
        "Unlimited properties",
        "24/7 phone support"
      ],
      popular: true
    },
    {
      name: "Pro",
      monthlyPrice: 1299,
      yearlyPrice: 12999,
      description: "For large PG operators",
      bedLimit: "Up to 200 beds",
      features: [
        "Everything in Growth, plus:",
        "Up to 10 properties",
        "Advanced Analytics & Customizable Reports",
        "Priority Support with faster response times",
        "Increased SMS Reminders (750 SMS/month)",
        "Advanced Financial Reporting",
        "Custom Dashboard Views"
      ],
      notIncluded: [
        "Unlimited beds",
        "24/7 phone support"
      ],
      popular: false
    },
    {
      name: "Enterprise",
      monthlyPrice: 1999,
      yearlyPrice: 19999,
      description: "For large-scale PG chains",
      bedLimit: "Unlimited beds",
      features: [
        "Everything in Pro, plus:",
        "Unlimited Properties & Beds",
        "Unlimited Staff Accounts",
        "Unlimited SMS Reminders",
        "Customizable Reports & Dashboards",
        "24/7 Priority Phone Support",
        "Data Migration Assistance",
        "White-label Solution"
      ],
      notIncluded: [],
      popular: false
    }
  ];
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Modern Design */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
          <div className="flex items-center">
              <div className="relative">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="ml-3 cursor-pointer text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                PGMate
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection(featuresRef)} 
                className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection(testimonialsRef)} 
                className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection(pricingRef)} 
                className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection(faqRef)} 
                className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                FAQ
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors text-sm"
              >
                Log in
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-full hover:from-blue-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl text-sm"
              >
                Get Started Free
              </Link>
          </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4 pt-4">
                <button 
                  onClick={() => scrollToSection(featuresRef)} 
                  className="text-left text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection(testimonialsRef)} 
                  className="text-left text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  Testimonials
                </button>
                <button 
                  onClick={() => scrollToSection(pricingRef)} 
                  className="text-left text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection(faqRef)} 
                  className="text-left text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  FAQ
                </button>
                <div className="pt-4 border-t border-gray-200">
                  <Link 
                    to="/login" 
                    className="block text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium mb-2"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/register" 
                    className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-full hover:from-blue-700 hover:to-green-700 transition-all text-center text-sm"
                  >
                    Get Started Free
            </Link>
          </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Modern Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 relative">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                Trusted by 1000+ PG Owners
            </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Simplify Your 
                <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  PG Management
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Streamline operations, increase efficiency, and boost tenant satisfaction with our all-in-one PG management solution. Manage multiple properties from anywhere.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <Link 
                  to="/register" 
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl text-center group transform hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
                <button 
                  onClick={() => scrollToSection(featuresRef)}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-blue-600 hover:text-blue-600 transition-all text-center group"
                >
                  <span className="flex items-center justify-center">
                    See How It Works
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
            </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span>No credit card required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span>14-day free trial</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              {/* Background decorations */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-200 rounded-full opacity-30 blur-3xl"></div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-green-200 rounded-full opacity-30 blur-3xl"></div>
              
              {/* Main hero image */}
              <div className="relative z-10">
                <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80" 
              alt="Modern PG building" 
                    className="rounded-3xl shadow-2xl border border-gray-200"
              loading="eager"
            />
                  
                  {/* Floating stats card */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">95%</p>
                        <p className="text-sm text-gray-600">Tenant Satisfaction</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating notification */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-3 border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">Live Dashboard</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Design */}
      <section ref={featuresRef} className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to 
              <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Manage Your PG Business
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From tenant management to financial tracking, we've got all the tools you need to streamline your operations and grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Property Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage all your properties from a single dashboard. Track occupancy, maintenance schedules, and property performance in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tenant Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete tenant lifecycle management from onboarding to move-out. Store documents, track communication, and manage lease agreements.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Financial Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Automated rent collection, expense tracking, and financial reporting. Get insights into your cash flow and profitability instantly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Maintenance Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Streamlined maintenance request system with automated notifications, vendor management, and cost tracking for all repairs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics & Reporting</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive analytics dashboard with customizable reports. Track occupancy rates, revenue trends, and property performance metrics.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Automation</h3>
              <p className="text-gray-600 leading-relaxed">
                Automate routine tasks like rent reminders, maintenance scheduling, and report generation. Focus on growing your business.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Testimonials Section - Modern Design */}
      <section ref={testimonialsRef} className="py-20 md:py-28 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4 mr-2" />
              Customer Success Stories
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by 
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {" "}1000+ PG Owners
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how PGMate is transforming property management for landlords across India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                {/* Testimonial Text */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                {/* Author Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg mr-4">
                      {testimonial.image}
                    </div>
                    <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Modern Design */}
      <section ref={pricingRef} className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Wallet className="h-4 w-4 mr-2" />
              Simple Pricing
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose the Perfect 
              <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Plan for Your PG Business
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Scale from 50 beds to unlimited. Start with what you need, grow as you expand.
            </p>
            
            {/* Pricing Toggle */}
            <div className="flex items-center justify-center space-x-4">
              <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
                <span className="ml-1 text-xs text-green-600 font-medium">Save 16%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={plan.name}
                className={`relative flex flex-col h-full p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 shadow-xl' 
                    : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-xs font-bold px-4 py-2 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                {/* Header Section */}
              <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-3 text-sm">{plan.description}</p>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-600 ml-1 text-sm">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>
                  <div className="text-sm text-blue-600 font-medium mb-2">{plan.bedLimit}</div>
                  {isYearly && (
                    <p className="text-xs text-green-600 font-medium">Save ₹{plan.monthlyPrice * 12 - plan.yearlyPrice} yearly</p>
                  )}
              </div>

                {/* Features Section - Fixed Height */}
                <div className="flex-1 mb-6">
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                </li>
                    ))}
                    {plan.notIncluded.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <X className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400 text-sm leading-relaxed">{feature}</span>
                </li>
                    ))}
              </ul>
              </div>

                {/* CTA Button Section - Always at Bottom */}
                <div className="mt-auto pt-4">
                  <Link 
                    to="/register" 
                    className={`block w-full text-center py-3 px-4 font-semibold rounded-lg transition-all text-sm ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl'
                        : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Modern Design */}
      <section ref={faqRef} className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <ChevronDown className="h-4 w-4 mr-2" />
              Got Questions?
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked 
              <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about PGMate. Can't find the answer you're looking for? Contact our support team.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-6">
                <button
                  className="flex justify-between items-start w-full p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openFAQ === index}
                  aria-controls={`faq-${index}`}
                >
                  <span className="font-semibold text-left text-gray-900 text-lg pr-4">{faq.question}</span>
                  <span className="ml-4 flex-shrink-0">
                    {openFAQ === index ? (
                      <ChevronUp className="h-6 w-6 text-blue-600 transition-transform" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-blue-600 transition-transform" />
                    )}
                  </span>
                </button>
                <div 
                  id={`faq-${index}`}
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openFAQ === index ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-700 leading-relaxed text-lg">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section - Modern Design */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
              Ready to Transform Your 
              <span className="block">PG Management?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of property managers who have simplified their operations and increased their profits with PGMate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register" 
                className="px-10 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
              >
                <span className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
          </Link>
              <button 
                onClick={() => scrollToSection(featuresRef)}
                className="px-10 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-600 transition-all inline-flex items-center"
              >
                <span className="flex items-center">
                  See Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-8 text-blue-100 text-sm">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Modern Design */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="relative">
                  <Building2 className="h-8 w-8 text-blue-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  PGMate
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Simplifying property management for landlords and property managers across India. 
                Streamline operations, increase efficiency, and grow your business.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Product</h3>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection(featuresRef)} className="text-gray-400 hover:text-blue-400 transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection(pricingRef)} className="text-gray-400 hover:text-blue-400 transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollToSection(faqRef)} className="text-gray-400 hover:text-blue-400 transition-colors">FAQ</button></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Mobile App</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Stay Updated</h3>
              <p className="text-gray-400 mb-4">Get the latest updates and tips for property management</p>
              <form className="flex mb-4">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-3 w-full rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  aria-label="Email address"
                />
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-4 py-3 rounded-r-lg transition-all"
                  aria-label="Subscribe"
                >
                  <Mail className="h-5 w-5" />
                </button>
              </form>
              <p className="text-xs text-gray-500">We respect your privacy. Unsubscribe at any time.</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} PGMate. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;