
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LoanDetails = () => {
  const [loanAmount, setLoanAmount] = useState(6000);
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/transfer-success');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <div className="text-lg font-medium text-gray-600">Paisa108</div>
        </div>

        <div className="mb-8">
          <div className="text-4xl font-bold text-primary mb-4">₹{loanAmount.toLocaleString()}</div>
          
          <div className="relative mb-6">
            <input
              type="range"
              min="1000"
              max="25000"
              step="500"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div 
              className="absolute top-0 h-2 bg-primary rounded-lg"
              style={{ width: `${((loanAmount - 1000) / (25000 - 1000)) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Flat fee (inc. GST)</span>
            <span className="font-medium">₹ 50</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pay total by 5th Jul</span>
            <span className="font-medium">₹ 6,050</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transfer to</span>
            <span className="font-medium">**** 1234 (ICICI)</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <span className="text-gray-700">KFS & Loan Documents</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-primary text-white font-medium py-3 px-6 rounded-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LoanDetails;
