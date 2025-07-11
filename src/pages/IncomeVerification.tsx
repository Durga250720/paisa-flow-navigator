
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Upload, X, FileText, Trash2 } from 'lucide-react';
import { config } from '../config/environment';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import styles from '../pages-styles/EmployemntInfo.module.css';
import { toast } from 'react-toastify';
import { Input } from '../components/ui/input';

const s3BucketConfig = config.componentImageUploading.S3TransferUtility.Default;
const cognitoAuthConfig = config.componentImageUploading.CredentialsProvider.CognitoIdentity.Default;

const s3Client = new S3Client({
  region: s3BucketConfig.Region,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: cognitoAuthConfig.Region }),
    identityPoolId: cognitoAuthConfig.PoolId,
  }),
});

const IncomeVerification = () => {
  const [files, setFiles] = useState<{
    payslips: File[];
    bankStatement: File | null;
  }>({
    payslips: [],
    bankStatement: null,
  });

  const [payslipAccessCodes, setPayslipAccessCodes] = useState<string[]>([]);
  const [bankStatementAccessCode, setBankStatementAccessCode] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const uploadFileToS3 = async (file: File, pathPrefix: string, userName: string): Promise<{ fileName: string, url: string, type: string }> => {
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${pathPrefix}/${userName}/${Date.now()}-${sanitizedFileName}`;
    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);
    await s3Client.send(new PutObjectCommand({
      Bucket: s3BucketConfig.Bucket,
      Key: key,
      Body: body,
      ContentType: file.type,
    }));
    return {
      fileName: file.name,
      url: `https://${s3BucketConfig.Bucket}.s3.${s3BucketConfig.Region}.amazonaws.com/${key}`,
      type: pathPrefix,
    };
  };

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) navigate('/');
  }, [navigate]);

  const validateFiles = () => {
    const newErrors: Record<string, string> = {};
    if (files.payslips.length === 0) newErrors.payslips = 'At least one payslip is required.';
    if (files.payslips.length > 6) newErrors.payslips = 'Maximum 6 payslips allowed.';
    if (!files.bankStatement) newErrors.bankStatement = 'Bank statement is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayslipUpload = useCallback((selectedFilesList: FileList | null) => {
    if (!selectedFilesList) return;
    const newFiles = Array.from(selectedFilesList);
    if (files.payslips.length + newFiles.length > 6) {
      toast.error("Max 6 payslips allowed.");
      return;
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const validFiles = newFiles.filter(f => allowedTypes.includes(f.type));
    
    setFiles(prev => ({
      ...prev,
      payslips: [...prev.payslips, ...validFiles],
    }));
    
    // Add empty access codes for new files
    setPayslipAccessCodes(prev => {
      const newCodes = [...prev];
      for (let i = 0; i < validFiles.length; i++) {
        newCodes.push('');
      }
      return newCodes;
    });
  }, [files.payslips.length]);

  const removePayslip = useCallback((index: number) => {
    setFiles(prev => ({
      ...prev,
      payslips: prev.payslips.filter((_, i) => i !== index),
    }));
    
    setPayslipAccessCodes(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleBankStatementUpload = useCallback((file: File | null) => {
    if (!file) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, bankStatement: 'Invalid file type' }));
      return;
    }
    setFiles(prev => ({ ...prev, bankStatement: file }));
    setErrors(prev => ({ ...prev, bankStatement: '' }));
  }, []);

  const removeBankStatement = useCallback(() => {
    setFiles(prev => ({ ...prev, bankStatement: null }));
    setBankStatementAccessCode('');
  }, []);

  const updatePayslipAccessCode = useCallback((index: number, value: string) => {
    setPayslipAccessCodes(prev => {
      const newCodes = [...prev];
      newCodes[index] = value;
      return newCodes;
    });
  }, []);

  const handleContinue = async () => {
    if (!validateFiles()) return;

    const borrowerId = localStorage.getItem('authToken');
    const userName = localStorage.getItem('name')?.replace(/[^a-zA-Z0-9_-]/g, '_');

    if (!borrowerId || !userName) {
      toast.error("Login required.");
      return navigate('/');
    }

    setLoading(true);
    try {
      const uploadPromises = [
        ...files.payslips.map(f => uploadFileToS3(f, 'payslips', userName)),
        ...(files.bankStatement ? [uploadFileToS3(files.bankStatement, 'bankStatements', userName)] : []),
      ];
      const uploaded = await Promise.all(uploadPromises);

      const payslipDocs = uploaded.filter(d => d.type === 'payslips');
      const bankDoc = uploaded.find(d => d.type === 'bankStatements');

      // Payslip API
      if (payslipDocs.length) {
        const payslipPayload = {
          borrowerId,
          documentType: 'SALARY_SLIP',
          documents: payslipDocs.map((doc, index) => ({
            url: doc.url,
            passCode: payslipAccessCodes[index] || '',
          })),
        };

        await fetch(`${config.baseURL}kyc-docs/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payslipPayload),
        });
      }

      // Bank Statement API
      if (bankDoc) {
        const bankStatementPayload = {
          borrowerId,
          documentType: 'BANK_STATEMENT',
          documents: [{
            url: bankDoc.url,
            passCode: bankStatementAccessCode || '',
          }],
        };
        await fetch(`${config.baseURL}kyc-docs/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bankStatementPayload),
        });
      }

      toast.success('Documents uploaded successfully!');
      localStorage.setItem('incomeVerificationCompleted', 'true');
      navigate('/bank-info');
    } catch (err) {
      toast.error('Upload failed. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const PayslipUploadArea = () => (
    <div className="space-y-3 w-[95%]">
      <label className="block text-sm font-medium text-gray-700">
        Pay Slips (Latest 6 months) <sup className="text-red-500">*</sup>
      </label>

      {files.payslips.length < 6 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-primary transition-colors">
          <input
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            id="payslips-upload"
            onChange={(e) => handlePayslipUpload(e.target.files)}
          />
          <label htmlFor="payslips-upload" className="cursor-pointer flex items-center justify-center space-x-2">
            <Upload className="h-4 w-4 text-gray-400" />
            <p className="text-xs text-gray-600">Click to upload payslips</p>
          </label>
        </div>
      )}

      {files.payslips.map((file, i) => (
        <div key={`payslip-${i}`} className="border p-2 rounded-lg border-primary space-y-2">
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-700 truncate">{file.name}</span>
            </div>
            <button onClick={() => removePayslip(i)} className="text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">
              Access Code (optional)
            </label>
            <Input
              type="text"
              placeholder="Enter access code"
              value={payslipAccessCodes[i] || ''}
              onChange={(e) => updatePayslipAccessCode(i, e.target.value)}
              className="text-xs"
            />
          </div>
        </div>
      ))}
      {errors.payslips && <p className="error-message">{errors.payslips}</p>}
    </div>
  );

  const BankStatementUploadArea = () => (
    <div className="space-y-3 w-[95%]">
      <label className="block text-sm font-medium text-gray-700">
        Bank Statement (Latest 6 months) <sup className="text-red-500">*</sup>
      </label>

      {!files.bankStatement ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            id="bankStatement-upload"
            onChange={(e) => handleBankStatementUpload(e.target.files?.[0] || null)}
          />
          <label htmlFor="bankStatement-upload" className="cursor-pointer">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-xs text-gray-600">Click to upload your bank statement</p>
          </label>
        </div>
      ) : (
        <div className="border border-primary rounded-lg p-2 space-y-2">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 truncate">{files.bankStatement.name}</span>
            </div>
            <div className="flex space-x-2">
              <button className="text-blue-500 hover:text-blue-700 text-sm" onClick={() => document.getElementById('bankStatement-upload')?.click()}>
                Change
              </button>
              <button className="text-red-500 hover:text-red-700" onClick={removeBankStatement}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">
              Access Code (optional)
            </label>
            <Input
              type="text"
              placeholder="Enter access code"
              value={bankStatementAccessCode}
              onChange={(e) => setBankStatementAccessCode(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>
      )}

      {errors.bankStatement && <p className="error-message">{errors.bankStatement}</p>}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.navbarWrapper}><Navbar /></div>
      <div className={styles.mainContainer}>
        <div className={styles.leftPanel}>
          <img src="/lovable-uploads/8f598013-7362-496b-96a6-8a285565f544.png" alt="Happy customer" className={styles.heroImage} />
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.employmentFormContainer1}>
            <div className="text-center mb-6">
              <div className={styles.heading}>Income Verification Documents</div>
              <p className={styles.description}>Upload your payslips and bank statements</p>
            </div>
            <div className={`space-y-3 ${styles.formContainer}`}>
              <PayslipUploadArea />
              <BankStatementUploadArea />
            </div>
            {errors.submit && <p className="error-message text-center mt-4">{errors.submit}</p>}
            <div className={`${styles.bottomContainer} text-center mt-6`}>
              <button onClick={handleContinue} disabled={loading} className="primary-button px-20">
                {loading ? 'Uploading...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeVerification;
