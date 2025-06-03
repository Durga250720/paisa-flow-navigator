
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from '../pages-styles/LoanAmount.module.css';
import { config } from '../config/environment';

const LoanAmount = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const kycVerified = localStorage.getItem('kycVerified');

    if (!authToken) {
      navigate('/');
      return;
    }

    if (!kycVerified) {
      navigate('/kyc-details');
      return;
    }
  }, [navigate]);

  const handleContinue = async () => {
    const newErrors: Record<string, string> = {};

    if (!loanAmount) {
      newErrors.loanAmount = 'Please enter the amount to be borrowed';
    }

    if (!purpose) {
      newErrors.purpose = 'Please enter the purpose of borrowing';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const payload = {
        borrower: {
          id: localStorage.getItem('authToken'),
          name: localStorage.getItem('name'),
        },
        email: localStorage.getItem('email'),
        phone: localStorage.getItem('phoneNumber'),
        loanAmount: parseFloat(loanAmount) || 0,
        loanPurpose: purpose,
      };

      const response = await fetch(config.baseURL + 'loan-application/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit loan application. Please try again.' }));
        throw new Error(errorData.message || 'Failed to submit loan application.');
      }

      // const responseData = await response.json(); // If you need to use the response data
      // localStorage.setItem('loanAmount', loanAmount);
      // localStorage.setItem('loanPurpose', purpose);
      navigate('/bank-info');
    } catch (err) {
      setLoading(false);
      setErrors({ submit: err instanceof Error ? err.message : 'An unexpected error occurred.' });
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
            <div className={styles.heading}>
              How Much Would You Like to Borrow?
            </div>
            
            <div className={styles.subHeading}>
              To deposit your approved amount and enable auto-repayment
            </div>

            <div className={styles.formFieldsContainer}>
              <div className={styles.fieldGroup}>
                <label htmlFor="loanAmount" className={styles.label}>
                  Enter the amount to be borrowed <sup>*</sup>
                </label>
                <input
                  id="loanAmount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="Enter the amount to be borrowed"
                  className="inputField"
                />
                {errors.loanAmount && <p className={styles.errorMessage}>{errors.loanAmount}</p>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="purpose" className={styles.label}>
                  Purpose of Borrowing <sup>*</sup>
                </label>
                <input
                  id="purpose"
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Enter the amount to be borrowed"
                  className="inputField"
                />
                {errors.purpose && <p className={styles.errorMessage}>{errors.purpose}</p>}
              </div>

              {errors.submit && <p className={styles.errorMessage}>{errors.submit}</p>}

              <button
                onClick={handleContinue}
                disabled={loading}
                className={styles.continueButton}
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanAmount;
