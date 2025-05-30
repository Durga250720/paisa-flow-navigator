
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OTPInput from '../components/OTPInput';
import { config } from '../config/environment';

const OTP = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has authToken
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
      return;
    }

    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleOTPComplete = async (otp: string) => {
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('API call to:', config.baseURL + '/verify-otp', { otp });
      
      // Store verification status
      localStorage.setItem('otpVerified', 'true');
      navigate('/basic-info');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      console.log('API call to:', config.baseURL + '/resend-otp', { phoneNumber });
      setResendTimer(30);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
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
          <h1 className="text-2xl font-bold mb-2">OTP</h1>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
            Enter OTP
          </label>
          <OTPInput 
            length={6} 
            onComplete={handleOTPComplete}
            error={error}
          />
        </div>

        <div className="text-center mt-6">
          <span className="text-sm text-gray-600">0:0{resendTimer > 9 ? resendTimer : `0${resendTimer}`}</span>
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className={`ml-4 text-sm ${resendTimer > 0 ? 'text-gray-400' : 'text-primary'}`}
          >
            Resend
          </button>
        </div>

        <button
          disabled={loading}
          className="primary-button w-full mt-6"
        >
          {loading ? 'Verifying...' : 'Login'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          By Clicking login you will be accepting Terms and Conditions and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default OTP;
