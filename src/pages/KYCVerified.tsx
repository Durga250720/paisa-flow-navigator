import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OTPInput from '../components/OTPInput';
import { config } from '../config/environment';
import styles from '../pages-styles/KYCDetails.module.css';
import { CheckCircle } from 'lucide-react';

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



  const handleContinue = async () => {
    setErrors({});

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('kycVerified', 'true');
      navigate('/bank-info');
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
          <div className={`${styles.kycVerifyContainer}`}>
            <div className={`${styles.gifImageContainer}`}>
              <img
                src="docsImages/success.gif"
                alt="Verification in progress"
                className={`${styles.verificationGif}`}
              />
            </div>
            <div className={`${styles.textContainer}`}>
              <div className={`${styles.titleContainer1}`}>
                <CheckCircle className="w-5 h-5 fill-green-500 text-white mr-2" />
                KYC Verified
              </div>
              <div className={`${styles.descriptionContainer} mt-10`}>
                Congrats! Your KYC Got Verified, You can Apply for loan
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
