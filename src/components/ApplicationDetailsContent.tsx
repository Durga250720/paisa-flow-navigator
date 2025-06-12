
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { config } from '../config/environment';
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';


const ApplicationDetailsContent = () => {
  const [applicationData, setApplicationData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [lineWidthPx, setLineWidthPx] = useState(0);
  const navigate = useNavigate();
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const circleDiameterRem = 4;

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

  const steps = useMemo(() => {
    const step1Completed = true;
    const step2Completed = applicationData?.loanProgress.AADHAAR_VERIFIED;
    const step3Completed = applicationData?.loanProgress.PAN_VERIFIED;
    const step4Completed = applicationData?.loanDocuments?.length ? applicationData.loanDocuments.every(doc => doc.verified === true) : false;
    const step5Completed = applicationData?.loanProgress.KYC_DONE;
    const step6Completed = applicationData?.loanProgress.ELIGIBILITY_PASSED
    const step7Completed = applicationData?.applicationStatus === 'APPROVED';

    return [
      { id: 1, label: 'Profile Creation', completed: step1Completed },
      { id: 2, label: 'Aadhar Verified', completed: step2Completed },
      { id: 3, label: 'Pan Verified', completed: step3Completed },
      { id: 4, label: 'Documents Uploaded', completed: step4Completed },
      { id: 5, label: applicationData?.applicationStatus === 'APPROVED' ? 'KYC Verified !' : 'KYC Verification', completed: step5Completed },
      { id: 6, label: applicationData?.applicationStatus === 'APPROVED' ? 'Credit Check Completed' : 'Credit Check in Progress', completed: step6Completed },
      { id: 7, label: applicationData?.applicationStatus === 'APPROVED' ? 'Loan Approved' : 'Loan Approval', completed: step7Completed }
    ];
  }, [applicationData]);

  useEffect(() => {
    const lastCompletedStep = steps.slice().reverse().find(step => step.completed);
    setCurrentStep(lastCompletedStep ? lastCompletedStep.id : 0);
  }, [steps, navigate]);

  useEffect(() => {
    const calculateLineWidth = () => {
      if (stepsContainerRef.current && steps.length > 1) {
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize || '16'); // Default to 16px if not found
        const circleDiaPx = circleDiameterRem * rootFontSize;
        const containerClientWidth = stepsContainerRef.current.clientWidth;
        const calculatedLineWidth = (containerClientWidth - (steps.length * circleDiaPx)) / (steps.length - 1);
        setLineWidthPx(calculatedLineWidth > 0 ? calculatedLineWidth : 0);
      } else {
        setLineWidthPx(0);
      }
    };

    // Calculate initially (once data is loaded and ref is available) and on resize
    if (!loading && applicationData) {
      calculateLineWidth();
    }

    window.addEventListener('resize', calculateLineWidth);
    return () => {
      window.removeEventListener('resize', calculateLineWidth);
    };
  }, [steps, loading, applicationData, circleDiameterRem]);


  const getStatusClasses = (status: any) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'disbursed':
        return 'bg-blue-100 text-blue-800';
      case 'defaulted':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  

  return (
    <div className="min-h-full bg-white flex flex-col">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white">
        <h1 className="text-lg font-medium text-gray-900">Your Loan Application</h1>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium 
            ${`${getStatusClasses(applicationData?.applicationStatus)}`}`}>
            {applicationData?.applicationStatus === 'APPROVED' ? '✓ Approved' : ''}
            {applicationData?.applicationStatus === 'PENDING' ? '⏳ Pending Approval' : ''}
            {applicationData?.applicationStatus === 'REJECTED' ? '✕ Rejected' : ''}
            {applicationData?.applicationStatus === 'DISBURSED' ? '💸 Disbursed' : ''}
            {applicationData?.applicationStatus === 'DEFAULTED' ? '⚠️ Defaulted' : ''}
          </span>
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
              {/* <div ref={stepsContainerRef} className="flex items-center justify-between mb-16 px-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step.completed
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    <span className={`mt-3 text-xs text-center max-w-[160px] leading-tight ${step.completed ? 'text-gray-900 font-normal' : 'text-gray-500'
                      }`}>
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute top-8 left-16 h-0.5 transition-all duration-300 ${steps[index + 1].completed ? 'bg-primary' : 'bg-gray-300'
                          }`}
                        style={{
                          left: `calc(50% + ${circleDiameterRem / 2}rem)`,
                          width: `${lineWidthPx}px`
                        }}
                      />
                    )}
                  </div>
                ))}
              </div> */}
              {/* <Box sx={{ width: '100%' }}>
                <Stepper activeStep={1} alternativeLabel>
                  {steps.map((step) => (
                    <Step key={step.id}>
                      <StepLabel>{step.label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box> */}
              <Stack sx={{ width: '100%' }} spacing={4}>
                <Stepper alternativeLabel connector={<QontoConnector />}>
                  {steps.map((step,index) => (
                    <Step key={step.id} active={step.completed}>
                      <StepLabel StepIconComponent={QontoStepIcon} className='text-xs'>{step.label}</StepLabel>
                    </Step>
                  ))}

                </Stepper>
              </Stack>
              <div className="text-center mt-10">
                {
                  applicationData?.applicationStatus === 'APPROVED' ?
                    <div className='mb-4 flex items-center justify-center'>
                      <img src="/docsImages/flowers.gif" alt="" />
                    </div>
                    : ''
                }
                <h2 className="text-xl font-mediyum mb-4 text-gray-900">
                  {applicationData?.applicationStatus === 'APPROVED'
                    ? `Congratulations! ₹ ${applicationData?.approvedAmount} loan is approved.`
                    : "We've received your loan request and are reviewing your eligibility."
                  }
                </h2>
                <p className="text-gray-600 text-sm">
                  {applicationData?.applicationStatus === 'APPROVED'
                    ? 'You can proceed to the next step.'
                    : "We'll notify you as soon as your application is ready for disbursement."
                  }
                </p>
                {/* <div className='mt-3'>
                  <button className='text-white bg-primary text-sm px-2 py-3'>
                    Disburse
                  </button>
                </div> */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22, // Adjusted: half of the icon height (45px / 2 = 22.5px, using 22px)
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#784af4',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#784af4',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
    ...theme.applyStyles('dark', {
      borderColor: theme.palette.grey[800],
    }),
  },
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 45,
    width: 45,
    alignItems: 'center',
    justifyContent: 'center',
    ...(ownerState.active && {
      color: '#784af4',
    }),
    '& .QontoStepIcon-completedIcon': {
      color: '#784af4',
      zIndex: 1,
      fontSize: '1.75rem', // Approx 28px, ensures the icon has a defined size
    },
    '& .QontoStepIcon-circle': {
      width: '100%', 
      height: '100%',
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    },
  }),
);

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;
  return (
    <QontoStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? (
        <CheckCircle className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

 

export default ApplicationDetailsContent;
