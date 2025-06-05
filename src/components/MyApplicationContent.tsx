
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import styles from './styles/MyApplication.module.css';
import { config } from '../config/environment'; // Assuming config is here for baseURL
import { toast } from 'sonner';

interface KycDoc {
  // Define the structure of your kycDoc object
  // Example:
  documentName?: string;
  verified?: boolean;
  // Add other properties as needed
}

interface LoanApplicationData {
  kycDocs?: KycDoc[];
  applicationStatus?: string;
  // Add other properties from the API response as needed
}

const MyApplicationContent = () => {
  const [applicationData, setApplicationData] = useState<LoanApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // currentStep will now reflect the ID of the last completed step or a relevant active step
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
            // Include Authorization header if your API requires it
            // 'Authorization': `Bearer ${authToken}` 
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
    const step1Completed = true; // Profile creation always completed
    const step2Completed = applicationData?.kycDocs?.length ? applicationData.kycDocs.every(doc => doc.verified === true) : false;
    const step3Completed = step2Completed; // KYC verified if documents are uploaded and verified
    const step4Completed = step2Completed && step3Completed; // Credit check if KYC is done
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
    // Update currentStep based on the completed steps
    const lastCompletedStep = steps.slice().reverse().find(step => step.completed);
    setCurrentStep(lastCompletedStep ? lastCompletedStep.id : 0);

    // Optional: Navigate if loan is approved
    if (steps.find(step => step.id === 5 && step.completed)) {
      // navigate('/congratulations'); // Or any other relevant page
    }
  }, [steps, navigate]);

  return (
    <div className={`${styles.mainContainer} "min-h-screen flex flex-col`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-lg font-medium text-primary">Your Loan Application</h1>
        <div className="flex items-center gap-2">
          <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm">Pending Approval</span>
          {/* <button className="text-blue-600 text-sm">Need Help?</button> */}
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-6 h-[90%]">
        <div className="w-full max-w-4xl">
          {loading ? (
            <div className="text-center py-10">Loading application status...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">Error: {error}</div>
          ) : (
            <>
              <div className="flex items-center w-full mb-12">
                {steps.flatMap((step, index) => {
                  const stepComponent = (
                    <div key={step.id} className="flex flex-col items-center relative z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step.completed ? <CheckCircle className="w-6 h-6" /> : step.id}
                      </div>
                      <span className={`mt-2 text-sm text-center ${
                        step.completed ? 'text-gray-900 font-medium' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );

                  if (index < steps.length - 1) {
                    const lineComponent = (
                      <div
                        key={`line-${index}`}
                        className={`flex-1 h-0.5 mx-2 ${
                          steps[index + 1].completed ? 'bg-primary' : 'bg-gray-200'
                        } relative z-0`}
                      />
                    );
                    return [stepComponent, lineComponent];
                  }
                  return [stepComponent];
                })}
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">
                  {applicationData?.applicationStatus === 'APPROVED' ? 'Congratulations! Your loan is approved.' : "We've received your loan request and are reviewing your eligibility."}
                </h2>
                <p className="text-gray-600">
                  {applicationData?.applicationStatus === 'APPROVED' ? 'You can proceed to the next step.' : "We'll notify you as soon as your application is ready for disbursement."}
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
