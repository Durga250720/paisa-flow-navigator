
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user already has authToken
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      navigate('/otp');
    }
  }, [navigate]);

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleGetOTP = async () => {
    setError('');
    
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate and store authToken
      const authToken = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('phoneNumber', phoneNumber);
      
      console.log('API call to:', config.baseURL + '/send-otp');
      navigate('/otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
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

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm mb-4">
              Low CIBIL? No problem
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-8 text-center">Login</h1>

          <div className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Please Enter Your Phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={10}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <button
              onClick={handleGetOTP}
              disabled={loading}
              className="w-full bg-primary text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Get OTP'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Paisa108 Get instant personal loan up to ₹ 25000
            </p>

            <div className="flex items-center justify-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Secure, simple, 100% paperless
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
