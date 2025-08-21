import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from '../pages-styles/UnderwritingVerification.module.css';
import { CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { config } from '@/config/environment';
import { toast } from 'react-toastify';
import axiosInstance from '@/lib/axiosInstance';
import { formatIndianNumber } from '../lib/utils';

const UnderwritingVerification = () => {
  // State for verify button action
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // New states for fetching and storing application data
  const [applicationData, setApplicationData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Get token from URL params
  const verificationToken = searchParams.get('status');
  const applicationId = searchParams.get('appId');

  useEffect(() => {
    // Redirect if required params are missing
    if (!verificationToken || !applicationId) {
      navigate('/404', { replace: true });
      return;
    }

    if (verificationToken === 'COMPLETED') {
      setVerified(true);
    }

    // Fetch application details to show for review
    const fetchDetails = async () => {
      if (!applicationId) return;
      setDataLoading(true);
      try {
        const response = await axiosInstance.get(`/api/auth/${applicationId}/details`);
        setApplicationData(response.data.data);
      } catch (err) {
        const errorMessage = err?.response?.data?.message || 'Failed to load application details.';
        toast.error(errorMessage);
        setError('Could not load application details. Please try again later.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchDetails();
  }, [verificationToken, applicationId, navigate]);

  const handleVerify = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get(`/loan-application/${applicationId}/verify-underwriting-mail`);
      const results = response.data;

      if (results != null) {
        if (results?.data.underwriting === 'COMPLETED') {
          setVerified(true);
          setTimeout(() => {
            navigate('/admin/my-application');
          }, 3000); // Increased timeout for user to see success message
        } else {
          setVerified(true);
          toast.success(results.data.details);
        }
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Verification failed. Please try again or contact support.';
      toast.error(errorMessage);
      setError('Verification failed. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationPage = () => (
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
                  <h1 className={styles.heading}>Underwriting Verification</h1>
                  <p className={styles.subtitle}>
                    Please review your application details below and click "Verify Application" to complete the underwriting process.
                  </p>
                </div>

                {/* Application Details Section */}
                {dataLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-4 text-gray-600">Loading application details...</p>
                    </div>
                ) : applicationData ? (
                    <div className={styles.detailsSection}>
                      <h3 className={styles.detailsTitle}>Loan Summary</h3>
                      <div className={styles.detailItem}>
                        <span>Loan Amount</span>
                        <strong>₹ {formatIndianNumber(applicationData.loanAmount || 0)}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Interest ({applicationData.loanConfig?.loanInterestPercentage}%)</span>
                        <strong>₹ {formatIndianNumber(applicationData.loanConfig?.loanInterest || 0)}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Processing Fee</span>
                        <strong>₹ {formatIndianNumber(applicationData.loanConfig?.processingFee || 0)}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>GST on Fee</span>
                        <strong>₹ {formatIndianNumber(applicationData.loanConfig?.gstOnProcessingFee || 0)}</strong>
                      </div>
                      <div className={styles.totalRepayment}>
                        <span>Total Repayment Amount</span>
                        <strong>₹ {formatIndianNumber(applicationData.totalRepaymentAmount || 0)}</strong>
                      </div>
                    </div>
                ) : (
                    <div className={styles.errorContainer}>
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className={styles.errorText}>{error}</span>
                    </div>
                )}

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
                      disabled={loading || dataLoading || !applicationData}
                      className={styles.verifyButton}
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
  );

  const renderSuccessPage = () => (
      <div className={styles.container}>
        <div className={styles.navbarWrapper}>
          <Navbar />
        </div>
        <div className={styles.mainContainer}>
          <div className={styles.innerContainer}>
            <div className={styles.verificationCard}>
              <div className={styles.gifImageContainer}>
                <img
                    src="/docsImages/success.gif"
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
                  Your application has been verified. Redirecting to your dashboard...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );

  return (
      <div>
        {verified ? renderSuccessPage() : renderVerificationPage()}
      </div>
  );
};

export default UnderwritingVerification;