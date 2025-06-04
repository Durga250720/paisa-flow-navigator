import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Upload, X, Check, FileText, Trash2 } from 'lucide-react';
import { config } from '../config/environment';
import styles from '../pages-styles/EmployemntInfo.module.css';
import { toast } from "sonner";

const IncomeVerification = () => {
    const [files, setFiles] = useState({
        payslip1: null as File | null,
        payslip2: null as File | null,
        payslip3: null as File | null,
        payslip4: null as File | null,
        payslip5: null as File | null,
        payslip6: null as File | null,
        bankStatements: [] as File[],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            navigate('/');
        } 
    }, [navigate]);

    const validateFiles = () => {
        const newErrors: Record<string, string> = {};

        // Check if at least one payslip is uploaded
        const hasPayslips = Object.values(files).slice(0, 6).some(file => file !== null);
        if (!hasPayslips) {
            newErrors.payslips = 'At least one payslip is required';
        }

        if (files.bankStatements.length === 0) {
            newErrors.bankStatements = 'At least one bank statement is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayslipUpload = (payslipKey: string, selectedFile: File | null) => {
        if (!selectedFile) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setErrors(prev => ({
                ...prev,
                [payslipKey]: 'Only PDF, JPG, and PNG files are allowed'
            }));
            return;
        }

        setFiles(prev => ({
            ...prev,
            [payslipKey]: selectedFile
        }));

        if (errors[payslipKey]) {
            setErrors(prev => ({ ...prev, [payslipKey]: '' }));
        }
        
        // Clear general payslips error if exists
        if (errors.payslips) {
            setErrors(prev => ({ ...prev, payslips: '' }));
        }
    };

    const removePayslip = (payslipKey: string) => {
        setFiles(prev => ({
            ...prev,
            [payslipKey]: null
        }));
    };

    const handleBankStatementUpload = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const maxFiles = 6;
        const currentFiles = files.bankStatements;
        const newFiles = Array.from(selectedFiles);

        if (currentFiles.length + newFiles.length > maxFiles) {
            setErrors(prev => ({
                ...prev,
                bankStatements: `Maximum ${maxFiles} files allowed`
            }));
            return;
        }

        // Validate file types
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        const invalidFiles = newFiles.filter(file => !allowedTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            setErrors(prev => ({
                ...prev,
                bankStatements: 'Only PDF, JPG, and PNG files are allowed'
            }));
            return;
        }

        setFiles(prev => ({
            ...prev,
            bankStatements: [...prev.bankStatements, ...newFiles]
        }));

        if (errors.bankStatements) {
            setErrors(prev => ({ ...prev, bankStatements: '' }));
        }
    };

    const removeBankStatement = (index: number) => {
        setFiles(prev => ({
            ...prev,
            bankStatements: prev.bankStatements.filter((_, i) => i !== index)
        }));
    };

    const handleContinue = async () => {
        if (!validateFiles()) return;

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            toast.success("Income verification documents uploaded successfully!");
            localStorage.setItem('incomeVerificationCompleted', 'true');
            navigate('/employment-info');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload documents. Please try again.';
            setErrors({ submit: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const PayslipUploadArea = ({ 
        payslipKey, 
        payslipNumber,
        file
    }: { 
        payslipKey: string;
        payslipNumber: number;
        file: File | null;
    }) => (
        <div className="space-y-3 w-[95%]">
            <label className="block text-sm font-medium text-gray-700">
                Pay slip {payslipNumber} <sup className="text-red-500">*</sup>
            </label>
            
            {!file ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-primary transition-colors">
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handlePayslipUpload(payslipKey, e.target.files?.[0] || null)}
                        className="hidden"
                        id={`${payslipKey}-upload`}
                    />
                    <label
                        htmlFor={`${payslipKey}-upload`}
                        className="cursor-pointer flex items-center justify-center space-x-2"
                    >
                        <Upload className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                            Please upload your payslip here.
                        </p>
                    </label>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-1 rounded">
                            <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate max-w-xs">
                            Pay Slip {payslipNumber}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={() => removePayslip(payslipKey)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {errors[payslipKey] && (
                <p className="error-message">{errors[payslipKey]}</p>
            )}
        </div>
    );

    const BankStatementUploadArea = () => (
        <div className="space-y-3 w-[95%]">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    Bank Statements (Up to 6 months) <sup className="text-red-500">*</sup>
                </label>
                <span className="text-xs text-gray-500">
                    {files.bankStatements.length}/6 files
                </span>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleBankStatementUpload(e.target.files)}
                    className="hidden"
                    id="bankStatements-upload"
                    disabled={files.bankStatements.length >= 6}
                />
                <label
                    htmlFor="bankStatements-upload"
                    className={`cursor-pointer ${files.bankStatements.length >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                        {files.bankStatements.length >= 6 
                            ? 'Maximum 6 files uploaded'
                            : 'Click to upload or drag and drop'
                        }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, PNG (Max 6 files)
                    </p>
                </label>
            </div>

            {files.bankStatements.length > 0 && (
                <div className="space-y-2">
                    {files.bankStatements.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-700 truncate max-w-xs">
                                    {file.name}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeBankStatement(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {errors.bankStatements && (
                <p className="error-message">{errors.bankStatements}</p>
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

                        <div className={`space-y-6 ${styles.formContainer}`}>
                            {/* Individual Payslip Upload Areas */}
                            <PayslipUploadArea payslipKey="payslip1" payslipNumber={1} file={files.payslip1} />
                            <PayslipUploadArea payslipKey="payslip2" payslipNumber={2} file={files.payslip2} />
                            <PayslipUploadArea payslipKey="payslip3" payslipNumber={3} file={files.payslip3} />
                            <PayslipUploadArea payslipKey="payslip4" payslipNumber={4} file={files.payslip4} />
                            <PayslipUploadArea payslipKey="payslip5" payslipNumber={5} file={files.payslip5} />
                            <PayslipUploadArea payslipKey="payslip6" payslipNumber={6} file={files.payslip6} />

                            {errors.payslips && (
                                <p className="error-message">{errors.payslips}</p>
                            )}

                            {/* Bank Statements Upload Area */}
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
                                {loading ? 'Uploading...' : 'Check Eligibility'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomeVerification;
