
// src/components/forms/IncomeVerificationForm.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Upload, X, FileText, Trash2, Check } from 'lucide-react';
import { config } from '../../config/environment'; // Adjust path as needed
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { Input } from '../ui/input';

interface IncomeVerificationFormProps {
    onNext: (data: { 
        paySlipsUrls: { url: string, passCode: string }[], 
        bankStatementUrl: { url: string, passCode: string } | null 
    }) => void;
    onPrevious: () => void;
    loading: boolean;
}

// --- AWS S3 Setup (Consider moving to a shared utility if used elsewhere) ---
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

const uploadFileToS3 = async (file: File, pathPrefix: string, userName: string): Promise<{ fileName: string, url: string, type: string }> => {
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
// --- End AWS S3 Setup ---

const IncomeVerificationForm: React.FC<IncomeVerificationFormProps> = ({ onNext, onPrevious, loading }) => {
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

    const validateFiles = () => {
        const newErrors: Record<string, string> = {};
        if (files.payslips.length === 0) {
            newErrors.payslips = 'At least one payslip is required (up to 6).';
        }
        if (!files.bankStatement) {
            newErrors.bankStatement = 'Bank statement is required.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayslipUpload = useCallback((selectedFilesList: FileList | null) => {
        if (!selectedFilesList) return;
        const newFilesArray = Array.from(selectedFilesList);
        if (files.payslips.length + newFilesArray.length > 6) {
            toast.warning("Maximum 6 payslips allowed.");
            return;
        }

        setFiles(prev => ({ ...prev, payslips: [...prev.payslips, ...newFilesArray].slice(0, 6) }));
        
        // Add empty access codes for new files
        setPayslipAccessCodes(prev => {
            const newCodes = [...prev];
            for (let i = 0; i < newFilesArray.length; i++) {
                newCodes.push('');
            }
            return newCodes.slice(0, 6);
        });

        if (errors.payslips) setErrors(prev => ({ ...prev, payslips: '' }));
    }, [files.payslips.length, errors.payslips]);

    const removePayslip = useCallback((indexToRemove: number) => {
        setFiles(prev => ({ ...prev, payslips: prev.payslips.filter((_, index) => index !== indexToRemove) }));
        setPayslipAccessCodes(prev => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    const handleBankStatementUpload = useCallback((selectedFile: File | null) => {
        if (!selectedFile) return;
        setFiles(prev => ({ ...prev, bankStatement: selectedFile }));
        if (errors.bankStatement) setErrors(prev => ({ ...prev, bankStatement: '' }));
    }, [errors.bankStatement]);

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

    const handleSubmit = async () => {
        if (!validateFiles()) {
            toast.error("Please upload all required documents.");
            return;
        }

        const userName = localStorage.getItem('name');
        if (!userName) {
            toast.error("User information not found. Cannot upload files.");
            return;
        }
        const sanitizedUserName = userName.replace(/[^a-zA-Z0-9_-]/g, '_');

        const uploadPromises: Promise<{ fileName: string, url: string, type: string }>[] = [];

        files.payslips.forEach(file => {
            uploadPromises.push(uploadFileToS3(file, 'payslips', sanitizedUserName));
        });

        if (files.bankStatement) {
            uploadPromises.push(uploadFileToS3(files.bankStatement, 'bankStatements', sanitizedUserName));
        }

        try {
            const results = await Promise.all(uploadPromises);
            const paySlipsResults = results.filter(r => r.type === 'payslips');
            const bankStatementResult = results.find(r => r.type === 'bankStatements');

            // Format payslips with access codes
            const paySlipsUrls = paySlipsResults.map((result, index) => ({
                url: result.url,
                passCode: payslipAccessCodes[index] || ''
            }));

            // Format bank statement with access code
            const bankStatementUrl = bankStatementResult ? {
                url: bankStatementResult.url,
                passCode: bankStatementAccessCode || ''
            } : null;

            onNext({ 
                paySlipsUrls,
                bankStatementUrl,
            });
        } catch (error: any) {
            toast.error(`Upload failed: ${error.message}`);
            console.error("Upload error:", error);
        }
    };
    const commonInputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";

    return (
        <div className="flex flex-col h-full"> 
            <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                {/* Payslip Upload Area */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Pay Slips (Latest 6 months, PDF/JPG/PNG) <span className="text-red-500">*</span>
                    </label>
                    {files.payslips.length < 6 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                onChange={(e) => handlePayslipUpload(e.target.files)}
                                className="hidden"
                                id="payslips-upload-modal"
                            />
                            <label htmlFor="payslips-upload-modal" className="cursor-pointer flex items-center justify-center space-x-2">
                                <Upload className="h-5 w-5 text-gray-500" /> 
                                <span className="text-sm text-gray-600">Click to upload payslips</span>
                            </label>
                        </div>
                    )}
                    {files.payslips.map((file, index) => (
                        <div key={`payslip-${index}`} className="border p-2 rounded-lg border-primary space-y-2">
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md border">
                                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-700 truncate" title={file.name}>{file.name}</span>
                                <button onClick={() => removePayslip(index)} className="ml-2 text-red-500 hover:text-red-700">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">
                                    Access Code (optional)
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Enter access code"
                                    value={payslipAccessCodes[index] || ''}
                                    onChange={(e) => updatePayslipAccessCode(index, e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                        </div>
                    ))}
                    {errors.payslips && <p className="text-red-500 text-xs mt-1">{errors.payslips}</p>}
                </div>

                {/* Bank Statement Upload Area */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Bank Statement (Latest 6 months, PDF/JPG/PNG) <span className="text-red-500">*</span>
                    </label>
                    {!files.bankStatement ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleBankStatementUpload(e.target.files?.[0] || null)}
                                className="hidden"
                                id="bankstatement-upload-modal"
                            />
                            <label htmlFor="bankstatement-upload-modal" className="cursor-pointer flex items-center justify-center space-x-2"> 
                                <Upload className="h-5 w-5 text-gray-500" />
                                <span className="text-sm text-gray-600">Click to upload bank statement</span>
                            </label>
                        </div>
                    ) : (
                        <div className="border p-2 rounded-lg border-primary space-y-2">
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md border">
                                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-700 truncate" title={files.bankStatement.name}>{files.bankStatement.name}</span>
                                <button onClick={removeBankStatement} className="ml-2 text-red-500 hover:text-red-700">
                                    <Trash2 size={18} />
                                </button>
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
                                    className="text-sm" // Consider applying commonInputClass if needed
                                />
                            </div>
                        </div>
                    )}
                    {errors.bankStatement && <p className="text-red-500 text-xs mt-1">{errors.bankStatement}</p>}
                </div>
            </div>

            <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t"> 
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none"
                >
                    Previous
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none"
                >
                    {loading ? 'Uploading...' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default IncomeVerificationForm;
