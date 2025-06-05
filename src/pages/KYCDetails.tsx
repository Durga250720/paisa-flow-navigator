import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';
import OTPInput from '../components/OTPInput';
import styles from '../pages-styles/KYCDetails.module.css';
import { toast } from 'sonner';


const KYCDetails = () => {
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    panNumber: ''
  });
  const [enteredOTP, setEnteredOTP] = useState(''); 
  const [showAadhaarOTP, setShowAadhaarOTP] = useState(false); 
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const aadhaarVerified = localStorage.getItem('aadhaarVerified');


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

  const handleSendOTP = async () => {
    setErrors({});

    if (!formData.aadhaarNumber) {
      setErrors({ aadhaar: 'Aadhaar number is required' });
      return;
    }

    if (!validateAadhaar(formData.aadhaarNumber)) {
      setErrors({ aadhaar: 'Please enter a valid 12-digit Aadhaar number' });
      return;
    }
    const aadhaarForApi = formData.aadhaarNumber.replace(/\s/g, ''); // Ensure no spaces

    setLoading(true);
    try {
      // Simulate API call
      const response = await fetch(`${config.baseURL}kyc-docs/aadhaar-otp?aadhaar=${aadhaarForApi}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send OTP. Please try again.';
        throw new Error(errorMessage);
      }
      toast.success("Aadhaar OTP sent to your registered mobile number.");
      setShowAadhaarOTP(true); // Show OTP input
      setResendTimer(30); // Start resend timer
    } catch (err) {
      setLoading(false);
      setErrors({ aadhaar: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Renamed from handleOTPComplete: This function now only updates the OTP state.
  const handleOtpInputChange = (otp: string) => {
    setEnteredOTP(otp); 
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  // This function handles OTP verification when Continue is clicked
  const handleVerifyOTP = async () => {
    setErrors({});

    if (!enteredOTP || enteredOTP.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit OTP.' });
      return;
    }

    const aadhaarForApi = formData.aadhaarNumber.replace(/\s/g, '');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      toast.error("Authentication token missing. Please log in again.");
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      // await new Promise(resolve => setTimeout(resolve, 1000)); // Remove simulation
      const response = await fetch(
        `${config.baseURL}kyc-docs/${authToken}/add-aadhaar?aadhaarNumber=${aadhaarForApi}&otp=${enteredOTP}`,
        {
          method: 'GET', // Assuming GET based on your previous code, but PUT/POST might be more appropriate for 'add'
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Attempt to parse API error message
        let errorMessage = 'Invalid OTP or failed to verify Aadhaar. Please try again.';
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

      toast.success("Aadhaar verified successfully!");
      localStorage.setItem('aadhaarVerified', 'true');
      setIsAadhaarVerified(true); // Aadhaar is verified
      navigate('/pan-info'); // Navigate to the new PAN page after Aadhaar verification
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
      setErrors({ otp: err instanceof Error ? err.message : 'Invalid OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setErrors(prev => ({ ...prev, otp: '' })); // Clear previous OTP error
    const aadhaarForApi = formData.aadhaarNumber.replace(/\s/g, ''); // Ensure no spaces

    try {
      // Simulate API call
      const response = await fetch(`${config.baseURL}kyc-docs/aadhaar-otp?aadhaar=${aadhaarForApi}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send OTP. Please try again.';
        throw new Error(errorMessage);
      }
      toast.success("Aadhaar OTP sent to your registered mobile number.");
      setShowAadhaarOTP(true); // Show OTP input
      setResendTimer(30); // Start resend timer
    } catch (err) {
      setLoading(false);
      setErrors({ aadhaar: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    if (field === 'aadhaarNumber') {
      processedValue = value.replace(/\D/g, ''); // Allow only digits for Aadhaar
    } else if (field === 'panNumber') {
      processedValue = value.toUpperCase(); // Convert PAN to uppercase
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateAadhaar = (aadhaar: string) => {
    // Basic 12-digit check after removing spaces
    return /^\d{12}$/.test(aadhaar.replace(/\s/g, ''));
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
          <div className={styles.kycFormContainer}>

            <div className="space-y-6 h-full flex flex-col justify-between">
              <div>
                <h1 className={styles.kycHeading}>KYC Details</h1>
                <div>
                  <label htmlFor="aadhaar" className={`${styles.label}`}>
                    Aadhaar Number <sup>*</sup>
                    {isAadhaarVerified && <span className="ml-2 text-green-600 text-xs">(Verified)</span>}
                  </label>
                  <input
                    id="aadhaar"
                    type="text"
                    onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                    placeholder="Enter Your Aadhaar Number"
                    className='inputField'
                    maxLength={12} // Only allow 12 digits as spaces are removed
                    disabled={isAadhaarVerified} // Disable if OTP shown or Aadhaar verified
                  />
                  {errors.aadhaar && <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>}

                </div>

                {/* Show OTP input only if OTP has been sent and Aadhaar is not yet verified */}
                {showAadhaarOTP && !isAadhaarVerified && (
                  <div>
                    <label className="block text-xs font-normal text-gray-700 mb-2 mt-6">
                      Enter OTP
                    </label>
                    <OTPInput
                      length={6} // Assuming 6-digit OTP
                      onComplete={handleOtpInputChange} // Update OTP state on completion
                      error={errors.otp} // Display OTP errors
                    // disabled={isAadhaarVerified} // Disable OTP input after verification
                    />
                    {!isAadhaarVerified && ( // Show resend option only if Aadhaar is not yet verified
                      <div className="text-center mt-6 flex justify-between items-center">
                        <div className={`text-sm ${errors.otp ? 'text-red-500' : 'text-gray-500'}`}>
                          {resendTimer > 0 ? `Resend OTP in 0:${resendTimer < 10 ? `0${resendTimer}` : resendTimer}` : 'Didn\'t receive OTP?'}
                        </div>
                        <button
                          onClick={handleResend}
                          disabled={resendTimer > 0 || loading}
                          className={`ml-4 text-sm font-medium ${resendTimer > 0 || loading ? `text-gray-400 cursor-not-allowed ${styles.resendOtp}` : 'text-primary hover:text-primary-dark'}`}
                        >
                          Resend OTP
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                {!showAadhaarOTP && !isAadhaarVerified && (
                  <p
                    onClick={() => {
                      if (!(loading || !formData.aadhaarNumber || !validateAadhaar(formData.aadhaarNumber))) {
                        handleSendOTP();
                      }
                    }}
                    className={`text-center mb-4 text-lg font-medium ${
                      (loading || !formData.aadhaarNumber || !validateAadhaar(formData.aadhaarNumber))
                        ? 'text-gray-400 cursor-not-allowed text-sm'
                        : 'text-primary cursor-pointer hover:text-primary-dark text-sm'
                    }`}
                  >
                    {loading && !showAadhaarOTP ? 'Sending...' : 'Send OTP'}
                  </p>
                )}
                <button
                  onClick={handleVerifyOTP} // Call the new verification function
                  disabled={loading || !enteredOTP || enteredOTP.length !== 6 || isAadhaarVerified} // Disabled until OTP is entered and not loading/already verified
                  className={`${styles.primaryButton} mt-4`} // Add top margin
                >
                  {loading && showAadhaarOTP && !isAadhaarVerified ? 'Verifying...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCDetails;
