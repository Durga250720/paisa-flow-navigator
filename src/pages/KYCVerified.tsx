
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle } from 'lucide-react';

const KYCVerified = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const kycVerified = localStorage.getItem('kycVerified');
    
    if (!authToken || !kycVerified) {
      navigate('/');
    }
  }, [navigate]);

  const handleApplyLoan = () => {
    navigate('/bank-info');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-lg font-semibold text-green-500">KYC Verified !</span>
            </div>
            
            <p className="text-gray-600">
              Congrats! Your KYC Got Verified, You can Apply for loan
            </p>
          </div>

          <button 
            onClick={handleApplyLoan}
            className="w-full bg-primary text-white font-medium py-3 px-6 rounded-lg"
          >
            Apply Laon
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCVerified;
