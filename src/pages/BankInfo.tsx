
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';
import styles from '../pages-styles/EmployemntInfo.module.css';
import { toast } from "sonner";

const BankInfo = () => {
    const [formData, setFormData] = useState({
        bankAccountNumber: '',
        reEnterBankAccountNumber: '',
        ifscCode: '',
        accountHolderName: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const bankInfoCompleted = localStorage.getItem('bankInfoCompleted');

        if (!authToken) {
            navigate('/');
        }
    }, [navigate]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.bankAccountNumber.trim()) {
            newErrors.bankAccountNumber = 'Bank account number is required';
        } else if (formData.bankAccountNumber.length < 9 || formData.bankAccountNumber.length > 18) {
            newErrors.bankAccountNumber = 'Bank account number should be 9-18 digits';
        }

        if (!formData.reEnterBankAccountNumber.trim()) {
            newErrors.reEnterBankAccountNumber = 'Please re-enter bank account number';
        } else if (formData.bankAccountNumber !== formData.reEnterBankAccountNumber) {
            newErrors.reEnterBankAccountNumber = 'Account numbers do not match';
        }

        if (!formData.ifscCode.trim()) {
            newErrors.ifscCode = 'IFSC code is required';
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
            newErrors.ifscCode = 'Please enter a valid IFSC code';
        }

        if (!formData.accountHolderName.trim()) {
            newErrors.accountHolderName = 'Account holder name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleContinue = async () => {
        if (!validateForm()) return;

        setLoading(true);
        // try {
        //     // Simulate API call
        //     await new Promise(resolve => setTimeout(resolve, 1000));
            
            // toast.success("Bank details saved successfully!");
            // localStorage.setItem('bankInfoCompleted', 'true');
            // navigate('/income-verification');
        // } catch (err) {
        //     const errorMessage = err instanceof Error ? err.message : 'Failed to save bank information. Please try again.';
        //     setErrors({ submit: errorMessage });
        //     toast.error(errorMessage);
        // } finally {
        //     setLoading(false);
        // }
        const authToken = localStorage.getItem('authToken');

        setLoading(true);
        try {
            const payload = {
                borrowerId: authToken,
                accountNumber: formData.bankAccountNumber,
                ifscNumber: formData.ifscCode.toUpperCase(),
                accountHolderName: formData.accountHolderName
            };

            console.log('API payload:', payload);

            // API call to bank-detail
            const apiUrl = `${config.baseURL}bank-detail`;
            console.log('Making API call to:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('API response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);

                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: 'Failed to save bank information. Please try again.' };
                }

                throw new Error(errorData.message || 'Failed to save bank information.');
            }

            const responseData = await response.json();
            console.log('API success response:', responseData);
            toast.success("Bank details saved successfully!");
            localStorage.setItem('bankInfoCompleted', 'true');
            navigate('/income-verification');
        } catch (err) {
            setLoading(false);
            const errorMessage = err instanceof Error ? err.message : 'Failed to save bank information. Please try again.';
            setErrors({ submit: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.navbarWrapper}>
                <Navbar />
            </div>

            <div className={styles.mainContainer}>
                {/* Left Panel - Image */}
                <div className={styles.leftPanel}>
                    <div className={styles.imageContainer}>
                        <img
                            src="/lovable-uploads/8f598013-7362-496b-96a6-8a285565f544.png"
                            alt="Happy customer with phone"
                            className={styles.heroImage}
                        />
                    </div>
                </div>

                {/* Right Panel - Employment Form */}
                <div className={styles.rightPanel}>
                    <div className={styles.employmentFormContainer1}>
                        <div className="text-center mb-2">
                            <div className={styles.heading}>Bank Info</div>
                            <p className={styles.description}>To deposit your approved amount and enable auto-repayment</p>
                        </div>

                        <div className={`space-y-4 ${styles.formContainer1}`}>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bank Account Number <sup className="text-red-500">*</sup>
                                </label>
                                <input
                                    type="number"
                                    value={formData.bankAccountNumber}
                                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                                    placeholder="Enter the Account Number"
                                    className="inputField1"
                                />
                                {errors.bankAccountNumber && <p className="error-message">{errors.bankAccountNumber}</p>}
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Re-Enter Bank Account Number
                                </label>
                                <input
                                    type="number"
                                    value={formData.reEnterBankAccountNumber}
                                    onChange={(e) => handleInputChange('reEnterBankAccountNumber', e.target.value)}
                                    placeholder="Enter the Account Number Again"
                                    className="inputField1"
                                />
                                {errors.reEnterBankAccountNumber && <p className="error-message">{errors.reEnterBankAccountNumber}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-1">
                                    IFSC Code <sup className="text-red-500">*</sup>
                                </label>
                                <input
                                    id="monthlyIncome"
                                    type="text"
                                    value={formData.ifscCode}
                                    onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                                    placeholder="Enter the IFSC Code"
                                    className="inputField1"
                                />
                                {errors.ifscCode && <p className="error-message">{errors.ifscCode}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700 mb-1">
                                    Account Holder Name <sup className="text-red-500">*</sup>
                                </label>
                                <input
                                    id="workExperience"
                                    type="text"
                                    value={formData.accountHolderName}
                                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                                    placeholder="Enter the account holder name"
                                    className="inputField1"
                                />
                                {errors.accountHolderName && <p className="error-message">{errors.accountHolderName}</p>}
                            </div>
                        </div>

                        {errors.submit && <p className="error-message text-center mt-4">{errors.submit}</p>}

                        <div className={`${styles.bottomContainer} text-center mt-2`}>
                            <button
                                onClick={handleContinue}
                                disabled={loading}
                                className="primary-button px-20"
                            >
                                {loading ? 'Saving...' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankInfo;
