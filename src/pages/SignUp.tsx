import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';
import styles from '../pages-styles/Login.module.css';
import { CheckCircle } from 'lucide-react';
import {toast } from 'react-toastify';

const SignUp = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [uName, setName] = useState('');
  const [uMail, setMailId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const phoneNumber = localStorage.getItem('phoneNumber');

    if(phoneNumber){
      setPhoneNumber(phoneNumber);
    }

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

  const validateEmail = (email: string) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };


  const handleGetOTP = async () => {
    const newErrors: Record<string, string> = {};

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Please enter your phone number';
    }

    if (!uName) {
      newErrors.name = 'Please enter your name';
    }

    if (!uMail) {
      newErrors.uMail = 'Please enter E-mail ID';
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit mobile number';
    }

    if(uMail && !validateEmail(uMail)){
      newErrors.uMail = 'Please enter a valid E-mail ID';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    setLoading(true);

    try {
      const response = await fetch(config.baseURL + 'api/auth/send-signup-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: phoneNumber,
          name: uName,
          email:uMail,
          source: "WEBSITE"
        }),
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

      toast.success(`OTP sent to ${phoneNumber}`);
      // If API call is successful
      localStorage.setItem('from', 'signup')
      localStorage.setItem('phoneNumber', phoneNumber);
      localStorage.setItem('name', uName);
      localStorage.setItem('email', uMail)
      navigate('/otp'); // Navigate only on successful OTP send
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
      setErrors({ submit: err instanceof Error ? err.message : 'An unexpected error occurred.' });
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
          <div className={styles.formWrapper}>
            <div className={styles.heading}>SIGN-UP</div>

            <div className={styles.fieldGroup}>
              <label htmlFor="phone" className={styles.label}>
                Full Name <sup>*</sup>
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

            <div className={`${styles.fieldGroup} mt-4`}>
              <label htmlFor="phone" className={styles.label}>
                E-mail ID <sup>*</sup>
              </label>
              <input
                id="name"
                type="mail"
                value={uMail}
                onChange={(e) => setMailId(e.target.value)}
                placeholder="Please Enter E-mail ID"
                className='inputField'
              />
              {errors.uMail && <p className={styles.errorMessage}>{errors.uMail}</p>}
            </div>


            <button
              onClick={handleGetOTP}
              disabled={loading}
              className={`${styles.submitButton} mt-4`}
            >
              {loading ? 'Sending...' : 'Get OTP'}
            </button>

            <p className={`${styles.dontHaveAccount} mt-2 mb-2`}>
              Already Have an Account? <span className='text-primary font-medium text-md cursor-pointer border-b-2 border-primary' onClick={() => navigate('/')}>Login</span>
            </p>

            <p className={styles.infoText}>
              Paisa108 Get instant personal loan up to ₹ 25000
            </p>

            <div className={styles.secureInfoContainer}>
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

export default SignUp;
