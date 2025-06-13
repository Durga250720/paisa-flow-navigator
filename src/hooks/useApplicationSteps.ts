
import { useMemo } from 'react';

export const useApplicationSteps = (applicationData: any) => {
  return useMemo(() => {
    const step1Completed = true;
    const step2Completed = applicationData?.loanProgress.AADHAAR_VERIFIED;
    const step3Completed = applicationData?.loanProgress.PAN_VERIFIED;
    const step4Completed = applicationData?.applicationStatus === 'REJECTED' // If rejected, step 4 is not considered complete for visual flow
      ? false
      : (applicationData?.loanDocuments ? applicationData.loanDocuments.every(doc => doc.verified === true) : false);
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
};
