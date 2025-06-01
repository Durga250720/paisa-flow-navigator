import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OTPInput from '../components/OTPInput';
import { config } from '../config/environment';
import styles from '../pages-styles/KYCDetails.module.css';


const KYCDetails = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');

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


    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // console.log('API call to:', config.baseURL + '/send-aadhaar-otp', { aadhaarNumber: formData.aadhaarNumber });
      // setShowOTP(true);
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

      // console.log('API call to:', config.baseURL + '/verify-aadhaar-otp', {
      //   aadhaarNumber: formData.aadhaarNumber,
      //   otp
      // });
      localStorage.setItem('aadhaarVerified', 'true');
      // setIsAadhaarVerified(true); // Aadhaar is verified
      // setShowOTP(false); // OTP section will hide due to conditional rendering
    } catch (err) {
      setErrors({ otp: 'Invalid OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setErrors({});


    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // console.log('API call to:', config.baseURL + '/kyc-details', formData);
      localStorage.setItem('kycVerified', 'true');
      navigate('/kyc-verified');
    } catch (err) {
      setErrors({ submit: 'Failed to save KYC details. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setErrors(prev => ({ ...prev, otp: '' }));

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // console.log('API call to:', config.baseURL + '/resend-aadhaar-otp', { aadhaarNumber: formData.aadhaarNumber });
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
          <div className={`${styles.kycVerifyContainer}`}>
            <div className={`${styles.gifImageContainer}`}>
              <img
                src="docsImages/loading.gif"
                alt="Verification in progress"
                className={`${styles.verificationGif}`}
              />
            </div>
            <div className={`${styles.textContainer}`}>
              <div className={`${styles.titleContainer}`}>
                We're verifying your KYC Details
              </div>
              <div className={`${styles.descriptionContainer}`}>
                We’re processing your information securely. You’ll be notified once your verification is complete
              </div>
            </div>
            <div className={`${styles.buttonContainer} text-center mt-6`}>
            <button
              onClick={handleContinue}
              className={styles.continueButton}
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCDetails;
