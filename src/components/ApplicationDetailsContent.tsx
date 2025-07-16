
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { config } from '../config/environment';
import { toast } from 'sonner';
import { ApplicationStepper } from './ApplicationStepper/ApplicationStepper';
import { StatusBadge } from './ApplicationStatus/StatusBadge';
import { StatusMessage } from './ApplicationStatus/StatusMessage';
import { useApplicationSteps } from '../hooks/useApplicationSteps';
import { formatIndianNumber, formatDate } from '../lib/utils';

const ApplicationDetailsContent = () => {
  const [applicationData, setApplicationData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const [openDocPreview, setIsOpenDocPreview] = useState(false);
  const [storeDoc, setIsStoreDoc] = useState<any>(null);

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
    const firstUncompletedStepIndex = steps.findIndex(step => !step.completed);

    if (firstUncompletedStepIndex === -1 && steps.length > 0) {
      setCurrentStep(steps.length);
    } else {
      setCurrentStep(firstUncompletedStepIndex !== -1 ? firstUncompletedStepIndex : 0);
    }
  }, [steps, navigate]);

  const handleDigoDocsView = (label: any, doc: any) => {
    // console.log(doc)
    setIsOpenDocPreview(true);
    setIsStoreDoc({ label: label, url: doc })
  }

  const closeDocumentPreview = () => {
    setIsOpenDocPreview(false);
    setIsStoreDoc(null)
  }

  return (
    <div className="min-h-full bg-white flex flex-col h-full">
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b bg-white h-[8%]">
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

      <div className={`flex-1 flex items-start justify-center bg-gray-100 p-4 ${loading ? 'items-center' : 'items-center'} h-[92%] overflow-y-auto scrollContainer`}>
        <div className="w-full h-full">
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
              <div className="flex gap-2 w-full h-full">
                <div className="leftPanel w-[70%] h-full flex flex-col">
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-primary/5 p-4 rounded-lg">
                          <div className="text-sm font-normal text-gray-500 mb-1">Application ID</div>
                          <div className="text-sm font-medium text-primary">{applicationData?.displayId || 'N/A'}</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-xs font-normal text-gray-500 mb-1">Applied Date</div>
                          <div className="text-sm font-medium text-blue-700">{formatDate(applicationData?.createdAt)}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-xs font-normal text-gray-500 mb-1">Transfered Amount</div>
                          <div className="text-sm font-medium text-green-700">₹{formatIndianNumber(applicationData?.totalTransferredAmount || 0)}</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="text-sm font-normal text-gray-500 mb-1">CIBIL</div>
                          <div className="text-md font-medium text-orange-700">{applicationData?.cibil || 0}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bottomSection bg-white rounded-lg shadow-sm p-6">
                      <ApplicationStepper
                        steps={steps}
                        currentStep={currentStep}
                        applicationStatus={applicationData?.applicationStatus}
                      />
                      <StatusMessage
                        applicationStatus={applicationData?.applicationStatus}
                        approvedAmount={applicationData?.loanAmount}
                        remarks={applicationData?.remarks}
                      />
                    </div>
                  </div>
                </div>
                <div className="rightPanel w-[30%] h-full">
                  <div className="bg-white rounded-lg shadow-sm p-4 w-full mb-1">
                    <div className="loanAmountCalculation">
                      <h2 className="text-primary">Calculation</h2>
                    </div>
                    <div className="border-b mt-2"></div>
                    <div className='flex justify-between items-center mt-4'>
                      <div className="text-sm font-normal text-gray-700">Loan Amount</div>
                      <div className="text-sm font-medium text-orange-700">₹ {formatIndianNumber(applicationData?.loanAmount) || 'N/A'}</div>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                      <div className="text-sm font-normal text-gray-700">Loan Interest ({applicationData?.loanConfig?.loanInterestPercentage}% per day)</div>
                      <div className="text-sm font-medium text-orange-700">₹ {formatIndianNumber(applicationData?.loanConfig?.loanInterest) || 'N/A'}</div>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                      <div className="text-sm font-normal text-gray-700">Processing Fee ({applicationData?.loanConfig?.processingFeePercentage}%)</div>
                      <div className="text-sm font-medium text-orange-700">₹ {formatIndianNumber(applicationData?.loanConfig?.processingFee) || 'N/A'}</div>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                      <div className="text-sm font-normal text-gray-700">Gst On Processing Fee ({applicationData?.loanConfig?.gstOnProcessingFeePercentage}%)</div>
                      <div className="text-sm font-medium text-orange-700">₹ {formatIndianNumber(applicationData?.loanConfig?.gstOnProcessingFee) || 'N/A'}</div>
                    </div>
                    <div className="border-b mt-8"></div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-md font-medium text-gray-700">Total Repayment Amount</div>
                      <div className="text-md font-medium text-green-700">₹ {formatIndianNumber(applicationData?.totalRepaymentAmount) || 'N/A'}</div>
                    </div>
                  </div>
                  {
                    applicationData?.digioDocuments &&
                    <div className="bg-white rounded-lg shadow-sm p-4 w-full">
                      <div className="loanAmountCalculation">
                        <h2 className="text-primary">Digio Documents</h2>
                      </div>
                      <div className="border-b mt-2"></div>
                      <div className="mt-2">
                        {
                          Object.entries(applicationData?.digioDocuments).map(([label, url], index) => (
                            <div className="mb-3" key={index}>
                              <div className="flex justify-between items-center">
                                <div className="text-sm">{label}</div>
                                <Eye className="text-primary cursor-pointer" onClick={() => handleDigoDocsView(label, url)} />
                              </div>
                              <div className="border-b mt-2"></div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  }

                  {/* document preview section */}
                  {
                    openDocPreview && storeDoc && (
                      <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                        onClick={closeDocumentPreview}
                      >
                        <div
                          className="relative bg-white p-4 rounded-lg shadow-lg max-w-lg w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="titleSection flex items-center justify-between">
                            <div className="text-md text-medium">
                              {storeDoc.label}
                            </div>
                            <div className="closeIcon cursor-pointer">
                              <X className="w-5 h-5" onClick={closeDocumentPreview} />
                            </div>
                          </div>
                          <div className="border-b mt-2"></div>
                          <div className="mt-3">
                            <iframe
                              src={storeDoc.url}
                              width="100%"
                              height="500px"
                              className="border"
                              title={`preview-${storeDoc.label}`}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsContent;
