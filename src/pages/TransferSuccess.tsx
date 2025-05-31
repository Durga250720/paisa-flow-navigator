
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const TransferSuccess = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-lg">🎉 Money In! ₹2,500 Transferred to Your Account (XXX243)</span>
          </div>
          
          <p className="text-gray-600 mb-8">
            We've processed your transaction — your money is ready!
          </p>
        </div>

        <button
          onClick={handleGoToDashboard}
          className="text-primary font-medium mb-16"
        >
          Go to Dashboard
        </button>

        <p className="text-gray-500 text-sm">
          Thanks for being with us!
        </p>
      </div>
    </div>
  );
};

export default TransferSuccess;
