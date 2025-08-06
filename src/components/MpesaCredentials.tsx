import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Key } from 'lucide-react';

const MpesaCredentials = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            M-Pesa Integration Setup
          </CardTitle>
          <CardDescription>
            Configure your M-Pesa API credentials for both sandbox testing and production use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sandbox Credentials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sandbox Credentials (For Testing)</h3>
            <p className="text-sm text-muted-foreground">
              Use these for testing your M-Pesa integration before going live.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                asChild
              >
                <a href="https://developer.safaricom.co.ke/" target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">Get Sandbox Credentials</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Create an app on Safaricom Developer Portal to get your sandbox Consumer Key and Consumer Secret
                  </p>
                </a>
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">What you'll need for Sandbox:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Consumer Key (from your sandbox app)</li>
                <li>• Consumer Secret (from your sandbox app)</li>
                <li>• Business Short Code: <code className="bg-muted px-1 rounded">174379</code> (default sandbox)</li>
                <li>• Passkey: <code className="bg-muted px-1 rounded">bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919</code> (default sandbox)</li>
              </ul>
            </div>
          </div>

          {/* Production Credentials */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">Production Credentials (For Live Payments)</h3>
            <p className="text-sm text-muted-foreground">
              For live M-Pesa payments, you'll need to register your business with Safaricom.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                asChild
              >
                <a href="https://developer.safaricom.co.ke/MyApps" target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">Create Production App</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Create a production app to get your live API credentials
                  </p>
                </a>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                asChild
              >
                <a href="https://www.safaricom.co.ke/business/corporate/m-pesa-payments/lipa-na-m-pesa-online" target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">Register for Lipa Na M-Pesa</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Register your business for Lipa Na M-Pesa Online to accept payments
                  </p>
                </a>
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Requirements for Production:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Valid business registration in Kenya</li>
                <li>• M-Pesa merchant account</li>
                <li>• Lipa Na M-Pesa Online registration</li>
                <li>• Your own Business Short Code and Passkey</li>
              </ul>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">Setup Steps</h3>
            <ol className="text-sm space-y-2">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">1</span>
                <span>Register on the Safaricom Developer Portal</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">2</span>
                <span>Create a new app (start with sandbox)</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">3</span>
                <span>Get your Consumer Key and Consumer Secret</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">4</span>
                <span>Enter the credentials below when ready</span>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MpesaCredentials;