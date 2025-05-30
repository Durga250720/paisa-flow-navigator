
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OTPInput from '../components/OTPInput';
import { config } from '../config/environment';

const AadhaarInfo = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const basicInfoCompleted = localStorage.getItem('basicInfoCompleted');
    
    if (!authToken || !basicInfoCompleted) {
      navigate('/');
    }

    // Timer for resend
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [navigate, resendTimer]);

  const validateAadhaar = (aadhaar: string) => {
    return /^\d{12}$/.test(aadhaar);
  };

  const handleSendOTP = async () => {
    setErrors({});
    
    if (!aadhaarNumber) {
      setErrors({ aadhaar: 'Aadhaar number is required' });
      return;
    }
    
    if (!validateAadhaar(aadhaarNumber)) {
      setErrors({ aadhaar: 'Please enter a valid 12-digit Aadhaar number' });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('API call to:', config.baseURL + '/send-aadhaar-otp', { aadhaarNumber });
      setShowOTP(true);
      setResendTimer(30);
    } catch (err) {
      setErrors({ aadhaar: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    setErrors({});
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('API call to:', config.baseURL + '/verify-aadhaar-otp', { aadhaarNumber, otp });
      localStorage.setItem('aadhaarVerified', 'true');
      navigate('/verification-processing');
    } catch (err) {
      setErrors({ otp: 'Invalid OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    try {
      console.log('API call to:', config.baseURL + '/resend-aadhaar-otp', { aadhaarNumber });
      setResendTimer(30);
    } catch (err) {
      setErrors({ otp: 'Failed to resend OTP. Please try again.' });
    }
  };

  const formatAadhaar = (value: string) => {
    return value.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Navbar />
      
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center p-8">
        <div className="relative">
          <img 
            src="/lovable-uploads/8f598013-7362-496b-96a6-8a285565f544.png" 
            alt="Happy customer with phone" 
            className="max-w-full h-auto"
          />
        </div>
      </div>

      {/* Right side - Aadhaar Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md h-[85vh] border border-gray-200 shadow-lg rounded-lg p-8 flex flex-col justify-center">
          <h1 className="text-2xl font-bold mb-8 text-center">Aadhaar info</h1>

          <div className="space-y-6">
            <div>
              <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Number *
              </label>
              <input
                id="aadhaar"
                type="text"
                value={showOTP ? formatAadhaar(aadhaarNumber) : aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter Your Aadhaar Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={12}
                disabled={showOTP}
              />
              {errors.aadhaar && <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>}
              
              {!showOTP && (
                <button 
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full mt-4 bg-primary text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              )}
            </div>

            {showOTP && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Enter OTP
                </label>
                <OTPInput 
                  length={6} 
                  onComplete={handleOTPComplete}
                  error={errors.otp}
                />
                <div className="text-center mt-4">
                  <span className="text-sm text-red-500">0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</span>
                  <button
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className={`ml-4 text-sm ${resendTimer > 0 ? 'text-gray-400' : 'text-primary'}`}
                  >
                    Resend
                  </button>
                </div>
              </div>
            )}

            {showOTP && (
              <button
                disabled={loading}
                className="w-full bg-primary text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            )}

            <p className="text-center text-xs text-gray-500">
              By clicking Continue, you allow us to securely check your credit profile to assess your loan eligibility
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AadhaarInfo;
