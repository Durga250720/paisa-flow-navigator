import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OTPInput from '../components/OTPInput';
import { config } from '../config/environment';
import styles from '../pages-styles/KYCDetails.module.css';


const KYCDetails = () => {
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    panNumber: ''
  });
  const [showOTP, setShowOTP] = useState(false);
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false); // New state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    // const basicInfoCompleted = localStorage.getItem('basicInfoCompleted'); // Not used, can be removed if not needed elsewhere

    if (!authToken) {
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

  const validatePAN = (pan: string) => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
  };

  const handleSendOTP = async () => {
    setErrors({});

    if (!formData.aadhaarNumber) {
      setErrors({ aadhaar: 'Aadhaar number is required' });
      return;
    }

    if (!validateAadhaar(formData.aadhaarNumber)) {
      setErrors({ aadhaar: 'Please enter a valid 12-digit Aadhaar number' });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('API call to:', config.baseURL + '/send-aadhaar-otp', { aadhaarNumber: formData.aadhaarNumber });
      setShowOTP(true);
      setResendTimer(30); // Start resend timer
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('API call to:', config.baseURL + '/verify-aadhaar-otp', {
        aadhaarNumber: formData.aadhaarNumber,
        otp
      });
      localStorage.setItem('aadhaarVerified', 'true');
      setIsAadhaarVerified(true); // Aadhaar is verified
      // setShowOTP(false); // OTP section will hide due to conditional rendering
    } catch (err) {
      setErrors({ otp: 'Invalid OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setErrors({});

    if (!formData.panNumber) {
      setErrors({ pan: 'PAN number is required' });
      return;
    }

    if (!validatePAN(formData.panNumber)) {
      setErrors({ pan: 'Please enter a valid PAN number' });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('API call to:', config.baseURL + '/kyc-details', formData);
      localStorage.setItem('kycVerification', 'true');
      navigate('/kyc-verification');
    } catch (err) {
      setErrors({ submit: 'Failed to save KYC details. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setErrors(prev => ({ ...prev, otp: '' })); // Clear previous OTP error

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('API call to:', config.baseURL + '/resend-aadhaar-otp', { aadhaarNumber: formData.aadhaarNumber });
      setResendTimer(30);
    } catch (err) {
      setErrors({ otp: 'Failed to resend OTP. Please try again.' });
    }
  };

  const formatAadhaar = (value: string) => {
    // Remove non-digits and then format
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3').trim();
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    if (field === 'aadhaarNumber') {
      processedValue = value.replace(/\D/g, ''); // Allow only digits for Aadhaar
    } else if (field === 'panNumber') {
      processedValue = value.toUpperCase(); // Convert PAN to uppercase
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={`${styles.container} block`}>
      <div className={styles.navbarWrapper}>
        <Navbar />
      </div>

      <div className={`${styles.mainContainer}`}>
        <div className={styles.leftPanel}>
          <div className={styles.imageContainer}>
            <img
              src="/lovable-uploads/8f598013-7362-496b-96a6-8a285565f544.png"
              alt="Happy customer with phone"
              className={styles.heroImage}
            />
          </div>
        </div>

        {/* Right side - KYC Details Form */}
        <div className={styles.rightPanel}>
          <div className={styles.kycFormContainer}>
            <h1 className={styles.kycHeading}>KYC Details</h1>

            <div className="space-y-6">
              <div>
                <label htmlFor="aadhaar" className={`${styles.label}`}>
                  Aadhaar Number <sup>*</sup>
                </label>
                <input
                  id="aadhaar"
                  type="text" // Keep as text to allow custom formatting and digit filtering
                  value={showOTP || isAadhaarVerified ? formatAadhaar(formData.aadhaarNumber) : formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                  placeholder="Enter Your Aadhaar Number"
                  className='inputField'
                  maxLength={14} // 12 digits + 2 spaces
                  disabled={showOTP || isAadhaarVerified} // Disable if OTP shown or Aadhaar verified
                />
                {errors.aadhaar && <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>}

                {!showOTP && !isAadhaarVerified && (
                  <button
                    onClick={handleSendOTP}
                    disabled={loading || !formData.aadhaarNumber || !validateAadhaar(formData.aadhaarNumber.replace(/\s/g, ''))}
                    className={`${styles.sendBtn} mt-4`}
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                )}
              </div>

              {showOTP && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Enter OTP sent to your Aadhaar registered mobile number
                  </label>
                  <OTPInput
                    length={6}
                    onComplete={handleOTPComplete}
                    error={errors.otp}
                    // disabled={isAadhaarVerified} // Disable OTP input after verification
                  />
                  {!isAadhaarVerified && ( // Show resend option only if Aadhaar is not yet verified
                    <div className="text-center mt-4 flex justify-between items-center">
                      <div className={`text-sm ${errors.otp ? 'text-red-500' : 'text-gray-500'}`}>
                        {resendTimer > 0 ? `Resend OTP in 0:${resendTimer < 10 ? `0${resendTimer}` : resendTimer}` : 'Didn\'t receive OTP?'}
                      </div>
                      <button
                        onClick={handleResend}
                        disabled={resendTimer > 0 || loading}
                        className={`ml-4 text-sm font-medium ${resendTimer > 0 || loading ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:text-primary-dark'}`}
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
                </div>
              )}
              {isAadhaarVerified && (
                <>
                  <div>
                    <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number <sup>*</sup>
                    </label>
                    <input
                      id="panNumber"
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange('panNumber', e.target.value)}
                      placeholder="Please Enter PAN Number"
                      className="inputField"
                      maxLength={10}
                    />
                    {errors.pan && <p className="text-red-500 text-sm mt-1">{errors.pan}</p>}
                    <div className="flex justify-end mt-1">
                      <button className="text-primary text-sm">Why we need this?</button>
                    </div>
                  </div>

                  {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}

                  <button
                    onClick={handleContinue}
                    // disabled={loading || !validatePAN(formData.panNumber)}
                    className={styles.primaryButton}
                  >
                    {loading ? 'Verifying...' : 'Continue'}
                  </button>
                  <p className="text-center text-xs text-gray-500">
                    By clicking Continue, you allow us to securely check your credit profile to assess your loan eligibility
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCDetails;
