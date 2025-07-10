import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { config } from '../config/environment';
import styles from '../pages-styles/EmployemntInfo.module.css';
import { toast } from 'react-toastify';
import OTPInput from '../components/OTPInput';
import { FileText, Upload, X } from 'lucide-react';
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const EmploymentInfo = () => {
  const [formData, setFormData] = useState({
    industry: '',
    companyName: '',
    jobRole: '',
    monthlyIncome: '',
    workExperience: '',
    officialEmail: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [empIdCard, setEmpIdCard] = useState<File>()
  const navigate = useNavigate();

  const personalEmailDomains = [
    'gmail.com', 'yahoo.com', 'yahoo.in', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com',
    'zoho.com', 'protonmail.com', 'yandex.com', 'mail.com', 'rediffmail.com'
  ];

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.industry) newErrors.industry = 'Industry is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.jobRole.trim()) newErrors.jobRole = 'Job role is required';
    if (!formData.monthlyIncome.trim()) newErrors.monthlyIncome = 'Monthly income is required';
    if (!formData.workExperience.trim()) newErrors.workExperience = 'Work experience is required';
    if (!formData.officialEmail.trim()) {
      newErrors.officialEmail = 'Official email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.officialEmail)) {
      newErrors.officialEmail = 'Please enter a valid email address';
    }
    if (!isEmailVerified) newErrors.submit = 'Please verify your official email address to continue.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'officialEmail') {
      setIsEmailVerified(false);
      setShowOtpInput(false);
      setOtp('');
      setResendTimer(0);
    }
  };

  const handleSendEmailOTP = async () => {
    const emailError = !formData.officialEmail.trim()
      ? 'Official email is required'
      : !/\S+@\S+\.\S+/.test(formData.officialEmail)
        ? 'Please enter a valid email address'
        : '';

    if (emailError) {
      setErrors(prev => ({ ...prev, officialEmail: emailError }));
      return;
    }

    const emailDomain = formData.officialEmail.split('@')[1]?.toLowerCase();
    if (emailDomain && personalEmailDomains.includes(emailDomain)) {
      toast.warning("Please enter your office mail ID.");
      setErrors(prev => ({ ...prev, officialEmail: 'Personal email addresses like Gmail, Yahoo, etc., are not allowed.' }));
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      toast.error("Authentication token not found. Please log in again.");
      navigate('/');
      return;
    }

    setEmailLoading(true);
    setErrors(prev => ({ ...prev, officialEmail: '', otp: '' }));

    try {
      const response = await fetch(config.baseURL + 'kyc-docs/company-otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          borrowerId: authToken,
          companyEmail: formData.officialEmail
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send OTP.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMessage = errorData.message;
        } catch (e) {
          // Ignore JSON parsing errors
        }
        throw new Error(errorMessage);
      }

      toast.success(`OTP sent to ${formData.officialEmail}`);
      setShowOtpInput(true);
      setResendTimer(30);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP.';
      toast.error(message);
      setErrors(prev => ({ ...prev, officialEmail: message }));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleOtpInputChange = (otpValue: string) => {
    setOtp(otpValue);
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (otp.length !== 6) {
      setErrors(prev => ({ ...prev, otp: 'Please enter the 6-digit OTP.' }));
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      toast.error("Authentication token not found. Please log in again.");
      navigate('/');
      return;
    }

    setEmailLoading(true);
    setErrors(prev => ({ ...prev, otp: '' }));

    try {
      const response = await fetch(config.baseURL + 'kyc-docs/company-otp-verify', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          borrowerId: authToken,
          companyEmail: formData.officialEmail,
          otp: otp
        })
      });

      if (!response.ok) {
        let errorMessage = 'OTP verification failed.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
        throw new Error(errorMessage);
      }

      toast.success("Email verified successfully!");
      setIsEmailVerified(true);
      setShowOtpInput(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OTP verification failed.';
      toast.error(message);
      setErrors(prev => ({ ...prev, otp: message }));
    } finally {
      setEmailLoading(false);
    }
  };

  const s3BucketConfig = config.componentImageUploading.S3TransferUtility.Default;
      const cognitoAuthConfig = config.componentImageUploading.CredentialsProvider.CognitoIdentity.Default;
  
      const cognitoClient = new CognitoIdentityClient({
          region: cognitoAuthConfig.Region,
      });
  
      const s3Credentials = fromCognitoIdentityPool({
          client: cognitoClient,
          identityPoolId: cognitoAuthConfig.PoolId,
      });
  
      const s3Client = new S3Client({
          region: s3BucketConfig.Region,
          credentials: s3Credentials,
      });


      const uploadFileToS3 = async (file: File, pathPrefix: string, userName: string): Promise<{fileName: string, url: string, type: string}> => {
          return new Promise((resolve, reject) => {
              const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
              const key = `${pathPrefix}/${userName}/${Date.now()}-${sanitizedFileName}`;
  
              const reader = new FileReader();
  
              reader.onload = async (event) => {
                  if (!event.target?.result) {
                      reject(new Error(`FileReader failed to read ${file.name}`));
                      return;
                  }
                  const arrayBuffer = event.target.result as ArrayBuffer;
                  const body = new Uint8Array(arrayBuffer);
  
                  const command = new PutObjectCommand({
                      Bucket: s3BucketConfig.Bucket,
                      Key: key,
                      Body: body,
                      ContentType: file.type,
                  });
  
                  try {
                      await s3Client.send(command);
                      const url = `https://${s3BucketConfig.Bucket}.s3.${s3BucketConfig.Region}.amazonaws.com/${key}`;
                      resolve({ fileName: file.name, url, type: pathPrefix });
                  } catch (error) {
                      console.error(`Error uploading ${file.name} to S3:`, error);
                      const awsError = error as Error;
                      reject(new Error(`S3 Upload Failed for ${file.name}: ${awsError.message}`));
                  }
              };
  
              reader.onerror = (error) => {
                  console.error(`FileReader error for ${file.name}:`, error);
                  reject(new Error(`Failed to read file ${file.name}`));
              };
  
              reader.readAsArrayBuffer(file);
          });
      };

  const handleContinue = async () => {
    if (!validateForm()) return;

    const authToken = localStorage.getItem('authToken');
    const userName = localStorage.getItem('name');
    const sanitizedUserName = userName.replace(/[^a-zA-Z0-9_-]/g, '_');
    setLoading(true);
    try {
      let empIdCardUrl = '';
      if(empIdCard){
        const uploadResult = await uploadFileToS3(empIdCard, 'employeeIdCards', sanitizedUserName);
         empIdCardUrl = uploadResult.url;
      }
      const payload = {
        employmentType: 'SALARIED',
        industry: formData.industry,
        companyName: formData.companyName,
        designation: formData.jobRole,
        takeHomeSalary: parseInt(formData.monthlyIncome, 10) || 0,
        totalExperienceInMonths: parseInt(formData.workExperience, 10) * 12 || 0,
        officialEmail: formData.officialEmail,
        employeeCardImageUrl:empIdCardUrl
      };

      const response = await fetch(config.baseURL + `kyc-docs/${authToken}/update-employment`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to save employment information. Please try again.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMessage = errorData.message;
        } catch (e) {
          // ignore
        }
        throw new Error(errorMessage);
      }

      toast.success("Employment information saved successfully!");
      localStorage.setItem('employmentInfoCompleted', 'true');
      navigate('/income-verification');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrors({ submit: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmpIdUpload = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setEmpIdCard(selectedFile);
  }

  const removeEmpIdCard = () => {
    setEmpIdCard(null)
  };

  return (
    <div className={styles.container}>
      <div className={styles.navbarWrapper}>
        <Navbar />
      </div>

      <div className={styles.mainContainer}>
        {/* Left Panel - Image */}
        <div className={styles.leftPanel}>
          <div className={styles.imageContainer}>
            <img
              src="/lovable-uploads/8f598013-7362-496b-96a6-8a285565f544.png"
              alt="Happy customer with phone"
              className={styles.heroImage}
            />
          </div>
        </div>

        {/* Right Panel - Employment Form */}
        <div className={styles.rightPanel}>
          <div className={styles.employmentFormContainer}>
            <div className="text-center mb-2">
              <div className={styles.heading}>Employment Info</div>
              <p className={styles.description}>To deposit your approved amount and enable auto-repayment</p>
            </div>

            <div className={`space-y-3 ${styles.formContainer}`}>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="inputField1"
                >
                  <option value="">Select Industry Type</option>
                  <option value="it">Information Technology</option>
                  <option value="banking">Banking & Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                </select>
                {errors.industry && <p className="error-message">{errors.industry}</p>}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <sup className="text-red-500">*</sup>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter the Company Name"
                  className="inputField1"
                />
                {errors.companyName && <p className="error-message">{errors.companyName}</p>}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Role / Designation
                </label>
                <input
                  type="text"
                  value={formData.jobRole}
                  onChange={(e) => handleInputChange('jobRole', e.target.value)}
                  placeholder="Enter the Job Role"
                  className="inputField1"
                />
                {errors.jobRole && <p className="error-message">{errors.jobRole}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income (Take-Home) <sup className="text-red-500">*</sup>
                </label>
                <input
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="Enter the monthly income"
                  className="inputField1"
                />
                {errors.monthlyIncome && <p className="error-message">{errors.monthlyIncome}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700 mb-1">
                  Work Experience (Yrs) <sup className="text-red-500">*</sup>
                </label>
                <input
                  id="workExperience"
                  type="number"
                  value={formData.workExperience}
                  onChange={(e) => handleInputChange('workExperience', e.target.value)}
                  placeholder="Enter the work experience"
                  className="inputField1"
                />
                {errors.workExperience && <p className="error-message">{errors.workExperience}</p>}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Official Mail ID <sup className="text-red-500">*</sup>
                  {isEmailVerified && <span className="ml-2 text-green-600 text-xs">(Verified)</span>}
                </label>
                <div className="flex items-start space-x-2">
                  <input
                    type="email"
                    value={formData.officialEmail}
                    onChange={(e) => handleInputChange('officialEmail', e.target.value)}
                    placeholder="Enter your official email"
                    className="inputField1"
                    disabled={isEmailVerified || showOtpInput}
                  />
                </div>
                {errors.officialEmail && <p className="error-message">{errors.officialEmail}</p>}
              </div>

              {!isEmailVerified && (
                <div className='flex justify-end px-5'>
                  <button
                    onClick={handleSendEmailOTP}
                    disabled={emailLoading || resendTimer > 0 || !formData.officialEmail}
                    className="text-sm px-3 whitespace-nowrap bg-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white
                    text-primary"
                  >
                    {emailLoading && !resendTimer ? 'Sending...' : (resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Send OTP')}
                  </button>
                </div>
              )}


              {showOtpInput && !isEmailVerified && (
                <div className="form-group p-4 border rounded-lg bg-gray-50 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Enter OTP sent to {formData.officialEmail}
                  </label>
                  <OTPInput
                    length={6}
                    onComplete={handleOtpInputChange}
                    error={errors.otp}
                  />
                  {errors.otp && <p className="error-message mt-1">{errors.otp}</p>}
                  <button
                    onClick={handleVerifyEmailOTP}
                    disabled={emailLoading || otp.length !== 6}
                    className="primary-button w-full"
                  >
                    {emailLoading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </div>
              )}

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleEmpIdUpload(e.target.files?.[0] || null)}
                  className="hidden"
                  id="empId-upload"
                />
                {!empIdCard ? (
                  <div className="inputField1 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-primary transition-colors">
                    <label
                      htmlFor="empId-upload"
                      className="cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Upload className="h-4 w-4 text-gray-400" />
                      <p className="text-xs text-gray-600">
                        Click to upload Employee ID (PDF, JPG, PNG)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 truncate max-w-xs" title={empIdCard.name}>
                        {empIdCard.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                        onClick={() => document.getElementById('empId-upload')?.click()}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={removeEmpIdCard}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>


            </div>

            {errors.submit && <p className="error-message text-center mt-4">{errors.submit}</p>}


            <div className={`${styles.bottomContainer} text-center mt-2`}>
              <button
                onClick={handleContinue}
                disabled={loading || !isEmailVerified}
                className="primary-button px-20"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentInfo;