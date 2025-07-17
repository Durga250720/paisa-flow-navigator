// src/components/forms/BankInfoForm.tsx
import { config } from '@/config/environment';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface BankInfoFormProps {
    initialData: {
        bankName: string;
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
    };
    onNext: (data: any) => void;
    onPrevious: () => void;
    loading: boolean;
}

const indianBanks = [
    { value: "", label: "Select Bank Name" },
    { value: "State Bank Of India", label: "State Bank of India" },
    { value: "HDFC", label: "HDFC Bank" },
    { value: "ICICI", label: "ICICI Bank" },
    { value: "Panjab National Bank", label: "Punjab National Bank" },
    { value: "Kotak Mahindra Bank", label: "Kotak Mahindra Bank" },
    { value: "Axis", label: "Axis Bank" },
    { value: "Bank Of Baroda", label: "Bank of Baroda" },
    { value: "Bank Of India", label: "Bank of India" },
    { value: "Canara", label: "Canara Bank" },
    { value: "Union Bank Of India", label: "Union Bank of India" },
    { value: "IDBI", label: "IDBI Bank" },
    { value: "Indian Bank", label: "Indian Bank" },
    { value: "Central Bank Of India", label: "Central Bank of India" },
    { value: "Indian Overseas Bank", label: "Indian Overseas Bank" },
    { value: "UCO Bank", label: "UCO Bank" },
    { value: "Bank Of Maharashtra", label: "Bank of Maharashtra" },
    { value: "Yes Bank", label: "Yes Bank" },
    { value: "IndusInd Bank", label: "IndusInd Bank" },
    { value: "Fedaral Bank", label: "Federal Bank" },
    { value: "Karnataka Bank", label: "Karnataka Bank" },
    { value: "IDFC First Bank", label: "IDFC First Bank" },
    // { value: "IDFC First Bank", label: "IDFC First Bank" }, // Duplicate
    { value: "CSB Bank", label: "CSB Bank" },
    { value: "DCB Bank", label: "DCB Bank" },
    { value: "Dhanlaxmi Bank", label: "Dhanlaxmi Bank" },
    { value: "Karur Vysya Bank", label: "Karur Vysya Bank" },
    { value: "RBL Bank", label: "RBL Bank" }
];

const BankInfoForm: React.FC<BankInfoFormProps> = ({ initialData, onNext, onPrevious, loading }) => {

    const [getBankDetails, setIsBankDetails] = useState<any>();
    const [internalLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        bankName: initialData.bankName || '',
        accountNumber: initialData.accountNumber || '',
        reEnterAccountNumber: initialData.accountNumber || '', // Pre-fill if editing
        ifscCode: initialData.ifscCode || '',
        accountHolderName: initialData.accountHolderName || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.bankName) newErrors.bankName = 'Please select your bank name';
        if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Bank account number is required';
        else if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) newErrors.accountNumber = 'Account number should be 9-18 digits';
        if (!formData.reEnterAccountNumber.trim()) newErrors.reEnterAccountNumber = 'Please re-enter bank account number';
        else if (formData.accountNumber !== formData.reEnterAccountNumber) newErrors.reEnterAccountNumber = 'Account numbers do not match';
        if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) newErrors.ifscCode = 'Please enter a valid IFSC code';
        if (!formData.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        fetchExistingBankDetails()
    }, [])

    const fetchExistingBankDetails = async () => {
        setIsLoading(true)
        const authToken = localStorage.getItem('authToken')
        try {
            const response = await fetch(`${config.baseURL}bank-detail/${authToken}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const results = await response.json();
            setIsBankDetails(results.data)
            setIsLoading(false);
        } catch (error) {
            toast.error(`${error.message}`);
            setIsLoading(false);
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleFormSubmit = async () => {
        if (validateForm()) {
            if(getBankDetails && getBankDetails.length > 0){
                const { reEnterAccountNumber, ...dataToSubmit } = formData;
                onNext(dataToSubmit);
            }
            else{
                const payload = {
                    "borrowerId": localStorage.getItem('authToken'),
                    "bankName": formData.bankName,
                    "accountNumber": formData.accountNumber,
                    "ifscNumber": formData.ifscCode,
                    "accountHolderName": formData.accountHolderName
                }
                try {
                    const response = await fetch(`${config.baseURL}bank-detail`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });
                    const results = await response.json();
                    if(results != null){
                        const { reEnterAccountNumber, ...dataToSubmit } = formData;
                        onNext(dataToSubmit);
                    }
                } catch (error) {
                    toast.error(`${error.message}`);
                }
            }
        } else {
            toast.error("Please fill all required fields correctly.");
        }
    };

    const commonInputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";

    return (
        <div className="flex flex-col h-full">
            {
                internalLoading ?
                    <section className="h-full flex items-center justify-center text-md text-primary">
                        <div className="dot-loader h-full w-full flex justify-center items-center">
                            <span></span><span></span><span></span> Fetching Bank Details
                        </div>
                    </section>
                    :
                    <section className='h-full'>
                        {
                            getBankDetails && getBankDetails.length > 0 ?
                                <div className="flex-grow overflow-y-auto pr-2 mt-2">
                                    <div className="flex flex-wrap gap-x-8">
                                        <div className="flex-1 min-w-[150px] mb-4">
                                            <label className="block text-xs font-normal text-gray-700 mb-1">Account Holder Name</label>
                                            <div className='text-sm font-medium text-black'>{getBankDetails[0]?.accountHolderName}</div>
                                        </div>
                                        <div className="flex-1 min-w-[150px] mb-4">
                                            <label className="block text-xs font-normal text-gray-700 mb-1">Bank Name</label>
                                            <div className='text-sm font-medium text-black'>{getBankDetails[0]?.bankName}</div>
                                        </div>
                                        <div className="flex-1 min-w-[150px] mb-4">
                                            <label className="block text-xs font-normal text-gray-700 mb-1">Account Number</label>
                                            <div className='text-sm font-medium text-black'>{getBankDetails[0]?.accountNumber}</div>
                                        </div>
                                        <div className="flex-1 min-w-[150px] mb-4">
                                            <label className="block text-xs font-normal text-gray-700 mb-1">IFSC Code</label>
                                            <div className='text-sm font-medium text-black'>{getBankDetails[0]?.ifscNumber}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end text-sm text-gray-600 mt-4">
                                        Need to add new acccount? &nbsp;<span className='text-md text-primary cursor-pointer'>Contact Support Team</span>
                                    </div>
                                </div>

                                :
                                <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name <span className="text-red-500">*</span></label>
                                        <select value={formData.bankName} onChange={(e) => handleInputChange('bankName', e.target.value)} className={`${commonInputClass} inputField`}>
                                            {indianBanks.map(bank => (<option key={bank.value} value={bank.value}>{bank.label}</option>))}
                                        </select>
                                        {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number <span className="text-red-500">*</span></label>
                                        <input type="number" value={formData.accountNumber} onChange={(e) => handleInputChange('accountNumber', e.target.value)} placeholder="Enter Account Number" className={`${commonInputClass} inputField`} />
                                        {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Re-Enter Bank Account Number <span className="text-red-500">*</span></label>
                                        <input type="number" value={formData.reEnterAccountNumber} onChange={(e) => handleInputChange('reEnterAccountNumber', e.target.value)} placeholder="Re-Enter Account Number" className={`${commonInputClass} inputField`} />
                                        {errors.reEnterAccountNumber && <p className="text-red-500 text-xs mt-1">{errors.reEnterAccountNumber}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code <span className="text-red-500">*</span></label>
                                        <input type="text" value={formData.ifscCode} onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())} placeholder="Enter IFSC Code" className={`${commonInputClass} inputField`} maxLength={15} />
                                        {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name <span className="text-red-500">*</span></label>
                                        <input type="text" value={formData.accountHolderName} onChange={(e) => handleInputChange('accountHolderName', e.target.value)} placeholder="Enter Account Holder Name" className={`${commonInputClass} inputField`} />
                                        {errors.accountHolderName && <p className="text-red-500 text-xs mt-1">{errors.accountHolderName}</p>}
                                    </div>
                                </div>
                        }
                    </section>
            }

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
                    {loading ? 'Saving...' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default BankInfoForm;