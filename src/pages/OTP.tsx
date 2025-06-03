import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OTPInput from '../components/OTPInput';
import { config } from '../config/environment';
import styles from '../pages-styles/OTP.module.css';
import { Pencil } from 'lucide-react';
import { set } from 'date-fns';

const OTP = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpComplete, setIsOtpComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      // Redirect to admin dashboard if already logged in
      navigate('/admin');
      return;
    }

    // Check if user has phoneNumber from login flow
    const storedPhone = localStorage.getItem('phoneNumber');
    const storedName = localStorage.getItem('name');

    if (!storedPhone || !storedName) {
      // If no phone number or name in storage, redirect to login
      navigate('/');
      return;
    }

    if (storedPhone) {
      setPhoneNumber(storedPhone);
    }

    if (storedName) {
      setName(storedName);
    }

    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleOTPComplete = (completedOtp: string) => {
    setOtp(completedOtp);
    setIsOtpComplete(true);
    setError('');
  };

  const handleLoginClick = async () => {
    if (!isOtpComplete || loading) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch(config.baseURL + 'api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: phoneNumber,
          name: name,
          otp: otp
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Invalid OTP. Please try again.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Ignore if error response is not JSON
        }
        throw new Error(errorMessage);
      }

      const res = await response.json();

      localStorage.setItem('authToken', res.data.id);
      // setAuthToken(res.data.id);
      localStorage.setItem('otpVerified', 'true');
      // navigate('/kyc-details');
      handleFetchDetails(res.data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDetails = async (token:string) => {
    try {
      const response = await fetch(config.baseURL + `borrower/${token}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        let errorMessage = 'Invalid OTP. Please try again.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Ignore if error response is not JSON
        }
        throw new Error(errorMessage);
      }

      const res = await response.json();
      // navigate('/kyc-details');
      if(res.data.aadhaarVerified && res.data.panVerified){
        navigate('/admin/kyc-documents') 
      }
      else{
        navigate('/kyc-details');
      }
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      const response = await fetch(config.baseURL + 'api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: phoneNumber,
          name: name,
        }),
      });

      if (!response.ok) {
        // Attempt to parse error message from API if available
        let errorMessage = 'Failed to send OTP. Please try again.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Ignore if error response is not JSON or doesn't have a message
        }
        throw new Error(errorMessage);
      }
      navigate('/otp'); // Navigate only on successful OTP send
    } catch (err) {
      setLoading(false);
      // setErrors({ submit: err instanceof Error ? err.message : 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length >= 10) {
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
  };

  const handleEditPhoneNumber = () => {
    navigate('/'); // Navigate to the Login page
  };

  const handleTermsClick = () => {
        window.open('/terms-conditions', '_blank');
  }

  const handlePrivacyClick = () => {
    window.open('/privacy-policy', '_blank');
  }


  return (
    <div className={`${styles.container} block`}>
      <div className={styles.navbarWrapper}>
        <Navbar />
      </div>

      <div className={`${styles.mainContainer}`}>
        {/* Left side - Hero Image */}
        <div className={styles.leftPanel}>
          <div className={styles.imageWrapper}>
            <img
              src="/lovable-uploads/8f598013-7362-496b-96a6-8a285565f544.png"
              alt="Happy customer with phone"
              className={styles.heroImage}
            />
          </div>
        </div>

        {/* Right side - OTP Form */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>

            <h1 className={styles.heading}>OTP</h1>

            <div className={styles.fieldsWrapper}>
              <div className={styles.infoTextContainer}>
                <p className={styles.infoTextPrimary}>
                  Enter the code which we sent to
                </p>
                <div className="flex items-center justify-center">
                  <p className={styles.infoTextSecondary}>
                    +91 {formatPhoneNumber(phoneNumber)}
                  </p>
                  <button onClick={handleEditPhoneNumber} className="ml-2 text-primary hover:text-primary-dark">
                    <Pencil size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className={styles.otpLabel}>
                  Enter OTP
                </label>
                <OTPInput
                  length={6}
                  onComplete={handleOTPComplete}
                  error={error}
                />
              </div>

              <div className={styles.resendContainer}>
                <div className={styles.timerText}>0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</div>
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className={`${styles.resendButton} ${resendTimer > 0 ? styles.resendButtonDisabled : styles.resendButtonActive}`}
                >
                  Resend
                </button>
              </div>

              <button
                onClick={handleLoginClick}
                disabled={!isOtpComplete || otp.length != 6 || loading}
                className={styles.submitButton}
              >
                {loading ? 'Verifying...' : 'Login'}
              </button>

              <p className={styles.termsText}>
                By Clicking login you will be accepting{' '}
                <span className={`${styles.termsLink} cursor-pointer`} onClick={handleTermsClick}>Terms and Conditions</span> and{' '}
                <span className={`${styles.termsLink} cursor-pointer`} onClick={handlePrivacyClick}>Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTP;
