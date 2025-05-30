
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';

const BankInfo = () => {
  const [formData, setFormData] = useState({
    bankAccountNumber: '',
    confirmBankAccountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const kycVerified = localStorage.getItem('kycVerified');
    
    if (!authToken || !kycVerified) {
      navigate('/');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankAccountNumber.trim()) {
      newErrors.bankAccountNumber = 'Bank account number is required';
    } else if (formData.bankAccountNumber.length < 9 || formData.bankAccountNumber.length > 18) {
      newErrors.bankAccountNumber = 'Bank account number should be 9-18 digits';
    }

    if (!formData.confirmBankAccountNumber.trim()) {
      newErrors.confirmBankAccountNumber = 'Please re-enter bank account number';
    } else if (formData.bankAccountNumber !== formData.confirmBankAccountNumber) {
      newErrors.confirmBankAccountNumber = 'Account numbers do not match';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Please enter a valid IFSC code';
    }

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('API call to:', config.baseURL + '/bank-info', formData);
      localStorage.setItem('bankInfoCompleted', 'true');
      // Navigate to success or next step
    } catch (err) {
      setErrors({ submit: 'Failed to save bank information. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-layout">
      <Navbar />
      <div className="card-container mt-20 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Bank Info</h1>
          <p className="text-gray-600">To deposit your approved amount and enable auto-repayment</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="form-group">
              <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Bank Account Number *
              </label>
              <input
                id="bankAccountNumber"
                type="text"
                value={formData.bankAccountNumber}
                onChange={(e) => handleInputChange('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="Please Enter Bank Account Number"
                className="input-field"
              />
              {errors.bankAccountNumber && <p className="error-message">{errors.bankAccountNumber}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmBankAccountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Re-Enter Bank Account Number *
              </label>
              <input
                id="confirmBankAccountNumber"
                type="text"
                value={formData.confirmBankAccountNumber}
                onChange={(e) => handleInputChange('confirmBankAccountNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="Please Re-Enter Bank Account Number"
                className="input-field"
              />
              {errors.confirmBankAccountNumber && <p className="error-message">{errors.confirmBankAccountNumber}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code *
              </label>
              <input
                id="ifscCode"
                type="text"
                value={formData.ifscCode}
                onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                placeholder="Please Enter IFSC Code"
                className="input-field"
                maxLength={11}
              />
              {errors.ifscCode && <p className="error-message">{errors.ifscCode}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name *
              </label>
              <input
                id="accountHolderName"
                type="text"
                value={formData.accountHolderName}
                onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                placeholder="Please Enter Account Holder Name"
                className="input-field"
              />
              {errors.accountHolderName && <p className="error-message">{errors.accountHolderName}</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payslip
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">Upload or Drag your Pay slip here</p>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Bank Statement
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">Upload or Drag your Bank Statement here</p>
              </div>
            </div>
          </div>
        </div>

        {errors.submit && <p className="error-message text-center mt-4">{errors.submit}</p>}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="primary-button w-full mt-8"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default BankInfo;
