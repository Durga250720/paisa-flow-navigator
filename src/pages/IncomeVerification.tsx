
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Upload, X, Check } from 'lucide-react';
import { config } from '../config/environment';
import styles from '../pages-styles/EmployemntInfo.module.css';
import { toast } from "sonner";

const IncomeVerification = () => {
    const [files, setFiles] = useState({
        payslips: [] as File[],
        bankStatements: [] as File[],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const bankInfoCompleted = localStorage.getItem('bankInfoCompleted');

        if (!authToken) {
            navigate('/');
        } else if (!bankInfoCompleted) {
            navigate('/bank-info');
        }
    }, [navigate]);

    const validateFiles = () => {
        const newErrors: Record<string, string> = {};

        if (files.payslips.length === 0) {
            newErrors.payslips = 'At least one payslip is required';
        }

        if (files.bankStatements.length === 0) {
            newErrors.bankStatements = 'At least one bank statement is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileUpload = (fileType: 'payslips' | 'bankStatements', selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const maxFiles = fileType === 'payslips' ? 6 : 6;
        const currentFiles = files[fileType];
        const newFiles = Array.from(selectedFiles);

        if (currentFiles.length + newFiles.length > maxFiles) {
            setErrors(prev => ({
                ...prev,
                [fileType]: `Maximum ${maxFiles} files allowed`
            }));
            return;
        }

        // Validate file types
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        const invalidFiles = newFiles.filter(file => !allowedTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            setErrors(prev => ({
                ...prev,
                [fileType]: 'Only PDF, JPG, and PNG files are allowed'
            }));
            return;
        }

        setFiles(prev => ({
            ...prev,
            [fileType]: [...prev[fileType], ...newFiles]
        }));

        if (errors[fileType]) {
            setErrors(prev => ({ ...prev, [fileType]: '' }));
        }
    };

    const removeFile = (fileType: 'payslips' | 'bankStatements', index: number) => {
        setFiles(prev => ({
            ...prev,
            [fileType]: prev[fileType].filter((_, i) => i !== index)
        }));
    };

    const handleContinue = async () => {
        if (!validateFiles()) return;

        setLoading(true);
        try {
            // Here you would implement the file upload logic
            // For now, we'll just simulate the process
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

    const FileUploadArea = ({ 
        fileType, 
        title, 
        maxFiles, 
        currentFiles 
    }: { 
        fileType: 'payslips' | 'bankStatements';
        title: string;
        maxFiles: number;
        currentFiles: File[];
    }) => (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    {title} <sup className="text-red-500">*</sup>
                </label>
                <span className="text-xs text-gray-500">
                    {currentFiles.length}/{maxFiles} files
                </span>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(fileType, e.target.files)}
                    className="hidden"
                    id={`${fileType}-upload`}
                    disabled={currentFiles.length >= maxFiles}
                />
                <label
                    htmlFor={`${fileType}-upload`}
                    className={`cursor-pointer ${currentFiles.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                        {currentFiles.length >= maxFiles 
                            ? `Maximum ${maxFiles} files uploaded`
                            : `Click to upload or drag and drop`
                        }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, PNG (Max {maxFiles} files)
                    </p>
                </label>
            </div>

            {currentFiles.length > 0 && (
                <div className="space-y-2">
                    {currentFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-700 truncate max-w-xs">
                                    {file.name}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(fileType, index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {errors[fileType] && (
                <p className="error-message">{errors[fileType]}</p>
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

                        <div className={`space-y-6 ${styles.formContainer1}`}>
                            <FileUploadArea
                                fileType="payslips"
                                title="Payslips"
                                maxFiles={6}
                                currentFiles={files.payslips}
                            />

                            <FileUploadArea
                                fileType="bankStatements"
                                title="Bank Statements (Up to 6 months)"
                                maxFiles={6}
                                currentFiles={files.bankStatements}
                            />
                        </div>

                        {errors.submit && (
                            <p className="error-message text-center mt-4">{errors.submit}</p>
                        )}

                        <div className={`${styles.bottomContainer} text-center mt-6`}>
                            <button
                                onClick={handleContinue}
                                disabled={loading || (files.payslips.length === 0 && files.bankStatements.length === 0)}
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
