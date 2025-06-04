import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';
import styles from '../pages-styles/KYCDetails.module.css'; // Reusing styles from KYCDetails
import { toast } from 'sonner';

const PANInfo = () => {
    const [panNumber, setPanNumber] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showWhyNeededPopup, setShowWhyNeededPopup] = useState(false); // State for popup visibility
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const aadhaarVerified = localStorage.getItem('aadhaarVerified');
        const panVerified = localStorage.getItem('panVerified'); // Assuming you'll set this after PAN verification

        // Redirect if not authenticated or Aadhaar not verified
        if (!authToken) {
            navigate('/'); // Or navigate to Aadhaar step if needed
            return;
        }

        if (panVerified) {
            navigate('/kyc-verification');
            return;
        }

    }, [navigate]);

    const validatePAN = (pan: string) => {
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
    };

    const handleInputChange = (value: string) => {
        const processedValue = value.toUpperCase(); // Convert PAN to uppercase
        setPanNumber(processedValue);
        if (errors.pan) {
            setErrors(prev => ({ ...prev, pan: '' }));
        }
    };

    const handleContinue = async () => {
        setErrors({});

        if (!panNumber) {
            setErrors({ pan: 'PAN number is required' });
            return;
        }

        if (!validatePAN(panNumber)) {
            setErrors({ pan: 'Please enter a valid PAN number' });
            return;
        }

        const panForApi = panNumber.toUpperCase();
        const authToken = localStorage.getItem('authToken'); // Get token again inside async function

        if (!authToken) {
            // Should not happen if useEffect works, but good safeguard
            toast.error("Authentication token missing. Please log in again.");
            navigate('/');
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            const response = await fetch(
                `${config.baseURL}borrower/${authToken}/add-pan?panNumber=${panForApi}`,
                {
                    method: 'GET', // Assuming GET based on your previous code, but PUT/POST might be more appropriate for 'add'
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (!response.ok) {
                let errorMessage = 'Failed to verify PAN number. Please try again.';
                // Attempt to parse API error message
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

            toast.success("PAN verified successfully!");
            localStorage.setItem('panVerified', 'true'); // Set a flag for PAN verification
            localStorage.setItem('kycVerification', 'true'); // Keep this if it signifies overall KYC started
            navigate('/kyc-verified'); // Navigate to the next step (verification processing)
        } catch (err) {
            setLoading(false);
            setErrors({ submit: err instanceof Error ? err.message : 'Failed to save PAN details. Please try again.' });
            toast.error(err instanceof Error ? err.message : 'Failed to save PAN details. Please try again.');
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

                {/* Right side - PAN Details Form */}
                <div className={styles.rightPanel}>
                    <div className={styles.kycFormContainer}> {/* Reusing KYC form container styles */}

                        <div className="space-y-6 h-full flex flex-col justify-between">
                            <div>
                                <h1 className={styles.kycHeading}>PAN Details</h1> {/* Reusing KYC heading styles */}
                                <div>
                                    <label htmlFor="panNumber" className={`${styles.label}`}> {/* Reusing label styles */}
                                        PAN Number <sup>*</sup>
                                    </label>
                                    <input
                                        id="panNumber"
                                        type="text"
                                        value={panNumber}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        placeholder="Please Enter PAN Number"
                                        className="inputField" // Assuming inputField is a global or shared class
                                        maxLength={10}
                                    />
                                    {errors.pan && <p className="text-red-500 text-sm mt-1">{errors.pan}</p>}
                                    <div className="flex justify-end mt-2">
                                        <span
                                            className="text-primary text-sm cursor-pointer hover:underline"
                                            onClick={() => setShowWhyNeededPopup(true)}
                                        >
                                            Why we need this?
                                        </span>
                                    </div>
                                </div>

                                {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}
                            </div>

                            <div>
                                <button
                                    onClick={handleContinue}
                                    disabled={loading || !panNumber || !validatePAN(panNumber)}
                                    className={styles.primaryButton} // Reusing primary button styles
                                >
                                    {loading ? 'Verifying...' : 'Continue'}
                                </button>
                                <p className="text-center text-xs text-gray-500 mt-2">
                                    By clicking Continue, you allow us to securely check your credit profile to assess your loan eligibility
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why We Need This Popup */}
            {showWhyNeededPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Why We Need Your PAN</h3>
                            <button
                                onClick={() => setShowWhyNeededPopup(false)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Close popup"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-sm text-gray-700 space-y-3">
                            <p>
                                Your Permanent Account Number (PAN) is a mandatory document for KYC (Know Your Customer) verification as per regulatory guidelines.
                            </p>
                            <p>
                                We use it to verify your identity and to check your credit history with credit bureaus. This helps us assess your loan eligibility and offer you the best possible terms.
                            </p>
                            <p>
                                Rest assured, your information is kept secure and confidential.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PANInfo;