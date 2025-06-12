// src/components/forms/EmploymentInfoForm.tsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';

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
        totalExperienceInMonths: initialData.totalExperienceInMonths ? Number(initialData.totalExperienceInMonths) / 12 : '' // Convert months to years for display if needed, or keep as months
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

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


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
                totalExperienceInMonths: Number(formData.totalExperienceInMonths) * 12 // Assuming input is in years, convert to months for payload
            });
        } else {
            toast.error("Please fill all required fields correctly.");
        }
    };

    return (
        <div className="flex flex-col h-full"> 
            <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                <div className='form-group'> 
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
                </div>

                <div className='form-group'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry <span className="text-red-500">*</span></label>
                    <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary inputField"
                    >
                        <option value="">Select Industry</option>
                        <option value="IT_SOFTWARE">Information Technology</option>
                        <option value="BANKING_FINANCE">Banking & Finance</option>
                        <option value="HEALTHCARE">Healthcare</option>
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
                        value={formData.totalExperienceInMonths} // Assuming this field now takes years
                        onChange={(e) => handleInputChange('totalExperienceInMonths', e.target.value)}
                        placeholder="Enter Work Experience in Years"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary inputField"
                    />
                    {errors.totalExperienceInMonths && <p className="text-red-500 text-xs mt-1">{errors.totalExperienceInMonths}</p>}
                </div>
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
