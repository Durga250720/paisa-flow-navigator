
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
    <div className="main-layout">
      <Navbar />
      <div className="card-container mt-20">
        <div className="text-center mb-8">
          <div className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm mb-4">
            Low CIBIL? No problem
          </div>
          <h1 className="text-2xl font-bold mb-2">Basic Info</h1>
        </div>

        <div className="space-y-6">
          <div className="form-group">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Please Enter Your Full Name"
              className="input-field"
            />
            {errors.fullName && <p className="error-message">{errors.fullName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email ID *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Please Enter Email ID"
              className="input-field"
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-2">
              PAN Number *
            </label>
            <input
              id="panNumber"
              type="text"
              value={formData.panNumber}
              onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
              placeholder="Please Enter PAN Number"
              className="input-field"
              maxLength={10}
            />
            {errors.panNumber && <p className="error-message">{errors.panNumber}</p>}
            <div className="flex justify-end mt-1">
              <button className="text-primary text-sm">Why we need this?</button>
            </div>
          </div>
        </div>

        {errors.submit && <p className="error-message text-center mt-4">{errors.submit}</p>}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="primary-button w-full mt-6"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          By clicking Continue, you allow us to securely check your credit profile to assess your loan eligibility
        </p>
      </div>
    </div>
  );
};

export default BasicInfo;
