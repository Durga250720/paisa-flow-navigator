// src/components/DigiKycButton.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useDigioSDK } from '../hooks/userDigioSDK.tsx';

// --- Environment Variable Configuration ---
// This setup ensures the component automatically uses the correct endpoints
// and settings for development, staging, or production.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DIGIO_ENVIRONMENT = (import.meta.env.VITE_DIGIO_ENVIRONMENT || 'sandbox') as ('sandbox' | 'production');

// --- Type Definitions for Clarity and Safety ---
interface DigiKycButtonProps {
    userId: string;
    onSuccess: (digioDocId: string) => void;
    disabled?: boolean;
}

interface DigioCallbackResponse {
    digio_doc_id: string;
    error_code?: string;
    message: string;
    txn_id: string;
}

interface ApiResponse {
    data: {
        id: string;
        customer_identifier: string;
        access_token: {
            id: string;
        };
    };
}

const DigiKycButton: React.FC<DigiKycButtonProps> = ({ userId, onSuccess, disabled = false }) => {
    const sdkStatus = useDigioSDK();
    const [isKycLoading, setIsKycLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLaunchKyc = async () => {
        if (!userId) {
            setError('User ID is missing. Cannot initiate KYC.');
            return;
        }

        setIsKycLoading(true);
        setError(null);

        try {
            // 1. Configure Digio SDK with the correct environment
            const options = {
                environment: DIGIO_ENVIRONMENT,
                callback: (response: DigioCallbackResponse) => {
                    console.log('Digio SDK Callback Response:', response);
                    setIsKycLoading(false);

                    if (response.error_code) {
                        console.error(`KYC Failed. Error: ${response.error_code}, Message: ${response.message}`);
                        setError(`KYC process failed: ${response.message}`);
                    } else {
                        console.log(`KYC Success! Digio Doc ID: ${response.digio_doc_id}`);
                        onSuccess(response.digio_doc_id);
                    }
                },
                logo: 'https://your-logo-url.com/logo.png', // Replace with your actual logo URL
                theme: {
                    primaryColor: '#3A62A0',
                    secondaryColor: '#FFFFFF',
                },
            };

            // 2. Initialize the SDK popup
            const digio = new window.Digio(options);
            digio.init();

            // 3. Construct the full API URL and fetch the token
            const kycInitiateUrl = `${API_BASE_URL}kyc-docs/digi-kyc/${userId}/initiate`;
            console.log(`Initiating KYC via: ${kycInitiateUrl}`);

            const response = await axios.put<ApiResponse>(kycInitiateUrl);

            // 4. Extract data and submit to the Digio SDK
            const digioData = response.data.data;
            const requestId = digioData.id;
            const customerIdentifier = digioData.customer_identifier;
            const tokenId = digioData.access_token?.id;

            if (!requestId || !customerIdentifier || !tokenId) {
                throw new Error('Required IDs not found in the backend response.');
            }

            digio.submit(requestId, customerIdentifier, tokenId);

        } catch (err) {
            console.error('An error occurred during the KYC process:', err);
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : (err as Error).message;
            setError(`Failed to initiate KYC. ${errorMessage || 'An unknown error occurred.'}`);
            setIsKycLoading(false);
        }
    };

    const isButtonDisabled = sdkStatus !== 'ready' || isKycLoading || disabled;

    return (
        <div>
            {sdkStatus === 'loading' && <p className="text-center text-gray-500">Loading KYC SDK...</p>}
            {sdkStatus === 'error' && <p className="text-center text-red-500">Could not load KYC SDK. Please refresh.</p>}

            <button
                onClick={handleLaunchKyc}
                disabled={isButtonDisabled}
                style={{
                    width: '100%',
                    padding: '12px 24px',
                    fontSize: '14px',
                    cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                    backgroundColor: isButtonDisabled ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    opacity: isButtonDisabled ? 0.6 : 1,
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s ease-in-out',
                }}
            >
                {isKycLoading ? 'Processing...' : 'Proceed to KYC Verification'}
            </button>

            {error && <p className="text-center text-red-500 mt-4">Error: {error}</p>}
        </div>
    );
};

export default DigiKycButton;