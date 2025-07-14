import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdCard, Banknote, UserCheck, BadgeCheck, CheckCircle, User, XCircle } from 'lucide-react';
import styles from './KYCDocumentsContent.module.css';
import { config } from '../config/environment'; // Assuming config is here
import { formatIndianNumber, getCibilColor, toTitleCase } from '../lib/utils';

// A reusable loader component that matches the theme
const Loader = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center p-10 bg-gray-50 min-h-full">
    <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">{text}</p>
  </div>
);


const KYCDocumentsContent = () => {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  // Move documents array into state
  const [documents, setDocuments] = useState([
    {
      type: "Aadhaar Verified",
      status: "Unverified",
      icon: UserCheck,
      documentValue: ''
    },
    {
      type: "PAN Card",
      status: "Unverified",
      icon: IdCard,
      documentValue: ''
    },
    {
      type: "Salary Slips",
      status: "Unverified",
      icon: Banknote,
      documentValue: ''
    },
    {
      type: "Overall KYC Status",
      status: "Unverified",
      icon: BadgeCheck,
      documentValue: ''
    }
  ]);

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
    setIsPreviewOpen(true);
  };

  const closeImagePreview = () => {
    setIsPreviewOpen(false);
    setPreviewImageUrl(null);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/'); // Redirect to login if no token
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${config.baseURL}borrower/${authToken}/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch profile data.' }));
          throw new Error(errorData.message || 'Failed to fetch profile data.');
        }
        const data = await response.json();

        // Update documents state based on API response
        setDocuments(prevDocuments => prevDocuments.map(doc => {
          if (doc.type === "PAN Card") {
            return {
              ...doc, status: data?.data?.kycDocuments?.find(verify => verify.documentType === 'PAN')?.verified ? 'Verified' : 'Unverified',
              docUrl: data?.data?.kycDocuments?.find(kyc => kyc.documentType === 'PAN')?.documentUrls || '',
              documentValue: data?.data?.kycDocuments?.find(verify => verify.documentType === 'PAN')?.documentNumber
            };
          } else if (doc.type === "Salary Slips") {
            return {
              ...doc, status: data?.data?.payslips?.verified ? 'Verified' : 'Unverified',
              docUrl: data?.data?.payslips?.documentUrls,
              documentValue: ''
            };
          } else if (doc.type === "Overall KYC Status") { // Changed from "KYC Verified"
            return {
              ...doc, status: data?.data?.kycverified ? 'Verified' : 'Unverified', docUrl: '',
              documentValue: ''
            };
          } else if (doc.type === "Aadhaar Verified") {
            return {
              ...doc, status: data?.data?.kycDocuments?.find(verify => verify.documentType === 'AADHAAR')?.verified ? 'Verified' : 'Unverified',
              docUrl: data?.data?.kycDocuments?.find(kyc => kyc.documentType === 'AADHAAR')?.documentUrls || '',
              documentValue: data?.data?.kycDocuments?.find(verify => verify.documentType === 'AADHAAR')?.documentNumber
            };
          }
          return doc;
        }));

        setProfileData(data.data);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
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
      <div className="h-full w-full scrollContainer" style={{overflowY:"scroll"}}>
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
                  onClick={() => handleImagePreview(profileData.profileImage)}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <div>
                <div className={styles.userName}>{profileData.name || 'N/A'}</div>
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
                  {profileData.employmentDetails ? `₹ ${formatIndianNumber(profileData.employmentDetails?.takeHomeSalary)}` : '0'}
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
                <div className="text-sm text-gray-600">Perminent Address</div>
                <div className="text-sm font-medium break-words whitespace-normal">{profileData?.permanentAddress?.address || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* KYC Verification Section */}
        <div className={`${styles.firstContainer} bg-white rounded-lg p-6 shadow-sm`}>
          <h3 className={styles.borrowerTitle}>KYC Verification</h3>
          <p className={styles.id}>Document Verification Status</p>

          <div className="space-y-4 mt-4">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <doc.icon className="w-5 h-5 text-gray-600" />
                  <span className="text-xs font-normal text-gray-900">{doc.type}</span>
                  {
                    doc.documentValue && (
                      <span className='text-xs font-normal text-gray-800'>(
                        {
                          doc.type === 'Aadhaar Verified'
                            ? doc.documentValue.replace(/(\d{4})(?=\d)/g, '$1 ')
                            : doc.documentValue
                        }
                        )</span>
                    )
                  }
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {doc.status === 'Verified' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <span className={`${doc.status === 'Verified' ? styles.activeStatusValue : styles.inActiveStatusValue} text-xs px-2 py-1 rounded text-center`}>
                    {doc.status}
                  </span>
                </div>
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
      </div>
    </div>
  );
};

export default KYCDocumentsContent;