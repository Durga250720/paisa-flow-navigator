import { useState, useEffect } from 'react';

// Define the possible status values as a specific type.
// This prevents typos and makes the hook's return value predictable.
type SdkStatus = 'loading' | 'ready' | 'error';

// Define the SDK script URL as a constant
const SCRIPT_URL = 'https://ext-gateway.digio.in/sdk/v11/digio.js';

// To make TypeScript aware of the Digio library on the global window object,
// we extend the global Window interface. This is a clean, type-safe approach.
declare global {
    interface Window {
        // We can use 'any' for simplicity, or define a more specific type for the Digio class
        Digio: new (options) => {
            init: () => void;
            submit: (requestId: string, identifier: string, tokenId: string) => void;
            cancel: () => void;
        };
    }
}

/**
 * A React hook to manage the loading and status of the Digio Web SDK.
 * @returns {SdkStatus} The current status of the SDK: 'loading', 'ready', or 'error'.
 */
export const useDigioSDK = (): SdkStatus => {
    // Explicitly type the state using our SdkStatus type
    const [status, setStatus] = useState<SdkStatus>('loading');

    useEffect(() => {
        // Check if the script tag already exists in the document
        if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
            // If the script tag exists, check if the Digio object is available on window.
            // If it is, the SDK is ready. If not, the 'load' event listener below will handle it.
            if (window.Digio) {
                setStatus('ready');
            }
            return;
        }

        // If the script doesn't exist, create and append it to the document
        const script = document.createElement('script');
        script.src = SCRIPT_URL;
        script.async = true;

        const handleLoad = () => {
            console.log('Digio SDK v11 loaded successfully.');
            setStatus('ready');
        };

        const handleError = () => {
            console.error('Failed to load Digio SDK v11.');
            setStatus('error');
        };

        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);

        document.body.appendChild(script);

        // Cleanup function to remove event listeners when the component unmounts
        return () => {
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
        };
    }, []); // The empty dependency array ensures this effect runs only once

    return status;
};