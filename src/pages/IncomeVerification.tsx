import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Upload, X, Check, FileText, Trash2 } from 'lucide-react';
import { config } from '../config/environment';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import styles from '../pages-styles/EmployemntInfo.module.css';
import {toast } from 'react-toastify';

const IncomeVerification = () => {
    const [files, setFiles] = useState<{
        payslips: File[];
        bankStatement: File | null,
    }>({
        payslips: [],
        bankStatement: null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // --- AWS S3 Setup ---
    // This setup is at the module level, created once.
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

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            navigate('/');
        } 
    }, [navigate]);

    const validateFiles = () => {
        const newErrors: Record<string, string> = {};

        if (files.payslips.length === 0) {
            newErrors.payslips = 'At least one payslip is required. Upload up to 6 files.';
        } else if (files.payslips.length > 6) {
            // This should ideally be prevented by the upload handler
            newErrors.payslips = 'You can upload a maximum of 6 payslips.';
        }

        if (!files.bankStatement) {
            newErrors.bankStatement = 'Bank statement is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayslipUpload = (selectedFilesList: FileList | null) => {
        if (!selectedFilesList) return;

        const newFilesArray = Array.from(selectedFilesList);
        let currentPayslips = files.payslips;
        const localValidationErrors: string[] = [];

        if (currentPayslips.length + newFilesArray.length > 6) {
            toast.error("You can upload a maximum of 6 payslips.");
            setErrors(prev => ({ ...prev, payslips: "Maximum 6 payslips allowed." }));
            return;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        const validNewUploads: File[] = [];

        for (const file of newFilesArray) {
            if (!allowedTypes.includes(file.type)) {
                localValidationErrors.push(`File "${file.name}" has an invalid type. Only PDF, JPG, PNG allowed.`);
            } else {
                validNewUploads.push(file);
            }
        }

        if (localValidationErrors.length > 0) {
            setErrors(prev => ({ ...prev, payslips: localValidationErrors.join(' ') }));
        } else {
            setErrors(prev => ({ ...prev, payslips: '' }));
        }

        setFiles(prev => ({ ...prev, payslips: [...prev.payslips, ...validNewUploads].slice(0, 6) }));
    };

    const removePayslip = (indexToRemove: number) => {
        setFiles(prev => ({ ...prev, payslips: prev.payslips.filter((_, index) => index !== indexToRemove) }));
    };

    const handleBankStatementUpload = (selectedFile: File | null) => {
        if (!selectedFile) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setErrors(prev => ({
                ...prev,
                bankStatement: 'Only PDF, JPG, and PNG files are allowed'
            }));
            return;
        }

        setFiles(prev => ({
            ...prev,
            bankStatement: selectedFile
        }));

        if (errors.bankStatement) {
            setErrors(prev => ({ ...prev, bankStatement: '' }));
        }
    };

    const removeBankStatement = () => {
        setFiles(prev => ({
            ...prev,
            bankStatement: null
        }));
    };

    const getBorrowerId = (): string | null => {
        return localStorage.getItem('authToken');
    };

    const handleContinue = async () => {
        if (!validateFiles()) {
            toast.error("Please correct the form errors before proceeding.");
            return;
        }

        const borrowerId = getBorrowerId();


        setLoading(true);
        const uploadedFileDetails: {fileName: string, url: string, type: string}[] = [];
        
        const userName = localStorage.getItem('name');
        if (!userName) {
            toast.error("User name not found. Cannot create user-specific folder.");
            setLoading(false);
            return;
        }
        if (!borrowerId) {
            toast.error("Authentication token not found. Please log in again.");
            setLoading(false);
            navigate('/'); // Or appropriate login page
            return;
        }

        // Sanitize userName to be S3 path friendly (optional, but good practice)
        const sanitizedUserName = userName.replace(/[^a-zA-Z0-9_-]/g, '_');

        try {
            const filesToUploadPromises: Promise<{fileName: string, url: string, type: string}>[] = [];

            // Collect payslips for upload from the payslips array
            for (const file of files.payslips) {
                filesToUploadPromises.push(uploadFileToS3(file, 'payslips', sanitizedUserName));
            }

            // Collect bank statement for upload
            if (files.bankStatement) {
                filesToUploadPromises.push(uploadFileToS3(files.bankStatement, 'bankStatements', sanitizedUserName));
            }

            if (filesToUploadPromises.length === 0) {
                toast.info("No files selected for upload.");
                setLoading(false);
                return;
            }

            const results = await Promise.all(filesToUploadPromises);
            results.forEach(result => uploadedFileDetails.push(result));
            
            const payslipUploads = uploadedFileDetails
                .filter(f => f.type === 'payslips')
                .map(f => ({ fileName: f.fileName, url: f.url }));

            const bankStatementUploads = uploadedFileDetails
                .filter(f => f.type === 'bankStatements')
                .map(f => ({ fileName: f.fileName, url: f.url }));

            // --- API Calls to Backend ---
            // 1. API call for Payslips
            if (payslipUploads.length > 0) {
                const payslipPayload = {
                    borrowerId: borrowerId,
                    documents: payslipUploads.map(p => p.url),
                    documentType: "SALARY_SLIP"
                };
                console.log('Submitting Payslip Data:', payslipPayload);
                try {
                    const response = await fetch(`${config.baseURL}kyc-docs/add`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payslipPayload),
                    });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: 'Failed to submit payslip documents to backend.' }));
                        throw new Error(errorData.message || 'Failed to submit payslip documents.');
                    }
                    console.log('Payslip documents submitted successfully:', await response.json());
                } catch (apiError) {
                    const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error submitting payslips.';
                    throw new Error(`API Error (Payslips): ${errorMessage}`);
                }
            }

            // 2. API call for Bank Statement
            if (bankStatementUploads.length > 0) { // Should be exactly one
                const bankStatementPayload = {
                    borrowerId: borrowerId,
                    documents: bankStatementUploads.map(b => b.url), // This will be an array with one URL
                    documentType: "BANK_STATEMENT"
                };
                console.log('Submitting Bank Statement Data:', bankStatementPayload);
                try {
                    const response = await fetch(`${config.baseURL}kyc-docs/add`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bankStatementPayload),
                    });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: 'Failed to submit bank statement to backend.' }));
                        throw new Error(errorData.message || 'Failed to submit bank statement.');
                    }
                } catch (apiError) {
                    const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error submitting bank statement.';
                    throw new Error(`API Error (Bank Statement): ${errorMessage}`);
                }
            }
            // --- End API Calls ---

            // console.log('Uploaded Payslip URLs:', payslipUploads.map(f => f.url));
            // console.log('Uploaded Payslip Details (name and URL):', payslipUploads);
            // console.log('Uploaded Bank Statement URLs:', bankStatementUploads.map(f => f.url));
            // console.log('Uploaded Bank Statement Details (name and URL):', bankStatementUploads);
            toast.success("Income verification documents uploaded successfully!");
            localStorage.setItem('incomeVerificationCompleted', 'true');
            navigate('/bank-info');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload documents. Please try again.';
            setErrors(prev => ({ ...prev, submit: errorMessage }));
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const PayslipUploadArea = () => (
        <div className="space-y-3 w-[95%]">
            <label className="block text-sm font-medium text-gray-700">
                Pay Slips (Latest 6 months, up to 6 files) <sup className="text-red-500">*</sup>
            </label>

            {/* Input for uploading files */}
            {files.payslips.length < 6 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-primary transition-colors">
                    <input
                        type="file"
                        accept=".pdf"
                        multiple // Allow multiple file selection
                        onChange={(e) => handlePayslipUpload(e.target.files)}
                        className="hidden"
                        id="payslips-upload"
                    />
                    <label
                        htmlFor="payslips-upload"
                        className="cursor-pointer flex items-center justify-center space-x-2"
                    >
                        <Upload className="h-4 w-4 text-gray-400" />
                        <p className="text-xs text-gray-600">
                            Click to upload payslips (PDF, JPG, PNG)
                        </p>
                    </label>
                </div>
            )}

            {/* Display uploaded payslips */}
            {files.payslips.length > 0 && (
                <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-500">Uploaded Payslips ({files.payslips.length}/6):</p>
                    {files.payslips.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="text-xs text-gray-700 truncate max-w-xs" title={file.name}>
                                    {file.name}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removePayslip(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {errors.payslips && (
                <p className="error-message">{errors.payslips}</p>
            )}
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
                        onChange={(e) => handleBankStatementUpload(e.target.files?.[0] || null)}
                        className="hidden"
                        id="bankStatement-upload"
                    />
                    <label
                        htmlFor="bankStatement-upload"
                        className="cursor-pointer"
                    >
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-600">
                            Click to upload your latest 6 months bank statement
                        </p>
                    </label>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center space-x-2">
                        {/* <div className="bg-green-100 p-1 rounded">
                            <Check className="h-4 w-4 text-green-600" />
                        </div> */}
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate max-w-xs" title={files.bankStatement.name}>
                            {files.bankStatement.name}
                        </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                            type="button"
                            className="text-blue-500 hover:text-blue-700 text-sm"
                            onClick={() => document.getElementById('bankStatement-upload')?.click()}
                        >
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={removeBankStatement}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {errors.bankStatement && (
                <p className="error-message">{errors.bankStatement}</p>
            )}
        </div>
    );

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

                {/* Right Panel - Income Verification Form */}
                <div className={styles.rightPanel}>
                    <div className={styles.employmentFormContainer1}>
                        <div className="text-center mb-6">
                            <div className={styles.heading}>Income Verification Documents</div>
                            <p className={styles.description}>
                                Upload your payslips and bank statements to verify your income
                            </p>
                        </div>

                        <div className={`space-y-3 ${styles.formContainer}`}>
                            {/* Unified Payslip Upload Area */}
                            <PayslipUploadArea />

                            {/* Bank Statement Upload Area */}
                            <BankStatementUploadArea />
                        </div>

                        {errors.submit && (
                            <p className="error-message text-center mt-4">{errors.submit}</p>
                        )}

                        <div className={`${styles.bottomContainer} text-center mt-6`}>
                            <button
                                onClick={handleContinue}
                                disabled={loading}
                                className="primary-button px-20"
                            >
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
