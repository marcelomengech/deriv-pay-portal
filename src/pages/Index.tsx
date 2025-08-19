
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, CreditCard, Users, Wallet, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DemoCredentials from "@/components/DemoCredentials";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const openLogin = () => {
    navigate('/auth');
  };

  const openSignup = () => {
    navigate('/auth');
  };

  const demoFeatures = [
    {
      icon: CreditCard,
      title: "🔗 Deriv OAuth Login",
      description: "Live integration with Deriv API - users login with their actual Deriv accounts and data syncs automatically"
    },
    {
      icon: Users,
      title: "📱 M-Pesa STK Push", 
      description: "Real M-Pesa integration - test with 254708374149 to see live STK push notifications on mobile"
    },
    {
      icon: Shield,
      title: "🔐 Supabase Backend",
      description: "Professional database with Row Level Security, real-time transactions, and secure API endpoints"
    },
    {
      icon: Wallet,
      title: "📊 Live Dashboard",
      description: "Real-time transaction tracking, client management, and comprehensive reporting system"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">Deriv Payment Agent</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={openLogin}>
                Login
              </Button>
              <Button onClick={openSignup} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              DERIV PAYMENT AGENT
            </h1>
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">
              🔗 Integrated with Deriv API & M-Pesa
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional payment agency platform connecting Deriv traders with secure M-Pesa transactions. 
              <strong className="text-gray-800"> Live Demo Ready!</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={openSignup}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
              >
                Start Processing <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={openLogin}
                className="text-lg px-8 py-4"
              >
                Access Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🚀 Live Integration Demo
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fully functional Deriv OAuth & M-Pesa STK Push integration ready for testing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {demoFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300 border-2 border-green-200">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
          
          {/* Demo Instructions */}
          <div className="mt-16 bg-blue-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              📋 Demo Instructions for Employer
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-bold text-lg mb-3 text-blue-600">1. Test Deriv Login</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Click "Login with Deriv" button</li>
                  <li>• Uses real Deriv OAuth API</li>
                  <li>• Automatically creates user profile</li>
                  <li>• Syncs Deriv account data</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-bold text-lg mb-3 text-green-600">2. Test M-Pesa Payment</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Add a test client in dashboard</li>
                  <li>• Process transaction with 254708374149</li>
                  <li>• See live STK push on phone</li>
                  <li>• View transaction in database</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <DemoCredentials />
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-12 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Disclaimer</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                Deriv offers complex derivatives, such as options and contracts for difference ("CFDs"). 
                These products may not be suitable for all clients, and trading them puts you at risk. 
                Please make sure that you understand the following risks before trading Deriv products:
              </p>
              <div className="pl-4">
                <p className="mb-2">
                  <strong>a)</strong> You may lose some or all of the money you invest in the trade.
                </p>
                <p className="mb-2">
                  <strong>b)</strong> If your trade involves currency conversion, exchange rates will affect your profit and loss.
                </p>
              </div>
              <p className="font-medium">
                You should never trade with borrowed money or with money that you cannot afford to lose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">Deriv Payment Agent</span>
          </div>
          <p className="text-center text-gray-400 mt-4">
            Secure payment processing solutions powered by Deriv API
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Index;
