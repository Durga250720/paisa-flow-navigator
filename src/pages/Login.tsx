
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';
import styles from '../pages-styles/Login.module.css';
import { CheckCircle } from 'lucide-react';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [uName, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    const newErrors: Record<string, string> = {};

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Please enter your phone number';
    }

    if (!uName) {
      newErrors.name = 'Please enter your name';
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

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
      setErrors({ submit: 'Failed to send OTP. Please try again.' });
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
            <div className={styles.heading}>Login</div>

            <div className={styles.fieldGroup}>
              <label htmlFor="phone" className={styles.label}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={uName}
                onChange={(e) => setName(e.target.value)}
                placeholder="Please Enter Your Full Name"
                className='inputField'
              />
              {errors.name && <p className={styles.errorMessage}>{errors.name}</p>}
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
                {errors.phoneNumber && <p className={styles.errorMessage}>{errors.phoneNumber}</p>}
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
                <CheckCircle className="w-5 h-5 fill-green-500 text-white mr-2" />
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
