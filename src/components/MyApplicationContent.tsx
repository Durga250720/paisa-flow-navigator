
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import styles from './styles/MyApplication.module.css';
import { config } from '../config/environment';
import { toast } from 'sonner';

interface KycDoc {
  documentName?: string;
  verified?: boolean;
}

interface LoanApplicationData {
  kycDocs?: KycDoc[];
  applicationStatus?: string;
}

const MyApplicationContent = () => {
  const [applicationData, setApplicationData] = useState<LoanApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0); 
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
      return;
    }

    const fetchLoanApplicationDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${config.baseURL}loan-application/${authToken}/detail`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch loan application details.' }));
          throw new Error(errorData.message || 'Failed to fetch loan application details.');
        }
        const result = await response.json();
        setApplicationData(result.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanApplicationDetails();
  }, [navigate]);

  const steps = useMemo(() => {
    const step1Completed = true;
    const step2Completed = applicationData?.kycDocs?.length ? applicationData.kycDocs.every(doc => doc.verified === true) : false;
    const step3Completed = step2Completed;
    const step4Completed = step2Completed && step3Completed;
    const step5Completed = applicationData?.applicationStatus === 'APPROVED';

    return [
      { id: 1, label: 'Profile Creation', completed: step1Completed },
      { id: 2, label: 'Documents Uploaded', completed: step2Completed },
      { id: 3, label: 'KYC Verified !', completed: step3Completed },
      { id: 4, label: 'Credit Check in Progress', completed: step4Completed },
      { id: 5, label: 'Loan Approval', completed: step5Completed }
    ];
  }, [applicationData]);

  useEffect(() => {
    const lastCompletedStep = steps.slice().reverse().find(step => step.completed);
    setCurrentStep(lastCompletedStep ? lastCompletedStep.id : 0);

    if (steps.find(step => step.id === 5 && step.completed)) {
      // navigate('/congratulations');
    }
  }, [steps, navigate]);

  return (
    <div className="min-h-full bg-white flex flex-col">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white">
        <h1 className="text-xl font-medium text-gray-900">Your Loan Application</h1>
        <div className="flex items-center gap-4">
          <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
            Pending Approval
          </span>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            Need Help?
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">Loading application status...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">Error: {error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-16 px-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      step.completed 
                        ? 'bg-primary border-primary text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <span className="text-lg font-medium">{step.id}</span>
                      )}
                    </div>
                    <span className={`mt-3 text-sm text-center max-w-[120px] leading-tight ${
                      step.completed ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div 
                        className={`absolute top-8 left-16 h-0.5 transition-all duration-300 ${
                          steps[index + 1].completed ? 'bg-primary' : 'bg-gray-300'
                        }`}
                        style={{ width: 'calc(100vw / 5 - 80px)', maxWidth: '180px' }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                  {applicationData?.applicationStatus === 'APPROVED' 
                    ? 'Congratulations! Your loan is approved.' 
                    : "We've received your loan request and are reviewing your eligibility."
                  }
                </h2>
                <p className="text-gray-600 text-lg">
                  {applicationData?.applicationStatus === 'APPROVED' 
                    ? 'You can proceed to the next step.' 
                    : "We'll notify you as soon as your application is ready for disbursement."
                  }
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplicationContent;
