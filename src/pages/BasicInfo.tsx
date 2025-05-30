
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';

const BasicInfo = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    panNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const otpVerified = localStorage.getItem('otpVerified');
    
    if (!authToken || !otpVerified) {
      navigate('/');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.panNumber.trim()) {
      newErrors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Please enter a valid PAN number';
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
      
      console.log('API call to:', config.baseURL + '/basic-info', formData);
      localStorage.setItem('basicInfoCompleted', 'true');
      navigate('/aadhaar-info');
    } catch (err) {
      setErrors({ submit: 'Failed to save information. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Navbar />
      
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center p-8">
        <div className="relative">
          <div className="absolute top-8 left-8">
            <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm">
              Low CIBIL?
            </div>
            <div className="bg-purple-100 text-green-600 px-3 py-1 rounded-full text-sm mt-1">
              No problem
            </div>
          </div>
          <img 
            src="/lovable-uploads/8f598013-7362-496b-96a6-8a285565f544.png" 
            alt="Happy customer with phone" 
            className="max-w-full h-auto"
          />
        </div>
      </div>

      {/* Right side - Basic Info Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm mb-4">
              Low CIBIL? No problem
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-8 text-center">Basic Info</h1>

          <div className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Please Enter Your Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email ID *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Please Enter Email ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number *
              </label>
              <input
                id="panNumber"
                type="text"
                value={formData.panNumber}
                onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                placeholder="Please Enter PAN Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={10}
              />
              {errors.panNumber && <p className="text-red-500 text-sm mt-1">{errors.panNumber}</p>}
              <div className="flex justify-end mt-1">
                <button className="text-primary text-sm">Why we need this?</button>
              </div>
            </div>

            {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}

            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full bg-primary text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>

            <p className="text-center text-xs text-gray-500">
              By clicking Continue, you allow us to securely check your credit profile to assess your loan eligibility
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
