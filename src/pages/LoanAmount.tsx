
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from '../pages-styles/LoanAmount.module.css';
import { config } from '../config/environment';
import { toast } from 'react-toastify';

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

    // if (!kycVerified) {
    //   navigate('/kyc-details');
    //   return;
    // }

  }, [navigate]);
  

  const handleLoanAmountChange = (value: string) => {
    // Clear existing error for loanAmount if user starts typing
    if (errors.loanAmount) {
      setErrors(prev => ({ ...prev, loanAmount: '' }));
    }

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 25000) {
      toast.warn("We will provide loan up to ₹25,000 only.");
      setLoanAmount('');
      return;
    }
    setLoanAmount(value);
  };

  const handleContinue = async () => {
    const newErrors: Record<string, string> = {};
    const numericLoanAmount = parseFloat(loanAmount);

    if (!loanAmount || isNaN(numericLoanAmount)) {
      newErrors.loanAmount = 'Please enter the amount to be borrowed';
    } else if (numericLoanAmount <= 0) {
      newErrors.loanAmount = 'Loan amount must be a positive number.';
    } else if (numericLoanAmount > 25000) {
      newErrors.loanAmount = 'Loan amount cannot exceed ₹25,000.';
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
        borrowerId: localStorage.getItem('authToken'),
        loanAmount: parseFloat(loanAmount) || 0,
        purpose: purpose,
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

      const res : any = await response.json();
      localStorage.setItem('appId',res.data.id)
      navigate('/approved-loan-amount');
    } catch (err: any) {
      setLoading(false);
      toast.error(err ? err.message : 'An unexpected error occurred.');
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
                  onChange={(e) => handleLoanAmountChange(e.target.value)}
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
                {loading ? 'Processing...' : 'Check Eligibility'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanAmount;
