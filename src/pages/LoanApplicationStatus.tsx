
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const LoanApplicationStatus = () => {
  const [currentStep, setCurrentStep] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const employmentInfoCompleted = localStorage.getItem('employmentInfoCompleted');
    
    if (!authToken || !employmentInfoCompleted) {
      navigate('/');
      return;
    }

    // Simulate progression through steps
    const timer = setTimeout(() => {
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1);
      } else {
        navigate('/congratulations');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentStep, navigate]);

  const steps = [
    { id: 1, label: 'Profile Creation', completed: true },
    { id: 2, label: 'Documents Uploaded', completed: true },
    { id: 3, label: 'KYC Verified !', completed: true },
    { id: 4, label: 'Credit Check in Progress', completed: currentStep >= 4 },
    { id: 5, label: 'Loan Approval', completed: currentStep >= 5 }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-lg font-medium">Your Loan Application</h1>
        <div className="flex items-center gap-2">
          <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm">Pending Approval</span>
          <button className="text-blue-600 text-sm">Need Help?</button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? <CheckCircle className="w-6 h-6" /> : step.id}
                </div>
                <span className={`mt-2 text-sm text-center ${
                  step.completed ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-12 w-24 h-0.5 ${
                    steps[index + 1].completed ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              We've received your loan request and are reviewing your eligibility.
            </h2>
            <p className="text-gray-600">
              We'll notify you as soon as your application is ready for disbursement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationStatus;
