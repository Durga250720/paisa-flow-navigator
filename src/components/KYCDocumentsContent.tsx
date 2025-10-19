import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdCard, Banknote, UserCheck, User, XCircle, Eye, Landmark, Home } from 'lucide-react';
import styles from './KYCDocumentsContent.module.css';
import { config } from '../config/environment';
import { formatIndianNumber, getCibilColor, toTitleCase } from '../lib/utils';
import axiosInstance from '@/lib/axiosInstance';
import { AxiosError } from 'axios';

// A reusable loader component that matches the theme
const Loader = ({ text = "Loading..." }: { text?: string }) => (
    <div className="flex flex-col items-center justify-center p-10 bg-gray-50 min-h-full">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
);

// --- TypeScript Interfaces ---
type DocumentStatus = 'Verified' | 'Unverified';

interface DocumentInfo {
  type: string;
  status: DocumentStatus;
  icon: React.ComponentType<{ className?: string }>;
  documentValue: string;
  docUrl: { url: string }[];
}

interface DocumentSource {
  verified: boolean;
  documentUrls: { url: string }[];
}

// --- Updated: Added bankDetailsAvailable ---
interface ProfileData {
  profileImage?: string;
  name?: string;
  displayId?: string;
  borrowerCibilData?: {
    score?: number;
  };
  employmentDetails?: {
    takeHomeSalary?: number;
    employmentType?: string;
  };
  dob?: string;
  gender?: string;
  fathersName?: string;
  currentAddress?: {
    address?: string;
  };
  permanentAddress?: {
    address?: string;
  };
  kycDocuments?: {
    documentType: 'PAN' | 'AADHAAR';
    verified: boolean;
    documentUrls: { url: string }[];
    documentNumber: string;
  }[];
  payslips?: DocumentSource;
  bankStatement?: DocumentSource;
  residenceProof?: DocumentSource;
  kycverified?: boolean;
  bankDetailsAvailable?: boolean; // New
}

// --- New: Interface for Bank Details ---
interface BankDetail {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscNumber: string;
  accountHolderName: string;
  default: boolean;
  verified: boolean;
}


const KYCDocumentsContent = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const [isDocPreviewOpen, setIsDocPreviewOpen] = useState(false);
  const [previewDocs, setPreviewDocs] = useState<DocumentInfo | null>(null);
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentInfo[]>([
    { type: "Aadhaar Verified", status: "Unverified", icon: UserCheck, documentValue: '', docUrl: [] },
    { type: "PAN Card", status: "Unverified", icon: IdCard, documentValue: '', docUrl: [] },
    { type: "Salary Slips", status: "Unverified", icon: Banknote, documentValue: '', docUrl: [] },
    { type: "Bank Statement", status: "Unverified", icon: Landmark, documentValue: '', docUrl: [] },
    { type: "Residence Proof", status: "Unverified", icon: Home, documentValue: '', docUrl: [] },
  ]);

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
    setIsPreviewOpen(true);
  };

  const handleDocumentPreview = (doc: DocumentInfo) => {
    setIsDocPreviewOpen(true);
    setPreviewDocs(doc);
  }

  const closeDocumentPreview = () => {
    setIsDocPreviewOpen(false);
    setPreviewDocs(null);
  }

  const closeImagePreview = () => {
    setIsPreviewOpen(false);
    setPreviewImageUrl(null);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get<{ data: ProfileData }>(`${config.baseURL}borrower/${authToken}/profile`);
        const profile = response.data.data;
        setProfileData(profile);

        if (profile?.bankDetailsAvailable) {
          const bankDetailsResponse = await axiosInstance.get<{ data: BankDetail[] }>(`${config.baseURL}bank-detail/${authToken}`);
          setBankDetails(bankDetailsResponse.data.data);
        }

        setDocuments(prevDocuments => prevDocuments.map(doc => {
          switch (doc.type) {
            case "PAN Card": {
              const panDoc = profile?.kycDocuments?.find(d => d.documentType === 'PAN');
              return { ...doc, status: panDoc?.verified ? 'Verified' : 'Unverified', docUrl: panDoc?.documentUrls || [], documentValue: panDoc?.documentNumber || '' };
            }
            case "Aadhaar Verified": {
              const aadhaarDoc = profile?.kycDocuments?.find(d => d.documentType === 'AADHAAR');
              return { ...doc, status: aadhaarDoc?.verified ? 'Verified' : 'Unverified', docUrl: aadhaarDoc?.documentUrls || [], documentValue: aadhaarDoc?.documentNumber || '' };
            }
            case "Salary Slips":
              return { ...doc, status: profile?.payslips?.verified ? 'Verified' : 'Unverified', docUrl: profile?.payslips?.documentUrls || [] };
            case "Bank Statement":
              return { ...doc, status: profile?.bankStatement?.verified ? 'Verified' : 'Unverified', docUrl: profile?.bankStatement?.documentUrls || [] };
            case "Residence Proof":
              return { ...doc, status: profile?.residenceProof?.verified ? 'Verified' : 'Unverified', docUrl: profile?.residenceProof?.documentUrls || [] };
            default:
              return doc;
          }
        }));

      } catch (err) {
        let errorMessage = 'An unexpected error occurred.';
        const error = err as AxiosError<any>;
        if (error.response) {
          errorMessage = error.response.data?.message || 'Failed to fetch profile data.';
        } else if (error.request) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = error.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  if (loading) {
    return <Loader text="Fetching profile details..." />;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
      <div className="p-4 bg-gray-50 min-h-full h-full">
        <div className="h-full w-full scrollContainer" style={{ overflowY: "scroll" }}>
          {/* Borrower Profile Section */}
          {profileData && (
              <div className={`${styles.firstContainer} bg-white rounded-lg p-6 shadow-sm mb-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-gray-600" />
                  <h2 className={styles.borrowerTitle}>My Profile</h2>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  {profileData.profileImage ? (
                      <img
                          src={profileData.profileImage}
                          alt={profileData.name || 'Profile'}
                          className="w-16 h-16 rounded-full object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleImagePreview(profileData.profileImage!)}
                      />
                  ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-500" />
                      </div>
                  )}
                  <div>
                    <div className="flex items-center gap-3">
                      <div className={styles.userName}>{profileData.name || 'N/A'}</div>
                      {profileData.kycverified !== undefined && (
                          <span
                              className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                                  profileData.kycverified
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                              }`}
                          >
                          {profileData.kycverified ? 'KYC Verified' : 'KYC Unverified'}
                        </span>
                      )}
                    </div>
                    <div className={styles.id}>ID: {profileData.displayId || 'N/A'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-600">CIBIL Score</div>
                    <div className={`${getCibilColor(profileData?.borrowerCibilData?.score)}`}>{profileData?.borrowerCibilData?.score || '0'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Monthly Income</div>
                    <div className="text-sm font-medium">
                      {profileData.employmentDetails?.takeHomeSalary ? `₹ ${formatIndianNumber(profileData.employmentDetails.takeHomeSalary)}` : '0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Employment</div>
                    <div className="text-sm font-medium">{profileData.employmentDetails ? toTitleCase(profileData.employmentDetails.employmentType.split('_').join(' ')) : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Date of Birth</div>
                    <div className="text-sm font-medium">
                      {profileData.dob ? new Date(profileData.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Gender</div>
                    <div className="text-sm font-medium">
                      {profileData.gender ? toTitleCase(profileData.gender) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Father's Name</div>
                    <div className="text-sm font-medium">{profileData.fathersName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Current Address</div>
                    <div className="text-sm font-medium break-words whitespace-normal">{profileData?.currentAddress?.address || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Permanent Address</div>
                    <div className="text-sm font-medium break-words whitespace-normal">{profileData?.permanentAddress?.address || 'N/A'}</div>
                  </div>
                </div>
              </div>
          )}

          {profileData?.bankDetailsAvailable && bankDetails.length > 0 && (
              <div className={`${styles.firstContainer} bg-white rounded-lg p-6 shadow-sm mb-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <Landmark className="w-5 h-5 text-gray-600" />
                  <h3 className={styles.borrowerTitle}>Bank Account Details</h3>
                </div>
                <div className="space-y-4">
                  {bankDetails.map((account) => (
                      <div key={account.id} className="border border-gray-200 rounded-lg p-4 relative transition-shadow hover:shadow-md">
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          {account.default && (
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                                        Default
                                    </span>
                          )}
                          {account.verified && (
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">
                                        Verified
                                    </span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-800 pr-24">{account.bankName}</p>
                        <p className="text-sm text-gray-600">{account.accountHolderName}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-3 pt-3 border-t">
                          <div>
                            <p className="text-xs text-gray-500">Account Number</p>
                            <p className="text-sm font-mono text-gray-900">{account.accountNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">IFSC Code</p>
                            <p className="text-sm font-mono text-gray-900">{account.ifscNumber}</p>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* KYC Verification Section */}
          <div className={`${styles.firstContainer} bg-white rounded-lg p-6 shadow-sm`}>
            <h3 className={styles.borrowerTitle}>KYC Verification</h3>
            <p className={styles.id}>Document Verification Status</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {documents.map((doc) => (
                  <div key={doc.type} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${doc.status === 'Verified' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <doc.icon className={`w-6 h-6 ${doc.status === 'Verified' ? 'text-green-600' : 'text-red-600'}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-base">{doc.type}</h4>
                            {doc.documentValue && (
                                <p className="text-sm text-gray-500 mt-1 font-mono">
                                  {doc.type === 'Aadhaar Verified'
                                      ? doc.documentValue.replace(/(\d{4})(?=\d)/g, '$1 ')
                                      : doc.documentValue}
                                </p>
                            )}
                          </div>
                        </div>
                        <span
                            className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                                doc.status === 'Verified'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
                      {doc.status}
                    </span>
                      </div>
                    </div>

                    {doc.docUrl && doc.docUrl.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                          <button
                              onClick={() => handleDocumentPreview(doc)}
                              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                            View Document
                          </button>
                        </div>
                    )}
                  </div>
              ))}
            </div>
          </div>

          {/* Image Preview Modal */}
          {isPreviewOpen && previewImageUrl && (
              <div
                  className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                  onClick={closeImagePreview}
              >
                <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                >
                  <img src={previewImageUrl} alt="Profile Preview" className="max-w-[90vw] max-h-[90vh] rounded-lg" />
                  <button
                      onClick={closeImagePreview}
                      className="absolute top-[-15px] right-[-15px] text-white bg-gray-800 rounded-full p-1 hover:bg-gray-700 transition-colors"
                      aria-label="Close image preview"
                  >
                    <XCircle className="w-8 h-8" />
                  </button>
                </div>
              </div>
          )}

          {/* Document Preview Modal */}
          {isDocPreviewOpen && previewDocs && (
              <div
                  className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                  onClick={closeDocumentPreview}
              >
                <div
                    className="relative bg-white p-4 rounded-lg shadow-lg max-w-lg w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h3 className="text-lg font-medium">{previewDocs.type}</h3>
                    <button onClick={closeDocumentPreview} className="text-gray-500 hover:text-gray-800">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="mt-4 max-h-[80vh] overflow-y-auto">
                    {previewDocs.docUrl.map((doc, index) => (
                        <div key={index} className='mb-4'>
                          <iframe
                              src={doc.url}
                              width="100%"
                              height="500px"
                              className="border rounded"
                              title={`${previewDocs.type}-preview-${index}`}
                          />
                        </div>
                    ))}
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default KYCDocumentsContent;