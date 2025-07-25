import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';
import styles from '../pages-styles/Login.module.css';
import { CheckCircle } from 'lucide-react';
import {toast } from 'react-toastify';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem('authToken');
    const phoneNumber = localStorage.getItem('phoneNumber') || '';

    if(phoneNumber){
      setPhoneNumber(phoneNumber);
    }

    console.log(phoneNumber)
    if (authToken) {
      navigate('/admin/my-application');
      return;
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('otpVerified');
    localStorage.removeItem('basicInfoCompleted');
    localStorage.removeItem('aadhaarVerified');
    localStorage.removeItem('kycVerified');
  }, [navigate]);

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };


  const handleGetOTP = async () => {
    const newErrors: Record<string, string> = {};

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Please enter your phone number';
    }


    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    setLoading(true);
    localStorage.setItem('phoneNumber', phoneNumber);

    try {
      const response = await fetch(config.baseURL + `api/auth/send-otp?mobile=${phoneNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send OTP. Please try again.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
        }
        throw new Error(errorMessage);
      }

      localStorage.setItem('from', 'login')
      toast.success(`OTP sent to ${phoneNumber}`);
      navigate('/otp');
    } catch (err) {
      toast.warning(err.message);
       if(err.message == 'User Not Registered! Please Signup'){
        navigate('/sign-up');
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container}`}>
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
          <div className={styles.loginFormWrapper}>
            <div className={styles.heading}>Login</div>

            {/* <div className={`${styles.formFieldsContainer} mt-4`}> */}
            <div className={`${styles.fieldGroup} mt-4`}>
              <label htmlFor="phone" className={styles.label}>
                Phone Number <sup>*</sup>
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
              className={`${styles.submitButton} mt-4`}
            >
              {loading ? 'Sending...' : 'Get OTP'}
            </button>

            <p className={`${styles.dontHaveAccount} mt-2`}>
              Don't you have account? <span className='text-primary font-medium text-md cursor-pointer border-b-2 border-primary' onClick={() => navigate('/sign-up')}>Signup</span>
            </p>

            <p className={`${styles.infoText} mt-2`}>
              Paisa108 Get instant personal loan up to ₹ 25000
            </p>

            <div className={`${styles.secureInfoContainer} mt-2`}>
              <CheckCircle className="w-5 h-5 fill-green-500 text-white mr-2" />
              Secure, simple, 100% paperless
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
