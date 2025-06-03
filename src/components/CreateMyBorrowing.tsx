
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Check } from 'lucide-react';
import styles from './styles/CreateMyBorrowing.module.css';

const CreateMyBorrowing = () => {
  const [loanAmount, setLoanAmount] = useState(6000);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin/my-borrowings');
  };

  const handleContinue = () => {
    // Navigate to next step or process the loan
    console.log('Loan amount:', loanAmount);
    // You can add your loan processing logic here
  };

  const flatFee = 50;
  const interest = 500;
  const loanProtectionFee = 10;
  const totalAmount = loanAmount + flatFee + interest + loanProtectionFee;

  return (
    <div className={`${styles.mainContainer} p-4 bg-white border-t`}>
      <div className={`${styles.innerContainer} h-full rounded-lg shadow-sm`}>
        {/* Header */}
        <div className="flex items-center p-4 cursor-pointer w-max" onClick={handleBack}>
          <button className="mr-4">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-gray-600 font-medium">Back</span>
        </div>
        <div className={`${styles.borrowingSection} max-w-md mx-auto`}>
          {/* Content */}
          <div className="p-6 text-center">
            {/* Loan Amount */}
            <div className="mb-8">
              <div className="text-3xl font-medium text-primary mb-6">₹{loanAmount.toLocaleString()}</div>

              {/* Slider */}
              <div className="relative mb-6">
                <input
                  type="range"
                  min="1000"
                  max="25000"
                  step="500"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #5D15C1 0%, #5D15C1 ${((loanAmount - 1000) / (25000 - 1000)) * 100}%, #e5e7eb ${((loanAmount - 1000) / (25000 - 1000)) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-4 mb-8 text-left">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <span className="text-gray-600 text-sm">Flat fee (inc. GST)</span>
                  <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center ml-2 text-xs text-gray-400">
                    i
                  </div>
                </div>
                <span className="font-medium text-sm">₹ {flatFee}</span>
              </div>

              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Interest</span>
                <span className="font-medium">₹ {interest}</span>
              </div>

              <div className="flex justify-between text-sm mt-2">
                <div className="flex items-center">
                  <span className="text-gray-600">Loan Protection Fee</span>
                  <span className="text-primary text-xs ml-2 cursor-pointer">Remove</span>
                </div>
                <span className="font-medium">₹ {loanProtectionFee}</span>
              </div>

              <div className="flex justify-between text-sm font-medium pt-2 mt-4">
                <span className="text-gray-700">Pay total by 5th Jul</span>
                <span className="text-gray-900">₹ {totalAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transfer to</span>
                <span className="font-medium">**** 1234 (ICICI)</span>
              </div>
            </div>

            {/* KFS & Loan Documents */}
            <div className="mb-8 border-t">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg cursor-pointer mt-4">
                <span className="text-gray-700 font-medium text-base">KFS & Loan Documents</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-primary text-white font-medium py-3 px-6 rounded-lg mb-4 text-sm"
            >
              Continue
            </button>

            {/* Security Badge */}
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              100% Safe & Secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMyBorrowing;
