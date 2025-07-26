import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from '../pages-styles/UnderwritingVerification.module.css';
import { CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { config } from '@/config/environment';
import {toast } from 'react-toastify';

const UnderwritingVerification = () => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get token from URL params (would be in the email link)
  const verificationToken = searchParams.get('status');
  const applicationId = searchParams.get('appId');

  useEffect(() => {
    // Redirect to 404 if required query parameters are missing
    if (!verificationToken || !applicationId) {
      navigate('/404', { replace: true });
      return;
    }
    
    if (verificationToken === 'COMPLETED') {
      setVerified(true)
    }
  }, [verificationToken, applicationId, navigate]);

  const handleVerify = async () => {

    setLoading(true);
    setError('');

    try {
      // Simulate API call for verification
      const response = await fetch(`${config.baseURL}loan-application/${applicationId}/verify-underwriting-mail`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

      const results = await response.json();

      if (results != null) {
        if (results?.data.underwriting === 'COMPLETED') {
          setVerified(true);
          setTimeout(() => {
            navigate('/admin/my-application')
          }, 2000);
        }
        else {
          setVerified(true);
          toast.success(results.data.details);
        }
      }

    } catch (err) {
      const errorMessage = err.message || 'Verification failed. Please try again or contact support.';
      toast.error(errorMessage)
      setError('Verification failed. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  // if (verified) {
  //   return (

  //   );
  // }

  return (
    <div>
      {
        verified ?
          <div className={styles.container
          } >
            <div className={styles.navbarWrapper}>
              <Navbar />
            </div>
            <div className={styles.mainContainer}>
              <div className={styles.innerContainer}>
                <div className={styles.verificationCard}>
                  <div className={styles.gifImageContainer}>
                    <img
                      src="docsImages/success.gif"
                      alt="Verification successful"
                      className={styles.verificationGif}
                    />
                  </div>
                  <div className={styles.textContainer}>
                    <div className={styles.titleContainer}>
                      <CheckCircle className="w-6 h-6 fill-green-500 text-white mr-2" />
                      Underwriting Verified Successfully!
                    </div>
                    <div className={styles.description}>
                      Your application has been verified and approved. Redirecting to your dashboard...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div >
          :
          <div className={styles.container}>
            <div className={styles.navbarWrapper}>
              <Navbar />
            </div>
            <div className={styles.mainContainer}>
              <div className={styles.leftPanel}>
                <div className={styles.imageContainer}>
                  <img
                    src="/lovable-uploads/8f598013-7362-496b-96a6-8a285565f544.png"
                    alt="Underwriting verification"
                    className={styles.heroImage}
                  />
                </div>
              </div>

              <div className={styles.rightPanel}>
                <div className={styles.formWrapper}>
                  <div className={styles.verificationCard}>
                    <div className={styles.iconContainer}>
                      <FileText className="w-12 h-12 text-primary" />
                    </div>

                    <div className={styles.textContainer}>
                      <h1 className={styles.heading}>
                        Underwriting Verification
                      </h1>
                      <p className={styles.subtitle}>
                        Please verify your application to complete the underwriting process.
                        This verification ensures the accuracy of your submitted information.
                      </p>
                    </div>

                    {/* {error && (
                      <div className={styles.errorContainer}>
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        <span className={styles.errorText}>{error}</span>
                      </div>
                    )} */}

                    <div className={styles.infoCard}>
                      <h3 className={styles.infoTitle}>What happens after verification?</h3>
                      <ul className={styles.infoList}>
                        <li>• Your application will be processed immediately</li>
                        <li>• You'll receive loan approval status within 24 hours</li>
                        <li>• Final loan terms will be made available in your dashboard</li>
                      </ul>
                    </div>


                    <div className={styles.buttonContainer}>
                      <button
                        onClick={handleVerify}
                        disabled={loading}
                        className={`${styles.verifyButton}`}
                      >
                        {loading ? 'Verifying...' : 'Verify Application'}
                      </button>
                    </div>

                    <div className={styles.footerText}>
                      If you didn't request this verification, please contact our support team.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      }
    </div>
  );
};

export default UnderwritingVerification;