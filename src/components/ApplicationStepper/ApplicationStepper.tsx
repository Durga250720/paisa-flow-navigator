
import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stack from '@mui/material/Stack';
import { QontoConnector } from './QontoConnector';
import { QontoStepIcon } from './QontoStepIcon';

interface ApplicationStepperProps {
  steps: Array<{
    id: number;
    label: string;
    completed: boolean;
  }>;
  currentStep: number;
  applicationStatus: string;
}

export const ApplicationStepper: React.FC<ApplicationStepperProps> = ({ 
  steps, 
  currentStep, 
  applicationStatus 
}) => {
  return (
    <Stack sx={{ width: '100%' }} spacing={4}>
      <Stepper 
        alternativeLabel 
        activeStep={currentStep} 
        connector={<QontoConnector />}
      >
        {steps.map((step, index) => {
          const isIncomplete = !step.completed;
          const isRejectedFinalStep = step.id === 7 && applicationStatus?.toUpperCase() === 'REJECTED';
          
          return (
            <Step
              key={step.id}
              completed={step.completed}
            >
              <StepLabel 
                StepIconComponent={(props) => (
                  <QontoStepIcon 
                    {...props} 
                    isIncomplete={isIncomplete && !isRejectedFinalStep} 
                    isRejected={isRejectedFinalStep}
                  />
                )} 
                className="text-xs"
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: step.completed ? '#1f2937' : '#6b7280',
                    marginTop: '8px'
                  },
                  '& .MuiStepLabel-label.Mui-active': {
                    color: '#784af4',
                    fontWeight: 600
                  },
                  '& .MuiStepLabel-label.Mui-completed': {
                    color: '#059669',
                    fontWeight: 600
                  }
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Stack>
  );
};
