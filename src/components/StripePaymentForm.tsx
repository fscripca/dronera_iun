import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
import CyberButton from './CyberButton';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';
import stripePromise from '../lib/stripeClient';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

const StripePaymentFormContent: React.FC<StripePaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  onError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    // Create a payment intent when the component mounts
    const createPaymentIntent = async () => {
      try {
        // Call your Supabase Edge Function to create a payment intent
        const { data, error: functionError } = await supabase.functions.invoke('create-payment-intent', {
          body: { amount },
        });

        if (functionError) {
          console.error('Error creating payment intent:', functionError);
          setError('Failed to initialize payment. Please try again.');
          return;
        }

        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError('Failed to initialize payment. Please try again.');
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
      }
    };

    createPaymentIntent();
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can add additional billing details here if needed
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        setPaymentSuccess(true);
        
        // Record the payment in your database
        const { error: recordError } = await supabase.functions.invoke('record-stripe-payment', {
          body: {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            userId: (await supabase.auth.getUser()).data.user?.id,
            status: paymentIntent.status
          },
        });

        if (recordError) {
          console.error('Error recording payment:', recordError);
        }

        // Call the success callback
        onSuccess(paymentIntent.id);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      onError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  if (paymentSuccess) {
    return (
      <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
        <h3 className="text-xl font-bold text-green-300 mb-2">Payment Successful!</h3>
        <p className="text-green-200">Your payment has been processed successfully.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#0d0d14] p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Payment Details</h3>
          <div className="flex items-center text-plasma">
            <Lock className="w-4 h-4 mr-1" />
            <span className="text-xs">Secure Payment</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Card Information
            </label>
            <div className="bg-[#161620] p-3 rounded border border-gray-700">
              <CardElement options={cardElementOptions} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your payment information is encrypted and secure.
            </p>
          </div>

          <div className="bg-[#161620] p-3 rounded border border-gray-700 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Amount:</span>
              <span className="font-bold">€{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">DRONE Tokens:</span>
              <span className="font-bold text-plasma">{Math.floor(amount / 1.5).toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          <CyberButton 
            type="submit" 
            className="w-full"
            disabled={!stripe || !elements || isProcessing || !clientSecret}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </CyberButton>
        </form>
      </div>
    </div>
  );
};

// Wrapper component that provides the Stripe context
const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentFormContent {...props} />
    </Elements>
  );
};

export default StripePaymentForm;