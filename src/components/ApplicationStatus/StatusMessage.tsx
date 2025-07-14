
import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface StatusMessageProps {
  applicationStatus: string;
  approvedAmount?: number;
  remarks?: string;
}

const animationMap: { [key: string]: () => Promise<any> } = {
  APPROVED_WITH_CONDITION : () => import('../../../public/animations/success.json'),
  CLOSED : () => import('../../../public/animations/success.json'),
  APPROVED: () => import('../../../public/animations/success.json'),
  REJECTED: () => import('../../../public/animations/rejected.json'),
  PENDING: () => import('../../../public/animations/pending.json'),
  DEFAULTED: () => import('../../../public/animations/defulted.json'),
  DISBURSED: () => import('../../../public/animations/disbursed.json')
};


const DEFAULT_ANIMATION_KEY = 'PENDING'; 
const defaultAnimationLoader = () => import('../../../public/animations/pending.json');

export const StatusMessage: React.FC<StatusMessageProps> = ({ 
  applicationStatus, 
  approvedAmount, 
  remarks 
}) => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    const loadAnimation = async () => {
      const statusKey = applicationStatus?.toUpperCase();
      let loader = animationMap[statusKey];

      if (!loader) {
        console.warn(`Animation not found for status: "${applicationStatus}". Falling back to default animation (${DEFAULT_ANIMATION_KEY}).`);
        loader = animationMap[DEFAULT_ANIMATION_KEY] || defaultAnimationLoader;
      }

      try {
        const module = await loader();
        setAnimationData(module.default);
      } catch (error) {
        console.error(`Error loading animation for status: "${applicationStatus}" (path: ${statusKey?.toLowerCase()}.json). Falling back to default.`, error);
        const fallbackModule = await (animationMap[DEFAULT_ANIMATION_KEY] || defaultAnimationLoader)();
        setAnimationData(fallbackModule.default);
      }
    };

    if (applicationStatus) {
      loadAnimation();
    } else {
      // Handle case where applicationStatus is not provided, maybe load a default or clear animation
      setAnimationData(null); // Or load a specific "unknown" state animation
    }
  }, [applicationStatus]);

  const getHeadingMessage = () => {
    if (applicationStatus === 'APPROVED' || applicationStatus === 'APPROVED_WITH_CONDITION' || applicationStatus === 'CLOSED') {
      return `Congratulations! ₹ ${approvedAmount} loan is approved.`;
    } else if (applicationStatus === 'REJECTED') {
      return "Sorry! Your application is rejected.";
    } else {
      return "We've received your loan request and are reviewing your eligibility.";
    }
  };

  const getSubMessage = () => {
    if (applicationStatus === 'APPROVED' || applicationStatus === 'APPROVED_WITH_CONDITION') {
      return 'You can proceed to the next step.';
    } else if (applicationStatus === 'REJECTED') {
      return remarks || 'Your application was rejected.';
    } else {
      return "We'll notify you as soon as your application is ready for disbursement.";
    }
  };

  return (
    <div className="text-center mt-10">
      {animationData && (
        <div className="mb-4 mx-auto w-20 h-20 md:w-20 md:h-20"> {/* Adjust size as needed */}
          <Lottie animationData={animationData} loop={true} autoPlay={true} />
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
