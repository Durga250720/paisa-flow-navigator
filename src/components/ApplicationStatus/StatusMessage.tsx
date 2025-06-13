
import React from 'react';

interface StatusMessageProps {
  applicationStatus: string;
  approvedAmount?: number;
  remarks?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ 
  applicationStatus, 
  approvedAmount, 
  remarks 
}) => {
  const getHeadingMessage = () => {
    if (applicationStatus === 'APPROVED') {
      return `Congratulations! ₹ ${approvedAmount} loan is approved.`;
    } else if (applicationStatus === 'REJECTED') {
      return "Sorry! Your application is rejected.";
    } else {
      return "We've received your loan request and are reviewing your eligibility.";
    }
  };

  const getSubMessage = () => {
    if (applicationStatus === 'APPROVED') {
      return 'You can proceed to the next step.';
    } else if (applicationStatus === 'REJECTED') {
      return remarks || 'Your application was rejected.';
    } else {
      return "We'll notify you as soon as your application is ready for disbursement.";
    }
  };

  return (
    <div className="text-center mt-10">
      {applicationStatus === 'APPROVED' && (
        <div className='mb-4 flex items-center justify-center'>
          <img src="/docsImages/flowers.gif" alt="" />
        </div>
      )}
      <h2 className="text-xl font-medium mb-4 text-gray-900">
        {getHeadingMessage()}
      </h2>
      <p className="text-gray-600 text-sm">
        {getSubMessage()}
      </p>
    </div>
  );
};
