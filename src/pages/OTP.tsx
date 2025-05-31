
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OTPInput from '../components/OTPInput';
import { config } from '../config/environment';
import styles from '../pages-styles/OTP.module.css';
import { Pencil } from 'lucide-react';

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

  const handleEditPhoneNumber = () => {
    navigate('/'); // Navigate to the Login page
  };

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
                  // onComplete={handleOTPComplete}
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
                // onClick will be handled by the form submission if type="submit" or by onComplete of OTPInput
                disabled={loading}
                className={styles.submitButton} // This button seems to be for visual purposes or might need an onClick
              >
                {loading ? 'Verifying...' : 'Login'}
              </button>

              <p className={styles.termsText}>
                By Clicking login you will be accepting{' '}
                <span className={styles.termsLink}>Terms and Conditions</span> and{' '}
                <span className={styles.termsLink}>Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTP;
