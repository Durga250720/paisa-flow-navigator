
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from '../pages-styles/LoanAmount.module.css';
import { config } from '../config/environment';
import { toast } from 'react-toastify'; // Assuming this is sonner or react-toastify
import { ChevronRight, Check } from 'lucide-react';

const PreApprovedLoadAmount = () => {
    const [loanAmount, setLoanAmount] = useState<number>(6000); // Min loan amount as initial
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [applicationData, setApplicationData] = useState<any>();
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const kycVerified = localStorage.getItem('kycVerified');

        if (!authToken) {
            navigate('/');
            return;
        }

        fetchUserProfile();

    }, [navigate]);

    const fetchUserProfile = async () => {
        const applicationId = localStorage.getItem('appId');
        try {
            const response = await fetch(config.baseURL + `loan-application/${applicationId}/details`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const res = await response.json();
            setLoanAmount(res.data.loanAmount)
            setApplicationData(res.data)
            console.log(res.data)

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'An unexpected error occurred.');
        }
        finally {

        }
    }

    const handleLoanAmountChange = (valueString: string) => {
        if (errors.loanAmount) {
            setErrors(prev => ({ ...prev, loanAmount: '' }));
        }

        const value = parseInt(valueString, 10);

        if (isNaN(value)) {
            setLoanAmount(6000);
            return;
        }

        if (value > 25000) {
            toast.warn("We will provide loan up to ₹25,000 only.");
            setLoanAmount(25000);
            return;
        }
        if (value < 1000) { // Assuming 1000 is min from slider
            setLoanAmount(1000); // Cap at min
            return;
        }
        setLoanAmount(value);
    };

    const handleContinue = async () => {
        const newErrors: Record<string, string> = {};
        if (loanAmount < 1000) { // Min loan amount check
            newErrors.loanAmount = 'Loan amount must be at least ₹1,000.';
        } else if (loanAmount > 25000) { // Max loan amount check (should be caught by handleLoanAmountChange too)
            newErrors.loanAmount = 'Loan amount cannot exceed ₹25,000.';
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

            // const payload = {
            //     borrowerId: localStorage.getItem('authToken'),
            //     loanAmount: loanAmount,
            //     // loanPurpose: purpose, // Purpose is removed
            // };

            const response = await fetch(config.baseURL + `loan-application/${localStorage.getItem('appId')}/update-amount?amount=${loanAmount}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                // body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to submit loan application. Please try again.' }));
                throw new Error(errorData.message || 'Failed to submit loan application.');
            }
              navigate('/admin/my-application');
        } catch (err: any) {
            setLoading(false);
            toast.error(err ? err.message : 'An unexpected error occurred.');
            setErrors({ submit: err instanceof Error ? err.message : 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    // Fees and total calculation from CreateMyBorrowing.tsx
    const flatFee = applicationData?.loanConfig?.platformFee;
    const loanInterestPercentage = (applicationData?.loanAmount / applicationData?.loanConfig?.loanInterest)/100;
    const interest =loanAmount*loanInterestPercentage; // This might need to be dynamic based on loanAmount
    const loanProtectionFee = applicationData?.loanConfig?.loanProtectionFee;
    const loanProcessingFee = applicationData?.loanConfig?.processingFee;
    const gstOnProcessingFee = loanProcessingFee * 0.18
    const totalAmount = loanAmount + flatFee + interest + loanProtectionFee + loanProcessingFee;

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
                        <div className={styles.heading1}>
                            Congratulations! You’re Approved Limit ₹{applicationData?.approvedAmount}
                        </div>

                        {/* === Replaced section starts here === */}
                        <div className={`${styles.borrowingSection} mt-4`}> {/* Added mt-6 for spacing */}
                            {/* Loan Amount Display and Slider */}
                            <div className="mb-8">
                                <div className="text-3xl font-medium text-primary mb-6 text-center">
                                    ₹{loanAmount > 0 ? loanAmount.toLocaleString() : '0'}
                                </div>

                                {/* Slider */}
                                <div className="relative mb-6">
                                    <input
                                        type="range"
                                        min="1000"
                                        max={applicationData?.approvedAmount}
                                        step="500"
                                        value={loanAmount} // Use loanAmount (number) for slider value
                                        onChange={(e) => handleLoanAmountChange(e.target.value)}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #5D15C1 0%, #5D15C1 ${((loanAmount - 1000) / (25000 - 1000)) * 100}%, #e5e7eb ${((loanAmount - 1000) / (25000 - 1000)) * 100}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>₹1,000</span>
                                        <span>₹25,000</span>
                                    </div>
                                </div>
                                {errors.loanAmount && <p className={`${styles.errorMessage} text-center`}>{errors.loanAmount}</p>}
                            </div>

                            {/* Fee Breakdown */}
                            <div className="space-y-2 mb-6 text-left">
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center">
                                        <span className="text-gray-600">Platform fee (inc. GST)</span>
                                        <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center ml-2 text-xs text-gray-400 cursor-pointer" title="Processing fee including GST">
                                            i
                                        </div>
                                    </div>
                                    <span className="font-medium">₹ {flatFee}</span>
                                </div>

                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Interest</span>
                                    <span className="font-medium">₹ {interest}</span>
                                </div>

                                <div className="flex justify-between text-xs">
                                    <div className="flex items-center">
                                        <span className="text-gray-600">Loan Protection Fee</span>
                                        {/* <span className="text-primary text-xs ml-2 cursor-pointer">Remove</span> */}
                                    </div>
                                    <span className="font-medium">₹ {loanProtectionFee}</span>
                                </div>

                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Processing Fee</span>
                                    <span className="font-medium">₹ {loanProcessingFee}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-600">GST On Processing Fee</span>
                                    <span className="font-medium">₹ {gstOnProcessingFee}</span>
                                </div>

                                <div className="flex justify-between text-sm font-medium pt-2 border-t mt-2">
                                    <span className="text-gray-700">Pay total by [Due Date]</span> {/* Placeholder for Due Date */}
                                    <span className="text-gray-900">₹ {totalAmount}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Transfer to</span>
                                    <span className="font-medium">**** 1234 (ICICI)</span> {/* Placeholder Bank Info */}
                                </div>
                            </div>

                            {/* KFS & Loan Documents */}
                            <div className="mb-6 border-t pt-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                    <span className="text-gray-700 font-medium text-sm">KFS & Loan Documents</span>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            {errors.submit && <p className={`${styles.errorMessage} text-center mb-4`}>{errors.submit}</p>}

                            {/* Continue Button */}
                            <button
                                onClick={handleContinue}
                                disabled={loading || loanAmount < 1000} // Disable if loading or amount is less than min
                                className={`${styles.continueButton} w-full text-sm`} // Use existing button style or adapt
                            >
                                {loading ? 'Processing...' : 'Continue'}
                            </button>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center text-xs text-gray-600 mt-4">
                                <Check className="w-4 h-4 text-green-500 mr-1" />
                                100% Safe & Secure
                            </div>
                        </div>
                        {/* === Replaced section ends here === */}

                    </div>
                </div>
            </div>
        </div>
    );
};


export default PreApprovedLoadAmount;
