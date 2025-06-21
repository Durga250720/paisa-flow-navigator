import React, { useEffect, useState } from 'react';
import styles from './styles/MyApplication.module.css';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/environment';
import { Eye, X, RefreshCw } from 'lucide-react'; // Added RefreshCw
import {toast } from 'react-toastify';
import EmploymentInfoForm from './forms/EmploymentInfoForm';
import IncomeVerificationForm from './forms/IncomeVerificationForm';
import BankInfoForm from './forms/BankInfoForm';
import InitialLoanAmountForm from './forms/InitialLoanAmountForm';
import { toTitleCase } from '../lib/utils';

const MyApplicationContent = () => {
  const [applicationData, setApplicationData] = useState<any | null>([]);
  const [loading, setLoading] = useState(true);
  // const authToken = localStorage.getItem('authToken'); // Defined inside useEffect or functions where needed
  const navigate = useNavigate();


  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
      return;
    }

    fetchApplications();
  }, [navigate])

  // --- New State for Apply Loan Modal ---
  const initialNewApplicationData = {
    borrowerId: localStorage.getItem('authToken') || "",
    amount: 0,
    purpose: "",
    employmentDetails: {
      employmentType: "", industry: "", companyName: "",
      designation: "", takeHomeSalary: 0, totalExperienceInMonths: 0
    },
    paySlips: { // For payload consistency
      documentType: "SALARY_SLIP",
      documentUrls: [],
    },
    bankStatement: { // For payload consistency
      documentType: "BANK_STATEMENT",
      documentUrls: [],
    },
    bankDetails: { // To collect data from BankInfoForm
      accountNumber: "", ifscCode: "", accountHolderName: "", bankName: ""
    }
    // addressDetail is in user's example payload but no form for it.
  };

  const [showApplyLoanModal, setShowApplyLoanModal] = useState(false);
  const [currentPopupStep, setCurrentPopupStep] = useState(0); // 0: closed, 1: Emp, 2: Income, 3: Bank, 4: Initial Loan, 5: Final Loan
  const [newApplicationData, setNewApplicationData] = useState<any>(initialNewApplicationData);
  const [modalLoading, setModalLoading] = useState(false);
  // --- End New State ---


  const fetchApplications = async () => {
    setLoading(true);
    const authToken = localStorage.getItem('authToken');
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
      console.log(result)
      setApplicationData(result.data)

      setLoading(false)
    } catch (error) {

      setLoading(false)
    }
    finally {

      setLoading(false)
    }
  }

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusClasses = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewApplicationDetails = (appId: any) => {
    navigate(`/admin/view-application/${appId}`)
  }

  // --- Modal Control Functions ---
  const handleOpenApplyModal = () => {
    setNewApplicationData({
      ...initialNewApplicationData,
      borrowerId: localStorage.getItem('authToken') || "", // Ensure borrowerId is fresh
    });
    setCurrentPopupStep(1);
    setShowApplyLoanModal(true);
  };

  const handleCloseApplyModal = () => {
    setShowApplyLoanModal(false);
    setCurrentPopupStep(0);
    // setNewApplicationData(initialNewApplicationData); // Reset data on close
  };

  const handleModalNext = (dataFromStep: any) => {
    setNewApplicationData(prev => ({ ...prev, ...dataFromStep }));
    setCurrentPopupStep(prev => prev + 1);
  };

  const handleModalPrevious = () => {
    if (currentPopupStep > 1) {
      setCurrentPopupStep(prev => prev - 1);
    }
  };

  const handleSubmitNewApplication = async (finalStepData?: any) => {
    setModalLoading(true);
    let payloadToSend = { ...newApplicationData };
    if (finalStepData) {
      payloadToSend = { ...payloadToSend, ...finalStepData };
    }

    try {
      const response = await fetch(`${config.baseURL}loan-application/apply/dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Application submission failed.' }));
        throw new Error(errorData.message || 'Application submission failed.');
      }

      const result = await response.json();
      toast.success("Application submitted successfully!");
      console.log("API Response:", result);
      handleCloseApplyModal();
      fetchApplications(); 
    } catch (error: any) {
      toast.error(`Submission Error: ${error.message}`);
      console.error("API Error:", error);
    } finally {
      setModalLoading(false);
    }
  };
  // --- End Modal Control Functions ---

  return (
    <div className="p-4 h-full w-full">
      <div className='flex justify-between items-center'>
        <div className="text-xl font-medium text-primary">Applied Applications</div>
        <div className="flex items-center gap-2">
          <div className="reload ">
            <button onClick={fetchApplications} className="p-2 rounded-md hover:bg-color-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 bg-gray-200" title="Reload Applications">
              <RefreshCw size={18} className="text-primary" />
            </button>
          </div>
          <div className={`${styles.applyBtn}`}>
            <button onClick={handleOpenApplyModal}>Apply</button>
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-lg shadow-sm overflow-hidden mt-2 ${loading ? 'flex justify-center items-center' : ''}`} style={{ height: '93%' }}>
        {
          !loading ?
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Application ID</th>
                    <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan Amount</th>
                    <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Created On</th>
                    {/* <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Due Amount</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Paid Amount</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Payment Source</th> */}
                    <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
                    <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applicationData.length > 0 ? (
                    applicationData.map((application) => (
                      <tr className="border-b" key={application.displayId}>
                        <td className="text-xs font-normal p-3">{application.displayId}</td>
                        <td className="text-xs font-normal p-3">₹ {application.loanAmount}</td>
                        <td className="text-xs font-normal p-3">{formatDate(application.updatedAt)}</td>
                        {/* <td className="text-xs font-normal p-3">₹15000</td>
                    <td className="text-xs font-normal p-3">₹15000</td> */}
                        {/* <td className="text-xs font-normal p-3">NACH (ICICI XXXX4532)</td> */}
                        <td className="text-xs font-normal p-3">
                          <span className={`${getStatusClasses(application.applicationStatus)} rounded text-xs font-normal p-2`}>
                            {application.applicationStatus === 'APPROVED' ? '✓ ' : ''}
                            {application.applicationStatus === 'PENDING' ? '⏳ ' : ''}
                            {application.applicationStatus === 'IN_REVIEW' ? '⏳ ' : ''}
                            {application.applicationStatus === 'REJECTED' ? '✕ ' : ''}
                            {toTitleCase(application.applicationStatus.split('_').join(' '))}
                          </span>
                        </td>
                        <td className="text-xs font-normal p-3">
                          <button className="p-2" onClick={() => handleViewApplicationDetails(application?.id)}>
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) :
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-500" style={{height:'75vh'}}>No application history found.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            :
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">Fetching applications...</p>
            </div>
        }
        {/* {loading && } */}
      </div>

      {/* Apply Loan Modal */}
      {showApplyLoanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000] p-2">
          <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col h-full">
            <div className="h-full w-full">
              <div className="flex justify-between items-center mb-2 border-b pb-2 h-[10%]">
                <h3 className="text-lg font-medium text-gray-800">
                  Apply for New Loan - Step {currentPopupStep} of 4
                </h3>
                <button onClick={handleCloseApplyModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto pr-2 h-[90%]">
                {currentPopupStep === 1 && (
                  <EmploymentInfoForm
                    initialData={newApplicationData.employmentDetails}
                    onNext={(data) => handleModalNext({ employmentDetails: data })}
                    onCancel={handleCloseApplyModal}
                    loading={modalLoading}
                  />
                )}
                {currentPopupStep === 2 && (
                  <IncomeVerificationForm
                    onNext={(data) => {
                      handleModalNext({
                        paySlips: { ...initialNewApplicationData.paySlips, documentUrls: data.paySlipsUrls },
                        bankStatement: { ...initialNewApplicationData.bankStatement, documentUrls: data.bankStatementUrl ? [data.bankStatementUrl] : [] }
                      });
                    }}
                    onPrevious={handleModalPrevious}
                    loading={modalLoading}
                  />
                )}
                {currentPopupStep === 3 && (
                  <BankInfoForm
                    initialData={newApplicationData.bankDetails}
                    onNext={(data) => handleModalNext({ bankDetails: data })}
                    onPrevious={handleModalPrevious}
                    loading={modalLoading}
                  />
                )}
                {currentPopupStep === 4 && (
                  <InitialLoanAmountForm
                    initialData={{ amount: newApplicationData.amount, purpose: newApplicationData.purpose }}
                    onSubmitApplication={(data) => handleSubmitNewApplication({ amount: data.amount, purpose: data.purpose })}
                    onPrevious={handleModalPrevious}
                    loading={modalLoading}
                  />
                )}
                {/* Step 5 (FinalLoanAmountForm) is removed as submission now happens at Step 4.
                    If you need a final review/adjustment step, you'd re-introduce it here. */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplicationContent;
