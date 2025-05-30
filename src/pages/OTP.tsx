
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OTPInput from '../components/OTPInput';
import { config } from '../config/environment';

const OTP = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has authToken
    const authToken = localStorage.getItem('authToken');
    const storedPhone = localStorage.getItem('phoneNumber');
    if (!authToken) {
      navigate('/');
      return;
    }

    if (storedPhone) {
      setPhoneNumber(storedPhone);
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
      console.log('API call to:', config.baseURL + '/resend-otp', { phoneNumber });
      setResendTimer(30);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length >= 10) {
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
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

      {/* Right side - OTP Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm mb-4">
              Low CIBIL? No problem
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-8 text-center">OTP</h1>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Enter the code which we sent to OTP sent to
              </p>
              <p className="text-sm font-medium">
                +91 {formatPhoneNumber(phoneNumber)} ✓
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter OTP
              </label>
              <OTPInput 
                length={6} 
                onComplete={handleOTPComplete}
                error={error}
              />
            </div>

            <div className="text-center">
              <span className="text-sm text-red-500">0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</span>
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
              className="w-full bg-primary text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>

            <p className="text-center text-xs text-gray-500">
              By Clicking login you will be accepting{' '}
              <span className="text-primary">Terms and Conditions</span> and{' '}
              <span className="text-primary">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTP;
