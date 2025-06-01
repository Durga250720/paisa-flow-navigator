
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from '../pages-styles/VerificationProcessing.module.css'
const VerificationProcessing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    // const aadhaarVerified = localStorage.getItem('aadhaarVerified');

    // if (!authToken || !aadhaarVerified) {
    //   navigate('/');
    //   return;
    // }

    // Simulate processing time
    const timer = setTimeout(() => {
      localStorage.setItem('kycVerified', 'true');
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`${styles.container}`}>
      <div className={styles.navbarWrapper}>
        <Navbar />
      </div>
      <div className={`${styles.mainContainer}`}>
        <div className={`${styles.innerContainer} h-[100%]`}>
          <div className="lg:max-w-[100%] h-[100%] lg:bg-white lg:border lg:border-gray-200 lg:shadow-lg lg:rounded-lg lg:p-8 flex flex-col justify-center text-center ">
            <div className="mb-8">
              <div className={`${styles.gifImageContainer}`}>
                <img
                  src="docsImages/loading.gif"
                  alt="Verification in progress"
                  className={`${styles.verificationGif}`}
                />
              </div>
              <div className={`${styles.heading}`}>We're verifying your documents</div>
              <p className={`${styles.description}`}>
                We're processing your information securely. You'll be notified once your verification is complete
              </p>
            </div>

            <div className='flex items-center justify-center'>
              <button className={`${styles.applyBtn} w-max bg-primary text-white font-medium py-3  rounded-lg`}>
                Apply Laon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationProcessing;
