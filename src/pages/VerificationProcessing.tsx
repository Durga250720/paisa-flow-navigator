
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const VerificationProcessing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const aadhaarVerified = localStorage.getItem('aadhaarVerified');
    
    if (!authToken || !aadhaarVerified) {
      navigate('/');
      return;
    }

    // Simulate processing time
    const timer = setTimeout(() => {
      localStorage.setItem('kycVerified', 'true');
      navigate('/kyc-verified');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="w-full max-w-md h-[85vh] border border-gray-200 shadow-lg rounded-lg p-8 flex flex-col justify-center text-center mx-6">
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-primary mb-4">We're verifying your documents</h1>
            <p className="text-gray-600">
              We're processing your information securely. You'll be notified once your verification is complete
            </p>
          </div>

          <button className="w-full bg-primary text-white font-medium py-3 px-6 rounded-lg">
            Apply Laon
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationProcessing;
