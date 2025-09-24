'use client';

import React, { useState } from 'react';
import { CreditCard, Coins, X, Gift, Users, Crown, Check } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TokenPlan {
  id: string;
  name: string;
  price: number;
  tokens: number;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
  color: string;
}

const tokenPlans: TokenPlan[] = [
  {
    id: 'intern',
    name: 'Intern Plan',
    price: 2.9,
    tokens: 100,
    description: 'Perfect for getting started',
    icon: <Users className="h-6 w-6" />,
    color: 'blue',
  },
  {
    id: 'jobseeker',
    name: 'Jobseeker Plan',
    price: 9.9,
    tokens: 300,
    description: 'Most popular choice',
    icon: <Coins className="h-6 w-6" />,
    popular: true,
    color: 'purple',
  },
  {
    id: 'winners',
    name: 'Winners Plan',
    price: 19.9,
    tokens: 1000,
    description: 'Best value for power users',
    icon: <Crown className="h-6 w-6" />,
    color: 'gold',
  },
];

const TokenPurchaseModal: React.FC<TokenPurchaseModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('jobseeker');
  const [paymentMethod, setPaymentMethod] = useState<'debit' | 'stablecoin'>('debit');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlanDetails = tokenPlans.find(plan => plan.id === selectedPlan);

  const handlePurchase = async () => {
    if (!selectedPlanDetails) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success message
      toast.success(`Successfully purchased ${selectedPlanDetails.tokens} ADA Tokens!`);

      // Close modal
      onClose();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanCardClasses = (plan: TokenPlan) => {
    const baseClasses = "relative cursor-pointer transition-all duration-200 hover:shadow-lg";
    if (plan.id === selectedPlan) {
      return `${baseClasses} ring-2 ring-purple-500 shadow-lg`;
    }
    return `${baseClasses} hover:ring-1 hover:ring-purple-300`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-purple-600" />
            Buy ADA Tokens
          </DialogTitle>
          <DialogDescription>
            Choose your token package and payment method. All transactions are secure and processed instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Free Tier Banner */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="h-5 w-5" />
                  <span className="font-semibold">Free Tier</span>
                </div>
                <div className="text-3xl font-bold mb-1">20</div>
                <div className="text-sm opacity-90">Premium Tokens for 3 days*</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">Welcoming Token</div>
                <div className="text-sm opacity-90">Already claimed ✓</div>
              </div>
            </div>
          </div>

          {/* Premium Package Header */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">Premium Package</h3>
            <p className="text-gray-600">Pay as You Use (PAYU) Freemium System</p>
          </div>

          {/* Token Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tokenPlans.map((plan) => (
              <Card
                key={plan.id}
                className={getPlanCardClasses(plan)}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={`bg-gradient-to-br ${
                    plan.color === 'blue' ? 'from-blue-500 to-purple-500' :
                    plan.color === 'purple' ? 'from-purple-500 to-pink-500' :
                    'from-yellow-400 to-orange-500'
                  } text-white py-3 rounded-lg mb-3`}>
                    <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      {plan.icon}
                      <span className="text-3xl font-bold text-purple-600">
                        ${plan.price}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      /{plan.tokens} ADA Token*
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

                  {plan.id === selectedPlan && (
                    <div className="flex items-center justify-center gap-2 text-purple-600">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Payment Method</h4>

            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: 'debit' | 'stablecoin') => setPaymentMethod(value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Label
                htmlFor="debit"
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === 'debit'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <RadioGroupItem value="debit" id="debit" />
                <CreditCard className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium">Debit/Credit Card</div>
                  <div className="text-sm text-gray-500">Visa, Mastercard, etc.</div>
                </div>
              </Label>

              <Label
                htmlFor="stablecoin"
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === 'stablecoin'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <RadioGroupItem value="stablecoin" id="stablecoin" />
                <Coins className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium">Stablecoin</div>
                  <div className="text-sm text-gray-500">USDC, USDT, DAI</div>
                </div>
              </Label>
            </RadioGroup>
          </div>

          {/* Purchase Summary */}
          {selectedPlanDetails && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Purchase Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{selectedPlanDetails.name}</span>
                  <span>{selectedPlanDetails.tokens} ADA Tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="capitalize">{paymentMethod === 'debit' ? 'Credit/Debit Card' : 'Stablecoin'}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${selectedPlanDetails.price}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing || !selectedPlanDetails}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                `Purchase ${selectedPlanDetails?.tokens} Tokens`
              )}
            </Button>
          </div>

          {/* Terms */}
          <div className="text-xs text-gray-500 text-center">
            *Terms and conditions apply. Tokens are non-refundable.
            Free tier tokens expire after 3 days.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenPurchaseModal;