import { useState } from 'react';
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

const PaymentStep = ({ onNext, onBack }: PaymentStepProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pay_later'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date (MM/YY)
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
    
    if (errors.cardNumber) {
      const newErrors = { ...errors };
      delete newErrors.cardNumber;
      setErrors(newErrors);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiry(e.target.value);
    setExpiry(formattedValue);
    
    if (errors.expiry) {
      const newErrors = { ...errors };
      delete newErrors.expiry;
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (paymentMethod === 'credit_card') {
      if (!cardNumber.trim() || cardNumber.replace(/\s+/g, '').length < 16) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }
      
      if (!cardName.trim()) {
        newErrors.cardName = 'Please enter the name on card';
      }
      
      if (!expiry.trim() || !expiry.includes('/') || expiry.length < 5) {
        newErrors.expiry = 'Please enter a valid expiry date (MM/YY)';
      }
      
      if (!cvc.trim() || cvc.length < 3) {
        newErrors.cvc = 'Please enter a valid CVC';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (paymentMethod === 'pay_later' || validateForm()) {
      setIsProcessing(true);
      
      // In a real app, we would process the payment through Stripe or another payment processor
      // For demo purposes, we'll just simulate a delay
      setTimeout(() => {
        setIsProcessing(false);
        onNext();
      }, 1500);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
      
      <div className="space-y-6">
        {/* Payment method selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-3">
            Select Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                paymentMethod === 'credit_card'
                  ? 'border-primary bg-primary bg-opacity-5'
                  : 'border-gray-200 hover:border-primary hover:bg-gray-50'
              }`}
              onClick={() => setPaymentMethod('credit_card')}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border ${
                    paymentMethod === 'credit_card' ? 'border-primary' : 'border-gray-300'
                  } flex items-center justify-center mr-3`}
                >
                  {paymentMethod === 'credit_card' && (
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  )}
                </div>
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium">Credit Card</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 ml-8">
                Pay now with your credit or debit card
              </p>
            </div>
            
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                paymentMethod === 'pay_later'
                  ? 'border-primary bg-primary bg-opacity-5'
                  : 'border-gray-200 hover:border-primary hover:bg-gray-50'
              }`}
              onClick={() => setPaymentMethod('pay_later')}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border ${
                    paymentMethod === 'pay_later' ? 'border-primary' : 'border-gray-300'
                  } flex items-center justify-center mr-3`}
                >
                  {paymentMethod === 'pay_later' && (
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  )}
                </div>
                <span className="font-medium">Pay at Shop</span>
              </div>
              <p className="mt-2 text-sm text-gray-500 ml-8">
                Pay when you arrive for your appointment
              </p>
            </div>
          </div>
        </div>
        
        {/* Credit card form */}
        {paymentMethod === 'credit_card' && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Card Details</h3>
              <div className="flex items-center text-xs text-gray-500">
                <LockClosedIcon className="h-3 w-3 mr-1" />
                Secure Payment
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  id="card-number"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className={`block w-full rounded-md shadow-sm ${
                    errors.cardNumber
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-primary focus:border-primary'
                  } sm:text-sm`}
                />
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="card-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  id="card-name"
                  value={cardName}
                  onChange={(e) => {
                    setCardName(e.target.value);
                    if (errors.cardName) {
                      const newErrors = { ...errors };
                      delete newErrors.cardName;
                      setErrors(newErrors);
                    }
                  }}
                  placeholder="John Smith"
                  className={`block w-full rounded-md shadow-sm ${
                    errors.cardName
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-primary focus:border-primary'
                  } sm:text-sm`}
                />
                {errors.cardName && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiry"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`block w-full rounded-md shadow-sm ${
                      errors.expiry
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                    } sm:text-sm`}
                  />
                  {errors.expiry && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    id="cvc"
                    value={cvc}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setCvc(value);
                      if (errors.cvc) {
                        const newErrors = { ...errors };
                        delete newErrors.cvc;
                        setErrors(newErrors);
                      }
                    }}
                    placeholder="123"
                    maxLength={4}
                    className={`block w-full rounded-md shadow-sm ${
                      errors.cvc
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary focus:border-primary'
                    } sm:text-sm`}
                  />
                  {errors.cvc && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>This is a demo application. No actual payment will be processed.</p>
              <p>For testing, you can use the card number: 4242 4242 4242 4242</p>
            </div>
          </div>
        )}
        
        {/* Pay later info */}
        {paymentMethod === 'pay_later' && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              You've selected to pay at the shop. No payment is required now.
            </p>
            <p className="text-sm text-gray-700 mt-2">
              We accept cash, credit cards, and debit cards at our location.
            </p>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
