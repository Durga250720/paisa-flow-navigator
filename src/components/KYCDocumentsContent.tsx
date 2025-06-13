import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, User, XCircle, Eye } from 'lucide-react'; // Added Eye icon
import styles from './KYCDocumentsContent.module.css';
import { config } from '../config/environment'; // Assuming config is here


const KYCDocumentsContent = () => {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Move documents array into state
  const [documents, setDocuments] = useState([
    {
      type: "PAN Card",
      status: "Unverified", // Initial status
      icon: FileText,
    },
    {
      type: "Salary Slips",
      status: "Unverified", // Initial status
      icon: FileText
    },
    {
      type: "KYC Verified",
      status: "Unverified", // Initial status
      icon: FileText
    },
    {
      type: "AADHAR Verified",
      status: "Unverified", // Initial status
      icon: FileText
    }
  ]);

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
            return { ...doc, status: data.data.panVerified ? 'Verified' : 'Unverified', docUrl: data.data.kycDocuments.find(kyc => kyc.documentType === 'PAN')?.documentUrls || ''};
          } else if (doc.type === "Salary Slips") {
            return { ...doc, status: data.data.salarySlip ? 'Verified' : 'Unverified', docUrl:data.data.payslips.documentUrls};
          } else if (doc.type === "KYC Verified") {
            return { ...doc, status: data.data.kycverified ? 'Verified' : 'Unverified',docUrl:''};
          } else if (doc.type === "AADHAR Verified") {
            return { ...doc, status: data.data.aadhaarVerified ? 'Verified' : 'Unverified', docUrl: data.data.kycDocuments.find(kyc => kyc.documentType === 'AADHAAR')?.documentUrls || ''};
          }
          return doc;
        }));

        setProfileData(data.data);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
        // console.log(documents)
      }
    };

    fetchProfileData();
  }, [navigate]);

  if (loading) {
    return <div className="p-4 text-center">Fetching profile details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      {/* Borrower Profile Section */}
      {profileData && (
        <div className={`${styles.firstContainer} bg-white rounded-lg p-6 shadow-sm mb-6`}>
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className={styles.borrowerTitle}>Borrower Profile</h2>
          </div>
          <div className="space-y-2">
            <div>
              <span className={styles.userName}>{profileData.name || 'N/A'}</span>
            </div>
            <div className={styles.id}>
              ID: {profileData.displayId || 'N/A'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <div className="text-sm text-gray-600">CIBIL Score</div>
                <div className="text-lg font-semibold">{profileData?.borrowerCibilData?.score || '0'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Employment</div>
                <div className="text-sm font-medium">{profileData.employmentDetails ? profileData.employmentDetails.employmentType : 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Monthly Income</div>
                <div className="text-sm font-medium">
                  {profileData.employmentDetails ? `₹ ${profileData.employmentDetails?.takeHomeSalary}` : '0'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC Verification Section */}
      <div className={`${styles.firstContainer} bg-white rounded-lg p-6 shadow-sm`}>
        <h3 className={styles.borrowerTitle}>KYC Verification</h3>
        <p className={styles.id}>customer's documents</p>

        <div className="space-y-4 mt-4">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <doc.icon className="w-5 h-5 text-gray-600" />
                <span className="text-xs font-normal text-gray-900">{doc.type}</span>
              </div>
              <div className="flex items-center gap-3"> {/* Increased gap for View icon */}
                <div className="flex items-center gap-1"> {/* Group status icon and text */}
                  {doc.status === 'Verified' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <span className={`${doc.status === 'Verified' ? styles.activeStatusValue : styles.inActiveStatusValue} text-xs px-2 py-1 rounded text-center`}>
                  {doc.status}
                </span>
                {/* View Icon */}
                {/* <button title="View Document" className="text-gray-500 hover:text-primary">
                  <Eye size={16} />
                </button> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KYCDocumentsContent;
