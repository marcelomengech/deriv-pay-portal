import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

const DemoCredentials = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const credentials = {
    mpesa: {
      testPhone: "254708374149",
      amount: "1",
      environment: "sandbox"
    },
    deriv: {
      demoAccount: "Available via OAuth",
      loginUrl: "/auth"
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🧪 Demo Credentials
        </h2>
        <p className="text-gray-600">Use these credentials to test the integrations</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* M-Pesa Demo */}
        <Card className="p-6 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              M-Pesa Testing
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Test Phone:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {credentials.mpesa.testPhone}
                </code>
                <button
                  onClick={() => copyToClipboard(credentials.mpesa.testPhone, 'phone')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {copied === 'phone' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Test Amount:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                KSH {credentials.mpesa.amount}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Environment:</span>
              <Badge variant="outline" className="text-xs">
                {credentials.mpesa.environment}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Deriv Demo */}
        <Card className="p-6 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Deriv OAuth
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Login Method:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                OAuth 2.0
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Type:</span>
              <Badge variant="outline" className="text-xs">
                Real Deriv Account
              </Badge>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              💡 Uses actual Deriv API - login with any valid Deriv account
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Demo Steps */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
        <h3 className="font-bold text-lg mb-4 text-center">⚡ Quick Demo Flow</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600 font-bold">
              1
            </div>
            <p className="font-medium">Click "Login with Deriv"</p>
            <p className="text-gray-600">Test OAuth integration</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600 font-bold">
              2
            </div>
            <p className="font-medium">Add Test Client</p>
            <p className="text-gray-600">Use dashboard tools</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600 font-bold">
              3
            </div>
            <p className="font-medium">Process M-Pesa</p>
            <p className="text-gray-600">Live STK push demo</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DemoCredentials;