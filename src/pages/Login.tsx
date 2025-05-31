
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';
import styles from '../pages-styles/Login.module.css';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing auth tokens when landing on login page
    // This ensures we start fresh
    localStorage.removeItem('authToken');
    localStorage.removeItem('phoneNumber');
    localStorage.removeItem('otpVerified');
    localStorage.removeItem('basicInfoCompleted');
    localStorage.removeItem('aadhaarVerified');
    localStorage.removeItem('kycVerified');
  }, []);

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

        <div className={styles.rightPanel}>
          <div className={styles.formWrapper}>
            <h1 className={styles.heading}>Login</h1>

            <div className={styles.fieldGroup}>
              <label htmlFor="phone" className={styles.label}>
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Please Enter Your Full Name"
                className='inputField'
              />
              {error && <p className={styles.errorMessage}>{error}</p>}
            </div>

            <div className={`${styles.formFieldsContainer} mt-4`}>
              <div className={styles.fieldGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Please Enter Your Phone number"
                  className='inputField'
                  maxLength={10}
                />
                {error && <p className={styles.errorMessage}>{error}</p>}
              </div>


              <button
                onClick={handleGetOTP}
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Sending...' : 'Get OTP'}
              </button>

              <p className={styles.infoText}>
                Paisa108 Get instant personal loan up to ₹ 25000
              </p>

              <div className={styles.secureInfoContainer}>
                <div className={styles.secureInfoDot}></div>
                Secure, simple, 100% paperless
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
