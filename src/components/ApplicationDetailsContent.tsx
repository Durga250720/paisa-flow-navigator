
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { config } from '../config/environment';
import { toast } from 'sonner';
import { ApplicationStepper } from './ApplicationStepper/ApplicationStepper';
import { StatusBadge } from './ApplicationStatus/StatusBadge';
import { StatusMessage } from './ApplicationStatus/StatusMessage';
import { useApplicationSteps } from '../hooks/useApplicationSteps';

const ApplicationDetailsContent = () => {
  const [applicationData, setApplicationData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = useApplicationSteps(applicationData);

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
        const response = await fetch(`${config.baseURL}loan-application/${id}/details`, {
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

  useEffect(() => {
    // Determine the active step: it's the 0-based index of the first step that is not completed.
    // If all steps are completed, activeStep should be steps.length.
    const firstUncompletedStepIndex = steps.findIndex(step => !step.completed);

    if (firstUncompletedStepIndex === -1 && steps.length > 0) {
      setCurrentStep(steps.length); // All steps are completed
    } else {
      setCurrentStep(firstUncompletedStepIndex !== -1 ? firstUncompletedStepIndex : 0); // Set to first uncompleted or 0 if no steps/error
    }
  }, [steps, navigate]);

  return (
    <div className="min-h-full bg-white flex flex-col">
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/my-application')} 
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Back to applications"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-medium text-gray-900">Your Loan Application</h1>
        </div>
        <div className="flex items-center gap-4">
          {applicationData?.applicationStatus && (
            <StatusBadge status={applicationData.applicationStatus} />
          )}
        </div>
      </div>

      <div className={`flex-1 flex items-start justify-center p-6 ${loading ? 'items-center' : ''}`}>
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
              <ApplicationStepper 
                steps={steps}
                currentStep={currentStep}
                applicationStatus={applicationData?.applicationStatus}
              />
              <StatusMessage 
                applicationStatus={applicationData?.applicationStatus}
                approvedAmount={applicationData?.approvedAmount}
                remarks={applicationData?.remarks}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsContent;
