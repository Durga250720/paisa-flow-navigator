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
        bankStatement: null as File | null,
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

        if (!files.bankStatement) {
            newErrors.bankStatement = 'Bank statement is required';
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

    const handleContinue = async () => {
        if (!validateFiles()) return;

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            toast.success("Income verification documents uploaded successfully!");
            localStorage.setItem('incomeVerificationCompleted', 'true');
            navigate('/loan-amount');
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
        <div className="space-y-1 w-[95%]">
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
                            <Check className="h-3 w-3 rounded text-green-600" />
                        </div>
                        <FileText className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-700 truncate max-w-xs">
                            Pay Slip {payslipNumber}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            className="text-blue-500 hover:text-blue-700 text-xs"
                        >
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={() => removePayslip(payslipKey)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-3 w-3" />
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
            <label className="block text-sm font-medium text-gray-700">
                Bank Statement (Latest 6 months) <sup className="text-red-500">*</sup>
            </label>
            
            {!files.bankStatement ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleBankStatementUpload(e.target.files?.[0] || null)}
                        className="hidden"
                        id="bankStatement-upload"
                    />
                    <label
                        htmlFor="bankStatement-upload"
                        className="cursor-pointer"
                    >
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                            Click to upload your latest 6 months bank statement
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            PDF, JPG, PNG (Single file containing 6 months)
                        </p>
                    </label>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-1 rounded">
                            <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate max-w-xs">
                            {files.bankStatement.name}
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
