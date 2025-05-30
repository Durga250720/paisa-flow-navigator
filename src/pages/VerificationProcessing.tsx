
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
    <div className="main-layout">
      <Navbar />
      <div className="card-container mt-20 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-primary mb-4">We're verifying your documents</h1>
          <p className="text-gray-600">
            We're processing your information securely. You'll be notified once your verification is complete
          </p>
        </div>

        <button className="primary-button w-full">
          Apply Laon
        </button>
      </div>
    </div>
  );
};

export default VerificationProcessing;
