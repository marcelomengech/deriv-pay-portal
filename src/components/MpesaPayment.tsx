import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CreditCard } from 'lucide-react';

interface MpesaPaymentProps {
  clientId?: string;
  onPaymentSuccess?: (transactionId: string) => void;
}

const MpesaPayment: React.FC<MpesaPaymentProps> = ({ clientId, onPaymentSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [formData, setFormData] = useState({
    phone: '',
    amount: '',
    accountReference: '',
    transactionDesc: 'Payment'
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.slice(1);
    }
    
    // If starts with +254, remove the +
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    
    // If it's just the local number (9 digits), add 254
    if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(formData.phone);
      
      if (!formattedPhone || formattedPhone.length !== 12) {
        throw new Error('Please enter a valid phone number (e.g., 0712345678)');
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone: formattedPhone,
          amount: formData.amount,
          accountReference: formData.accountReference || 'Payment',
          transactionDesc: formData.transactionDesc || 'Payment',
          environment: environment
        }
      });

      if (error) {
        throw error;
      }

      if (data.ResponseCode === '0') {
        toast({
          title: 'Payment Initiated',
          description: 'Please check your phone for the M-Pesa prompt and enter your PIN.',
        });

        // Clear form
        setFormData({
          phone: '',
          amount: '',
          accountReference: '',
          transactionDesc: 'Payment'
        });

        // Call success callback if provided
        if (onPaymentSuccess && data.CheckoutRequestID) {
          onPaymentSuccess(data.CheckoutRequestID);
        }
      } else {
        throw new Error(data.ResponseDescription || 'Failed to initiate payment');
      }

    } catch (error: any) {
      console.error('M-Pesa payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          M-Pesa Payment
        </CardTitle>
        <CardDescription>
          Pay securely using M-Pesa mobile money
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Select value={environment} onValueChange={(value: 'sandbox' | 'production') => setEnvironment(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                <SelectItem value="production">Production (Live)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0712345678"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <p className="text-sm text-muted-foreground">
              Enter your Safaricom number (e.g., 0712345678)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="100"
              min="1"
              step="1"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountReference">Account Reference</Label>
            <Input
              id="accountReference"
              name="accountReference"
              placeholder="Payment reference"
              value={formData.accountReference}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionDesc">Transaction Description</Label>
            <Input
              id="transactionDesc"
              name="transactionDesc"
              placeholder="Payment description"
              value={formData.transactionDesc}
              onChange={handleInputChange}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !formData.phone || !formData.amount}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay with M-Pesa'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MpesaPayment;