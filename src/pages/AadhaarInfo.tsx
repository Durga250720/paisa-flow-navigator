
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

  return (
    <div className="main-layout">
      <Navbar />
      <div className="card-container mt-20">
        <div className="text-center mb-8">
          <div className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm mb-4">
            Low CIBIL? No problem
          </div>
          <h1 className="text-2xl font-bold mb-2">Aadhaar info</h1>
        </div>

        <div className="space-y-6">
          <div className="form-group">
            <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-2">
              Aadhaar Number *
            </label>
            <input
              id="aadhaar"
              type="text"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Please Enter Your Full Name"
              className="input-field"
              maxLength={12}
              disabled={showOTP}
            />
            {errors.aadhaar && <p className="error-message">{errors.aadhaar}</p>}
            
            {!showOTP && (
              <div className="flex justify-end mt-2">
                <button 
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="text-primary text-sm"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            )}
          </div>

          {showOTP && (
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Enter OTP
              </label>
              <OTPInput 
                length={6} 
                onComplete={handleOTPComplete}
                error={errors.otp}
              />
              <div className="text-center mt-4">
                <span className="text-sm text-gray-600">0:0{resendTimer > 9 ? resendTimer : `0${resendTimer}`}</span>
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
        </div>

        {showOTP && (
          <button
            disabled={loading}
            className="primary-button w-full mt-6"
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        )}

        <p className="text-center text-xs text-gray-500 mt-4">
          By clicking Continue, you allow us to securely check your credit profile to assess your loan eligibility
        </p>
      </div>
    </div>
  );
};

export default AadhaarInfo;
