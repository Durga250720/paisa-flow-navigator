// src/components/forms/EmploymentInfoForm.tsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import OTPInput from '../OTPInput';
import { config } from '../../config/environment';

interface EmploymentInfoFormProps {
    initialData: {
        employmentType: string;
        industry: string;
        companyName: string;
        designation: string; // Changed from jobRole to match payload
        takeHomeSalary: number | string; // Changed from monthlyIncome
        totalExperienceInMonths: number | string; // Changed from workExperience
    };
    onNext: (data: any) => void;
    onCancel: () => void;
    loading: boolean;
}

const EmploymentInfoForm: React.FC<EmploymentInfoFormProps> = ({ initialData, onNext, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        employmentType: initialData.employmentType || '',
        industry: initialData.industry || '',
        companyName: initialData.companyName || '',
        designation: initialData.designation || '',
        takeHomeSalary: initialData.takeHomeSalary || '',
        totalExperienceInMonths: initialData.totalExperienceInMonths ? Number(initialData.totalExperienceInMonths) / 12 : '', // Convert months to years for display if needed, or keep as months
        officialEmail: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.designation.trim()) newErrors.designation = 'Job role/designation is required';
        if (!formData.takeHomeSalary.toString().trim()) newErrors.takeHomeSalary = 'Monthly income is required';
        else if (isNaN(Number(formData.takeHomeSalary)) || Number(formData.takeHomeSalary) <= 0) newErrors.takeHomeSalary = 'Please enter a valid income';
        if (!formData.totalExperienceInMonths.toString().trim()) newErrors.totalExperienceInMonths = 'Work experience is required';
        else if (isNaN(Number(formData.totalExperienceInMonths)) || Number(formData.totalExperienceInMonths) < 0) newErrors.totalExperienceInMonths = 'Please enter valid experience';
        if (!formData.officialEmail.trim()) newErrors.officialEmail = 'Company email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail)) newErrors.officialEmail = 'Please enter a valid email';
        if (!otpVerified && otpSent) newErrors.otp = 'Please verify your email with OTP';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOTP = async () => {
        if (!formData.officialEmail.trim()) {
            setErrors(prev => ({ ...prev, officialEmail: 'Company email is required' }));
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail)) {
            setErrors(prev => ({ ...prev, officialEmail: 'Please enter a valid email' }));
            return;
        }


        const emailDomain = formData.officialEmail.split('@')[1]?.toLowerCase();
        const authToken = localStorage.getItem('authToken');
        try {
            // Simulate OTP sending - replace with actual API call
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
            //   setShowOtpInput(true);
            //   setResendTimer(30);
            setOtpSent(true);
            toast.success('OTP sent to your company email');
        } catch (error) {
            toast.error('Failed to send OTP. Please try again.');
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP');
            return;
        }

        const authToken = localStorage.getItem('authToken');
        try {
            // Simulate OTP verification - replace with actual API call
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
            setOtpVerified(true);
            setOtpError('');
            toast.success('Email verified successfully');
        } catch (error) {
            setOtpError('Invalid OTP. Please try again.');
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleFormSubmit = () => {
        if (validateForm()) {
            onNext({
                employmentType: formData.employmentType,
                industry: formData.industry,
                companyName: formData.companyName,
                designation: formData.designation,
                takeHomeSalary: Number(formData.takeHomeSalary),
                totalExperienceInMonths: Number(formData.totalExperienceInMonths) * 12, // Assuming input is in years, convert to months for payload
                officialEmail: formData.officialEmail
            });
        } else {
            toast.error("Please fill all required fields correctly.");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                {/* <div className='form-group'> 
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type <span className="text-red-500">*</span></label>
                    <select
                        value={formData.employmentType}
                        onChange={(e) => handleInputChange('employmentType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary inputField"
                    >
                        <option value="">Select Employment Type</option>
                        <option value="SALARIED">Salaried</option>
                        <option value="SELF_EMPLOYED">Self Employed</option>
                    </select>
                    {errors.employmentType && <p className="text-red-500 text-xs mt-1">{errors.employmentType}</p>}
                </div> */}

                <div className='form-group'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry <span className="text-red-500">*</span></label>
                    <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary inputField"
                    >
                        <option value="">Select Industry</option>
                        <option value="it">Information Technology</option>
                        <option value="banking">Banking & Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="education">Education</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        {/* Add other industries */}
                    </select>
                    {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
                </div>

                <div className='form-group'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter Company Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary inputField"
                    />
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>

                <div className='form-group'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Role / Designation <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                        placeholder="Enter Job Role"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary inputField"
                    />
                    {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
                </div>

                <div className='form-group'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (Take-Home) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        value={formData.takeHomeSalary}
                        onChange={(e) => handleInputChange('takeHomeSalary', e.target.value)}
                        placeholder="Enter Monthly Income"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary inputField"
                    />
                    {errors.takeHomeSalary && <p className="text-red-500 text-xs mt-1">{errors.takeHomeSalary}</p>}
                </div>

                <div className='form-group'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Experience (Years) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        value={formData.totalExperienceInMonths}
                        onChange={(e) => handleInputChange('totalExperienceInMonths', e.target.value)}
                        placeholder="Enter Work Experience in Years"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary inputField"
                    />
                    {errors.totalExperienceInMonths && <p className="text-red-500 text-xs mt-1">{errors.totalExperienceInMonths}</p>}
                </div>

                <div className='form-group'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Email ID <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={formData.officialEmail}
                            onChange={(e) => handleInputChange('officialEmail', e.target.value)}
                            placeholder="Enter Company Email"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary inputField"
                            disabled={otpVerified}
                        />
                        {!otpVerified && (
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                disabled={!formData.officialEmail || otpSent}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none disabled:bg-gray-400"
                            >
                                {otpSent ? 'OTP Sent' : 'Send OTP'}
                            </button>
                        )}
                        {otpVerified && (
                            <span className="px-4 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-md">
                                Verified ✓
                            </span>
                        )}
                    </div>
                    {errors.companyEmail && <p className="text-red-500 text-xs mt-1">{errors.companyEmail}</p>}
                </div>

                {otpSent && !otpVerified && (
                    <div className='form-group'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP <span className="text-red-500">*</span></label>
                        <div className="space-y-3">
                            <OTPInput
                                length={6}
                                onComplete={setOtp}
                                error={otpError}
                            />
                            <button
                                type="button"
                                onClick={handleVerifyOTP}
                                disabled={otp.length !== 6}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none disabled:bg-gray-400"
                            >
                                Verify OTP
                            </button>
                        </div>
                        {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
                    </div>
                )}
            </div>
            {/* This div will be the fixed footer for buttons */}
            <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t"> {/* Adjusted classes for fixed footer */}
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleFormSubmit}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none"
                >
                    {loading ? 'Saving...' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default EmploymentInfoForm;
