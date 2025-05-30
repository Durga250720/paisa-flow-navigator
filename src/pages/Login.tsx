
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
    <div className="main-layout">
      <Navbar />
      <div className="card-container mt-20">
        <div className="text-center mb-8">
          <div className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm mb-4">
            Low CIBIL? No problem
          </div>
          <h1 className="text-2xl font-bold mb-2">Login</h1>
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Please Enter Your Phone number"
            className="input-field"
            maxLength={10}
          />
          {error && <p className="error-message">{error}</p>}
        </div>

        <button
          onClick={handleGetOTP}
          disabled={loading}
          className="primary-button w-full mt-6"
        >
          {loading ? 'Sending...' : 'Get OTP'}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Paisa108 Get instant personal loan up to ₹ 25000
        </p>

        <div className="flex items-center justify-center mt-6 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Secure, simple, 100% paperless
        </div>
      </div>
    </div>
  );
};

export default Login;
