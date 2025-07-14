
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
    const firstUncompletedStepIndex = steps.findIndex(step => !step.completed);

    if (firstUncompletedStepIndex === -1 && steps.length > 0) {
      setCurrentStep(steps.length);
    } else {
      setCurrentStep(firstUncompletedStepIndex !== -1 ? firstUncompletedStepIndex : 0);
    }
  }, [steps, navigate]);

  const formatIndianNumber = (value: number | string) => {
    if (!value) return '0';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN').format(numValue);
  };

  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/my-application')} 
            className="text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
            aria-label="Back to applications"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Loan Application Details</h1>
        </div>
        <div className="flex items-center gap-4">
          {applicationData?.applicationStatus && (
            <StatusBadge status={applicationData.applicationStatus} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">Loading application details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">Error: {error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Application Overview */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Application ID</h3>
                    <p className="text-lg font-semibold text-primary">{applicationData?.displayId || 'N/A'}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Loan Amount</h3>
                    <p className="text-lg font-semibold text-green-700">₹{formatIndianNumber(applicationData?.loanAmount || 0)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Applied Date</h3>
                    <p className="text-lg font-semibold text-blue-700">{formatDate(applicationData?.createdAt)}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Approved Amount</h3>
                    <p className="text-lg font-semibold text-orange-700">₹{formatIndianNumber(applicationData?.approvedAmount || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Borrower Information */}
              {applicationData?.borrowerProfileData && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Borrower Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                      <p className="text-base font-medium text-gray-900">{applicationData.borrowerProfileData.name || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Mobile Number</h3>
                      <p className="text-base text-gray-900">{applicationData.borrowerProfileData.mobileNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
                      <p className="text-base text-gray-900">{formatDate(applicationData.borrowerProfileData.dob)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Gender</h3>
                      <p className="text-base text-gray-900">{toTitleCase(applicationData.borrowerProfileData.gender || '')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Father's Name</h3>
                      <p className="text-base text-gray-900">{applicationData.borrowerProfileData.fathersName || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">CIBIL Score</h3>
                      <p className="text-base font-semibold text-blue-600">{applicationData.borrowerProfileData.borrowerCibilData?.score || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Address Information */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Current Address</h3>
                      <p className="text-base text-gray-900 break-words">{applicationData.borrowerProfileData.currentAddress?.address || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Permanent Address</h3>
                      <p className="text-base text-gray-900 break-words">{applicationData.borrowerProfileData.permanentAddress?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Employment Details */}
              {applicationData?.employmentDetails && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Employment Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Employment Type</h3>
                      <p className="text-base text-gray-900">{toTitleCase(applicationData.employmentDetails.employmentType?.replace(/_/g, ' ') || '')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Company Name</h3>
                      <p className="text-base text-gray-900">{applicationData.employmentDetails.companyName || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Work Experience</h3>
                      <p className="text-base text-gray-900">{applicationData.employmentDetails.workExperience || 'N/A'} years</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Take Home Salary</h3>
                      <p className="text-base font-semibold text-green-600">₹{formatIndianNumber(applicationData.employmentDetails.takeHomeSalary || 0)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Gross Salary</h3>
                      <p className="text-base text-gray-900">₹{formatIndianNumber(applicationData.employmentDetails.grossSalary || 0)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Office Address</h3>
                      <p className="text-base text-gray-900 break-words">{applicationData.employmentDetails.officeAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {applicationData?.bankDetails && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Bank Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Bank Name</h3>
                      <p className="text-base text-gray-900">{applicationData.bankDetails.bankName || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Account Number</h3>
                      <p className="text-base text-gray-900">{applicationData.bankDetails.accountNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">IFSC Code</h3>
                      <p className="text-base text-gray-900">{applicationData.bankDetails.ifscCode || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Account Holder Name</h3>
                      <p className="text-base text-gray-900">{applicationData.bankDetails.accountHolderName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Status */}
              {applicationData?.loanDocuments && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Document Status</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {applicationData.loanDocuments.map((doc: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-900">{toTitleCase(doc.documentType?.replace(/_/g, ' ') || '')}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        {doc.documentNumber && (
                          <p className="text-sm text-gray-600">Number: {doc.documentNumber}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Stepper - Positioned at Bottom */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Progress</h2>
                <ApplicationStepper 
                  steps={steps}
                  currentStep={currentStep}
                  applicationStatus={applicationData?.applicationStatus}
                />
                <div className="mt-8">
                  <StatusMessage 
                    applicationStatus={applicationData?.applicationStatus}
                    approvedAmount={applicationData?.approvedAmount}
                    remarks={applicationData?.remarks}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsContent;
