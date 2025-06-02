
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Upload, X, Check } from 'lucide-react';
import { config } from '../config/environment';
import styles from '../pages-styles/BankInfo.module.css';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { toast } from "sonner";

const BankInfo = () => {
  const [formData, setFormData] = useState({
    bankAccountNumber: '',
    confirmBankAccountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [files, setFiles] = useState({
    payslips: [] as File[],
    bankStatement: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const kycVerified = localStorage.getItem('kycVerified');

    if (!authToken || !kycVerified) {
      navigate('/');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankAccountNumber.trim()) {
      newErrors.bankAccountNumber = 'Bank account number is required';
    } else if (formData.bankAccountNumber.length < 9 || formData.bankAccountNumber.length > 18) {
      newErrors.bankAccountNumber = 'Bank account number should be 9-18 digits';
    }

    if (!formData.confirmBankAccountNumber.trim()) {
      newErrors.confirmBankAccountNumber = 'Please re-enter bank account number';
    } else if (formData.bankAccountNumber !== formData.confirmBankAccountNumber) {
      newErrors.confirmBankAccountNumber = 'Account numbers do not match';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Please enter a valid IFSC code';
    }

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePayslipUpload = (file: File) => {
    if (files.payslips.length < 6) {
      setFiles(prev => ({
        ...prev,
        payslips: [...prev.payslips, file]
      }));
    }
  };

  const removePayslip = (index: number) => {
    setFiles(prev => ({
      ...prev,
      payslips: prev.payslips.filter((_, i) => i !== index)
    }));
  };

  const handleBankStatementUpload = (file: File) => {
    setFiles(prev => ({ ...prev, bankStatement: file }));
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    const authToken = localStorage.getItem('authToken');

    setLoading(true);
    try {
      console.log('Starting file uploads...');
      console.log('Number of payslips to upload:', files.payslips.length);
      console.log('Bank statement to upload:', files.bankStatement ? 'Yes' : 'No');

      const s3Config = config.componentImageUploading;
      const cognitoPoolId = s3Config.CredentialsProvider.CognitoIdentity.Default.PoolId;
      const cognitoRegion = s3Config.CredentialsProvider.CognitoIdentity.Default.Region;
      const s3Bucket = s3Config.S3TransferUtility.Default.Bucket;
      const s3Region = s3Config.S3TransferUtility.Default.Region;

      // Initialize S3 client with Cognito credentials
      const credentials = fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: cognitoRegion }),
        identityPoolId: cognitoPoolId,
      });

      const s3Client = new S3Client({
        region: s3Region,
        credentials,
      });

      const uploadFileToS3 = async (file: File, fileType: 'payslip' | 'bank_statement'): Promise<string> => {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        // Sanitize filename by replacing spaces with underscores
        const sanitizedFileName = file.name.replace(/\s+/g, '_');
        const key = `${authToken}/${fileType}/${timestamp}-${randomId}-${sanitizedFileName}`;

        console.log(`Uploading ${fileType}:`, sanitizedFileName, 'to key:', key);

        const putObjectCommand = new PutObjectCommand({
          Bucket: s3Bucket,
          Key: key,
          Body: file,
          ContentType: file.type,
        });

        await s3Client.send(putObjectCommand);
        const url = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${key}`;
        console.log(`Successfully uploaded ${fileType}:`, url);
        return url;
      };

      // Upload all payslips
      const payslipUrls: string[] = [];
      console.log('Starting payslip uploads...');
      
      for (let i = 0; i < files.payslips.length; i++) {
        const payslipFile = files.payslips[i];
        console.log(`Uploading payslip ${i + 1}/${files.payslips.length}:`, payslipFile.name);
        try {
          const url = await uploadFileToS3(payslipFile, 'payslip');
          payslipUrls.push(url);
          console.log(`Payslip ${i + 1} uploaded successfully:`, url);
        } catch (error) {
          console.error(`Failed to upload payslip ${i + 1}:`, error);
          throw new Error(`Failed to upload payslip: ${payslipFile.name}`);
        }
      }

      console.log('All payslips uploaded. URLs:', payslipUrls);

      // Upload bank statement
      let bankStatementUrl: string | null = null;
      if (files.bankStatement) {
        console.log('Uploading bank statement...');
        try {
          bankStatementUrl = await uploadFileToS3(files.bankStatement, 'bank_statement');
          console.log('Bank statement uploaded successfully:', bankStatementUrl);
        } catch (error) {
          console.error('Failed to upload bank statement:', error);
          throw new Error('Failed to upload bank statement');
        }
      }

      // Construct payload for bank-detail API
      const payload = {
        borrowerId: authToken,
        accountNumber: formData.bankAccountNumber,
        ifscNumber: formData.ifscCode.toUpperCase(),
        accountHolderName: formData.accountHolderName,
        payslips: payslipUrls,
        bankStatement: bankStatementUrl ? [bankStatementUrl] : [],
      };

      console.log('API payload:', payload);

      // API call to bank-detail
      const apiUrl = `${config.baseURL}bank-detail`;
      console.log('Making API call to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('API response status:', response.status);
navigate('/employment-info');
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: 'Failed to save bank information. Please try again.' };
        }
        
        throw new Error(errorData.message || 'Failed to save bank information.');
      }

      const responseData = await response.json();
      console.log('API success response:', responseData);

      toast.success("Bank details saved successfully!");
      localStorage.setItem('bankInfoCompleted', 'true');
      navigate('/employment-info');
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save bank information. Please try again.';
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container}`}>
      <div className={styles.navbarWrapper}>
        <Navbar />
      </div>
      <div className={`${styles.mainContainer}`}>
        <div className="flex items-center justify-center h-full">
          <div className={`${styles.innerContainer} w-full lg:bg-white lg:rounded-xl lg:shadow-lg p-6 lg:w-[70rem] max-w-7xl mx-auto h-[95%] flex flex-col`}>
            <div className="text-center mb-6 flex-shrink-0">
              <div className={styles.heading}>Bank Info</div>
              <p className={styles.description}>To deposit your approved amount and enable auto-repayment</p>
            </div>

            <div className="flex-1 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto">
                <div className="space-y-6">
                  <div className="form-group">
                    <label htmlFor="bankAccountNumber" className={styles.label}>
                      Bank Account Number <sup>*</sup>
                    </label>
                    <input
                      id="bankAccountNumber"
                      type="text"
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleInputChange('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
                      placeholder="Please Enter Bank Account Number"
                      className="inputField"
                    />
                    {errors.bankAccountNumber && (
                      <p className="error-message break-words">{errors.bankAccountNumber}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmBankAccountNumber" className={styles.label}>
                      Re-Enter Bank Account Number <sup>*</sup>
                    </label>
                    <input
                      id="confirmBankAccountNumber"
                      type="text"
                      value={formData.confirmBankAccountNumber}
                      onChange={(e) => handleInputChange('confirmBankAccountNumber', e.target.value.replace(/\D/g, ''))}
                      placeholder="Please Re-Enter Bank Account Number"
                      className="inputField"
                    />
                    {errors.confirmBankAccountNumber && (
                      <p className="error-message break-words">{errors.confirmBankAccountNumber}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="ifscCode" className={styles.label}>
                      IFSC Code <sup>*</sup>
                    </label>
                    <input
                      id="ifscCode"
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                      placeholder="Please Enter IFSC Code"
                      className="inputField"
                      maxLength={11}
                    />
                    {errors.ifscCode && (
                      <p className="error-message break-words">{errors.ifscCode}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="accountHolderName" className={styles.label}>
                      Account Holder Name <sup>*</sup>
                    </label>
                    <input
                      id="accountHolderName"
                      type="text"
                      value={formData.accountHolderName}
                      onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                      placeholder="Please Enter Account Holder Name"
                      className="inputField"
                    />
                    {errors.accountHolderName && (
                      <p className="error-message break-words">{errors.accountHolderName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="form-group">
                    <label className={styles.label}>
                      Upload Payslips (Maximum 6)
                    </label>

                    {files.payslips.length < 6 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors mb-4">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePayslipUpload(file);
                            e.target.value = '';
                          }}
                          className="hidden"
                          id="payslip-upload"
                        />
                        <label htmlFor="payslip-upload" className="cursor-pointer">
                          <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                          <p className={styles.uploadText}>Upload or Drag your Pay slip here</p>
                        </label>
                      </div>
                    )}

                    {files.payslips.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {files.payslips.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>
                                  {file.name.length > 20
                                    ? `${file.name.substring(0, 20)}...`
                                    : file.name}
                                </p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removePayslip(index)}
                              className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      {files.payslips.length}/6 payslips uploaded
                    </p>
                  </div>

                  <div className="form-group">
                    <label className={styles.label}>
                      Upload Bank Statement
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBankStatementUpload(file);
                        }}
                        className="hidden"
                        id="bank-statement-upload"
                      />
                      <label htmlFor="bank-statement-upload" className="cursor-pointer">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        {files.bankStatement ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-green-600 text-sm break-words">{files.bankStatement.name}</p>
                          </div>
                        ) : (
                          <p className={styles.uploadText}>Upload or Drag your Bank Statement here</p>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 mt-6">
              {errors.submit && (
                <p className="error-message text-center mb-4 break-words">{errors.submit}</p>
              )}
              <div className='flex items-center justify-center'>
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="primary-button w-max px-20"
                >
                  {loading ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankInfo;
