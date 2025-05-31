
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Congratulations = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      navigate('/');
    }
  }, [navigate]);

  const handleTransferNow = () => {
    navigate('/loan-details');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <div className="text-lg font-medium text-gray-600 mb-2">Paisa108</div>
        </div>

        <h1 className="text-2xl font-bold mb-8">
          Congrats! Your loan of ₹25,000 got approved
        </h1>

        <div className="space-y-4">
          <button
            onClick={handleTransferNow}
            className="w-full bg-primary text-white font-medium py-3 px-6 rounded-lg"
          >
            Transfer Now
          </button>

          <button
            onClick={handleGoToDashboard}
            className="text-primary font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Congratulations;
