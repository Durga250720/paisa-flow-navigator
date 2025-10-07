import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';
import styles from '../pages-styles/Login.module.css';
import { CheckCircle, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

const SignUp = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [uName, setName] = useState('');
  const [uMail, setMailId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); 
  const [isAgreed, setIsAgreed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      navigate('/admin/my-application');
      return;
    }

    const storedPhoneNumber = localStorage.getItem('phoneNumber');
    if (storedPhoneNumber) {
      setPhoneNumber(storedPhoneNumber);
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('otpVerified');
    localStorage.removeItem('basicInfoCompleted');
    localStorage.removeItem('aadhaarVerified');
    localStorage.removeItem('kycVerified');
  }, [navigate]);

  // Effect for the entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100); // Small delay to ensure animation triggers
    return () => clearTimeout(timer);
  }, []);

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

    if (!uName) newErrors.name = 'Please enter your name';
    if (!phoneNumber) newErrors.phoneNumber = 'Please enter your phone number';
    if (!uMail) newErrors.uMail = 'Please enter E-mail ID';

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (uMail && !validateEmail(uMail)) {
      newErrors.uMail = 'Please enter a valid E-mail ID';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
          email: uMail,
          source: 'WEBSITE',
          "termsAccepted": isAgreed
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
          // Ignore parsing error
        }
        throw new Error(errorMessage);
      }

      toast.success(`OTP sent to ${phoneNumber}`);
      localStorage.setItem('from', 'signup');
      localStorage.setItem('phoneNumber', phoneNumber);
      localStorage.setItem('name', uName);
      localStorage.setItem('email', uMail);
      navigate('/otp');
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccordion = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
      <div className={`${styles.container}`}>
        <div className={styles.navbarWrapper}>
          <Navbar />
        </div>

        <div className={`${styles.mainContainer}`}>
          {/* Left Panel with Animation Class */}
          <div className={`${styles.leftPanel} ${isLoaded ? styles.visible : ''}`}>
            <div className={styles.imageContainer}>
              <img
                  src="/lovable-uploads/8f598013-7362-496b-96a6-8a285565f544.png"
                  alt="Happy customer with phone"
                  className={styles.heroImage}
              />
            </div>
          </div>

          {/* Right Panel with Animation Class */}
          <div className={`${styles.rightPanel} ${isLoaded ? styles.visible : ''}`}>
            <div className={styles.loginFormWrapper}>
              <div className={styles.heading}>Let’s get started</div>

              <div className={styles.fieldGroup}>
                <label htmlFor="name" className={styles.label}>
                  Full Name <sup>*</sup>
                </label>
                <input
                    id="name"
                    type="text"
                    value={uName}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Please Enter Your Full Name"
                    className="inputField"
                />
                {errors.name && <p className={styles.errorMessage}>{errors.name}</p>}
              </div>

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
                    className="inputField"
                    maxLength={10}
                />
                {errors.phoneNumber && <p className={styles.errorMessage}>{errors.phoneNumber}</p>}
              </div>

              <div className={`${styles.fieldGroup} mt-4`}>
                <label htmlFor="email" className={styles.label}>
                  E-mail ID <sup>*</sup>
                </label>
                <input
                    id="email"
                    type="email"
                    value={uMail}
                    onChange={(e) => setMailId(e.target.value)}
                    placeholder="Please Enter E-mail ID"
                    className="inputField"
                />
                {errors.uMail && <p className={styles.errorMessage}>{errors.uMail}</p>}
              </div>

            <div className={`${styles.checkboxContainer} mt-4`}>
              <input
                id="terms"
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className={`${styles.checkbox} relative top-1`}
              />
              <label htmlFor="terms" className={`${styles.checkboxLabel} text-xs ml-2`}>
                I agree to the <span className="text-primary cursor-pointer">Terms & Conditions</span> and
                <span className="text-primary cursor-pointer"> Privacy Policy</span> of Paisa108 and consent to receive important updates, loan information, and promotional messages via SMS, RCS, WhatsApp, email, or phone from Paisa108 (Dytron Finvest Pvt. Ltd.).
              </label>
            </div>

              <button onClick={handleGetOTP} disabled={loading || !isAgreed} className={`${styles.submitButton} mt-4`}>
                {loading ? 'Sending...' : 'Get OTP'}
              </button>

              <p className={`${styles.dontHaveAccount} mt-2 mb-2`}>
                Already Have an Account?{' '}
                <span
                    className="text-primary font-medium text-md cursor-pointer border-b-2 border-primary"
                    onClick={() => navigate('/')}
                >
                Login
              </span>
              </p>

              <p className={styles.infoText}>Paisa108 – Get instant personal loans, anytime, anywhere</p>

              <div className={`${styles.secureInfoContainer} mt-2`}>
                <CheckCircle className="w-5 h-5 fill-green-500 text-white mr-2" />
                Secure, simple, 100% paperless
              </div>

              {/* Accordion Details Section */}
              <div className={`${styles.accordionContainer} mt-4`}>
                {/* Eligibility Criteria */}
                <div className={styles.accordionItem}>
                  <button onClick={() => handleToggleAccordion('eligibility')} className={styles.accordionHeader}>
                    <span>📌 Eligibility Criteria</span>
                    <ChevronDown
                        className={`${styles.accordionIcon} ${openSection === 'eligibility' ? styles.open : ''}`}
                    />
                  </button>
                  <div className={`${styles.accordionContent} ${openSection === 'eligibility' ? styles.open : ''}`}>
                    <ul className={styles.detailsList}>
                      <li>Must be an Indian Resident</li>
                      <li>Should be a Salaried Employee</li>
                      <li>Age above 25 years</li>
                      <li>Must have a Savings Bank Account</li>
                    </ul>
                  </div>
                </div>

                {/* Documents Required */}
                <div className={styles.accordionItem}>
                  <button onClick={() => handleToggleAccordion('documents')} className={styles.accordionHeader}>
                    <span>📑 Documents Required</span>
                    <ChevronDown
                        className={`${styles.accordionIcon} ${openSection === 'documents' ? styles.open : ''}`}
                    />
                  </button>
                  <div className={`${styles.accordionContent} ${openSection === 'documents' ? styles.open : ''}`}>
                    <ul className={styles.detailsList}>
                      <li>Completed Personal Loan Application with your latest photograph</li>
                      <li>PAN Card</li>
                      <li>
                        Residence Proof (any one):
                        <ul className={styles.nestedList}>
                          <li>Driving Licence</li>
                          <li>Voter ID</li>
                          <li>Passport</li>
                          <li>Utility Bills (Electricity / Water / Gas)</li>
                          <li>Post-paid / Landline Bill</li>
                        </ul>
                      </li>
                      <li>Last 3 Months’ Bank Statements of your salary account</li>
                      <li>Last 3 Months’ Salary Slips</li>
                    </ul>
                  </div>
                </div>

                {/* Personal Loan Details */}
                <div className={styles.accordionItem}>
                  <button onClick={() => handleToggleAccordion('loanDetails')} className={styles.accordionHeader}>
                    <span>💰 Personal Loan Details</span>
                    <ChevronDown
                        className={`${styles.accordionIcon} ${openSection === 'loanDetails' ? styles.open : ''}`}
                    />
                  </button>
                  <div className={`${styles.accordionContent} ${openSection === 'loanDetails' ? styles.open : ''}`}>
                    <ul className={styles.detailsList}>
                      <li>Interest Rate: Up to 1% per day</li>
                      <li>Annual Percentage Rate (APR): 18% – 45%</li>
                      <li>Processing Fees: 5% – 10% of the loan amount</li>
                      <li>Tenure: 10 days – 45 days</li>
                      <li>GST: Applicable on processing fees as per Government rates</li>
                    </ul>
                  </div>
                </div>

                {/* Note */}
                <div className={styles.accordionItem}>
                  <button onClick={() => handleToggleAccordion('note')} className={styles.accordionHeader}>
                    <span>📌 Note</span>
                    <ChevronDown className={`${styles.accordionIcon} ${openSection === 'note' ? styles.open : ''}`} />
                  </button>
                  <div className={`${styles.accordionContent} ${openSection === 'note' ? styles.open : ''}`}>
                    <ul className={styles.detailsList}>
                      <li>
                        Interest rates may vary based on factors like income consistency, employment stability, spending &
                        saving habits, and credit history.
                      </li>
                      <li>Processing fees are deducted at the time of loan disbursement.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SignUp;