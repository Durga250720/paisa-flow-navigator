import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DigiKycButton from './DigiKycButton.tsx';
import styles from '../pages-styles/KycVerificationPage.module.css';

const KycVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve the userId passed from the OTP page
    const userId = location.state?.userId;

    // Handler for successful KYC verification
    const handleKycSuccess = (digioDocId: string) => {
        console.log(`KYC process successful with document ID: ${digioDocId}`);
        // On successful KYC, navigate the user to the KYCVerified success screen
        navigate('/kyc-verified');
    };

    if (!userId) {
        // A robust check in case the user lands here without the necessary data
        return (
            <div className={styles.container}>
                <p style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>
                    Error: User session is invalid. Please start the process again.
                </p>
            </div>
        );
    }

    return (
        <div className={`${styles.container} block`}>
            <div className={styles.navbarWrapper}>
                <Navbar />
            </div>

            <div className={`${styles.mainContainer}`}>
                {/* Left Panel: The consistent hero image */}
                <div className={styles.leftPanel}>
                    <div className={styles.imageContainer}>
                        {/* You can use the same image or a more relevant one for security */}
                        <img
                            src="/lovable-uploads/8f598013-7362-496b-96a6-8a285565f544.png"
                            alt="Secure identity verification"
                            className={styles.heroImage}
                        />
                    </div>
                </div>

                {/* Right Panel: The interactive KYC content */}
                <div className={styles.rightPanel}>
                    <div className={styles.formContainer}>
                        <h1 className={styles.heading}>Identity Verification</h1>
                        <p className={styles.subtitle}>
                            To secure your account and unlock all features, we need to verify your
                            Aadhaar and PAN details through the secure DigiLocker process.
                        </p>

                        {/* The DigiKycButton component fits perfectly here as the main action */}
                        <DigiKycButton userId={userId} onSuccess={handleKycSuccess} />

                        <p className={styles.footerText}>
                            You will be redirected to a secure portal powered by Digio.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KycVerificationPage;