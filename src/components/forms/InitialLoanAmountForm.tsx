// src/components/forms/InitialLoanAmountForm.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { config } from '../../config/environment';
import axios from 'axios';
import axiosInstance from '@/lib/axiosInstance';

interface InitialLoanAmountFormProps {
    initialData: {
        amount: number | string;
        purpose: string;
    };
    onSubmitApplication: (data: { amount: number, purpose: string }) => void;
    onPrevious: () => void;
    loading: boolean;
}

const InitialLoanAmountForm: React.FC<InitialLoanAmountFormProps> = ({ initialData, onSubmitApplication, onPrevious, loading }) => {
    const [configData, setConfigData] = useState<any | null>([]);
    const [formData, setFormData] = useState({
        amount: typeof initialData.amount === 'number' ? initialData.amount : (initialData.amount ? parseFloat(initialData.amount) : 1000),
        purpose: initialData.purpose || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const minLoanAmount = 1000;
    const maxLoanAmount = 55000;
    const purposeOptions = [
        { value: '', label: 'Select Purpose of Borrowing' }, // Default/placeholder option
        { value: 'Home Renovation', label: 'Home Renovation' },
        { value: 'Medical Emergency', label: 'Medical Emergency' },
        { value: 'Education Expenses', label: 'Education Expenses' },
        { value: 'Wedding/Marriage', label: 'Wedding/Marriage' },
        { value: 'Business Expansion', label: 'Business Expansion' },
        { value: 'Debt Consolidation', label: 'Debt Consolidation' },
        { value: 'Vehicle Purchase', label: 'Vehicle Purchase' },
        { value: 'Travel or Vacation', label: 'Travel or Vacation' },
        { value: 'House Purchase', label: 'House Purchase' },
        { value: 'Rent Deposit', label: 'Rent Deposit' },
        { value: 'Personal Use', label: 'Personal Use' },
        { value: 'Gadget Purchase', label: 'Gadget Purchase' },
        { value: 'Home Appliance Purchase', label: 'Home Appliance Purchase' },
        { value: 'Investment', label: 'Investment' },
        { value: 'Agricultural Needs', label: 'Agricultural Needs' },
        { value: 'Construction of Property', label: 'Construction of Property' },
        { value: 'Loan Repayment', label: 'Loan Repayment' },
        { value: 'Credit Card Bill Payment', label: 'Credit Card Bill Payment' },
        { value: 'Utility Bill Payment', label: 'Utility Bill Payment' },
        { value: 'Others', label: 'Others' }
    ];

    useEffect(() => {
        let currentAmount = typeof formData.amount === 'number' ? formData.amount : minLoanAmount;
        if (currentAmount < minLoanAmount) currentAmount = minLoanAmount;
        if (currentAmount > maxLoanAmount) currentAmount = maxLoanAmount;
        setFormData(prev => ({ ...prev, amount: currentAmount }));
        fetchLoanConfig()
    }, []);


const fetchLoanConfig = async () => {
    try {
        const response = await axiosInstance.get(`${config.baseURL}loan-application/loan-config`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Axios automatically parses JSON response
        setConfigData(response.data.data);
        console.log(response.data.data);

    } catch (error) {
        let errorMessage = 'Failed to fetch loan configuration.';
        
        // Handle axios error response
        if (error.response) {
            // Server responded with error status
            const errorData = error.response.data;
            errorMessage = errorData?.message || `Request failed with status ${error.response.status}`;
        } else if (error.request) {
            // Request was made but no response received
            errorMessage = 'Network error. Please check your connection.';
        } else {
            // Something else happened
            errorMessage = error.message || errorMessage;
        }

        console.error('Error fetching loan config:', errorMessage);
        // You can add toast.error(errorMessage) if you want to show user feedback
    } finally {
        // Add any cleanup code here if needed
    }
};


    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const numericLoanAmount = parseFloat(String(formData.amount));

        if (!formData.amount.toString().trim() || isNaN(numericLoanAmount)) {
            newErrors.amount = 'Please enter the amount to be borrowed';
        } else if (numericLoanAmount <= 0) {
            newErrors.amount = 'Loan amount must be a positive number.';
        } else if (numericLoanAmount > maxLoanAmount) {
            newErrors.amount = `Loan amount cannot exceed ₹${maxLoanAmount.toLocaleString()} for initial application.`;
        }

        if (!formData.purpose.trim()) {
            newErrors.purpose = 'Please enter the purpose of borrowing';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        if (field === 'amount') {
            let numericValue = parseInt(value, 10);
            if (isNaN(numericValue)) {
                numericValue = minLoanAmount;
            }
            if (numericValue > maxLoanAmount) {
                toast.warning(`Initial loan request up to ₹${maxLoanAmount.toLocaleString()} only.`);
                numericValue = maxLoanAmount;
            }
            if (numericValue < minLoanAmount) {
                numericValue = minLoanAmount;
            }
            setFormData(prev => ({ ...prev, amount: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleFormSubmit = () => {
        if (validateForm()) {
            onSubmitApplication({
                amount: Number(formData.amount),
                purpose: formData.purpose,
            });
        } else {
            toast.error("Please fill all required fields correctly.");
        }
    };

    const commonInputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";
    const sliderPercentage = maxLoanAmount > minLoanAmount ? ((Number(formData.amount) - minLoanAmount) / (maxLoanAmount - minLoanAmount)) * 100 : 0;
    


    return (
        <div className="flex flex-col h-auto">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select the amount to be borrowed <span className="text-red-500">*</span>
                    </label>
                    <div className="text-3xl font-medium text-primary mb-4 text-center">
                        ₹{Number(formData.amount) > 0 ? Number(formData.amount).toLocaleString() : '0'}
                    </div>
                    <div className="relative mb-1">
                        <input
                            type="range"
                            min={minLoanAmount}
                            max={maxLoanAmount}
                            step="500"
                            value={Number(formData.amount)}
                            onChange={(e) => handleInputChange('amount', e.target.value)}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #5D15C1 0%, #5D15C1 ${sliderPercentage}%, #e5e7eb ${sliderPercentage}%, #e5e7eb 100%)`
                            }}
                            disabled={loading}
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>₹{minLoanAmount.toLocaleString()}</span>
                            <span>₹{maxLoanAmount.toLocaleString()}</span>
                        </div>
                    </div>
                    {errors.amount && <p className="text-red-500 text-xs mt-1 text-center">{errors.amount}</p>}
                </div>
                {/* Fee Breakdown */}
                {/* <div className="space-y-2 mb-6 text-left">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                            <span className="text-gray-600">Platform fee (inc. GST)</span>
                            <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center ml-2 text-xs text-gray-400 cursor-pointer" title="Processing fee including GST">
                                i
                            </div>
                        </div>
                        <span className="font-medium">₹ {flatFee}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Interest</span>
                        <span className="font-medium">₹ {interest}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                            <span className="text-gray-600">Loan Protection Fee</span>
                        </div>
                        <span className="font-medium">₹ {loanProtectionFee}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Processing Fee</span>
                        <span className="font-medium">₹ {loanProcessingFee}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">GST On Processing Fee</span>
                        <span className="font-medium">₹ {gstOnProcessingFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm font-medium pt-2 border-t mt-2">
                        <span className="text-gray-700">Pay total by [Due Date]</span>
                        <span className="text-gray-900">₹ {totalAmount}</span>
                    </div>

                    <div className="flex justify-between text-sm font-medium pt-1">
                        <span className="text-gray-700">Total Disbursing Amount</span>
                        <span className="text-gray-900">₹ {disbursingAmount}</span>
                    </div>
                </div> */}


                <div className='py-6'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Borrowing <span className="text-red-500">*</span></label>
                    {/* <input type="text" value={formData.purpose} onChange={(e) => handleInputChange('purpose', e.target.value)} placeholder="e.g., Medical Emergency, Education" className={`${commonInputClass} inputField`} /> */}
                    <select
                                    id="purpose"
                                    value={formData.purpose}
                                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                                    className="inputField" // Ensure this class styles select elements appropriately
                                >
                                    {purposeOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                    {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
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
                    onClick={handleFormSubmit}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none"
                >
                    {loading ? 'Saving...' : 'Submit'}
                </button>
            </div>
        </div>
    );
};

export default InitialLoanAmountForm;
