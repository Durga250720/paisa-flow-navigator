// src/components/forms/FinalLoanAmountForm.tsx
import React, { useState, useEffect } from 'react';
import {toast } from 'react-toastify';
import { ChevronRight, Check } from 'lucide-react';

interface FinalLoanAmountFormProps {
    initialData: { // This would be the amount from the previous step (InitialLoanAmountForm)
        amount: number;
    };
    applicationData: any; // This should contain approvedAmount and loanConfig from backend
    onSubmit: (data: { finalLoanAmount: number }) => void;
    onPrevious: () => void;
    loading: boolean;
}

const FinalLoanAmountForm: React.FC<FinalLoanAmountFormProps> = ({
    initialData,
    applicationData,
    onSubmit,
    onPrevious,
    loading
}) => {
    const [loanAmount, setLoanAmount] = useState<number>(initialData.amount || 1000);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const approvedAmount = applicationData?.approvedAmount || 25000; // Fallback if not available
    const minLoanAmount = 1000;

    useEffect(() => {
        // Set initial loan amount, capped by approved amount
        let initialSetAmount = initialData.amount || minLoanAmount;
        if (initialSetAmount > approvedAmount) {
            initialSetAmount = approvedAmount;
        }
        if (initialSetAmount < minLoanAmount) {
            initialSetAmount = minLoanAmount;
        }
        setLoanAmount(initialSetAmount);
    }, [initialData.amount, approvedAmount, minLoanAmount]);

    const handleLoanAmountChange = (valueString: string) => {
        if (errors.loanAmount) {
            setErrors(prev => ({ ...prev, loanAmount: '' }));
        }
        const value = parseInt(valueString, 10);

        if (isNaN(value)) {
            setLoanAmount(minLoanAmount);
            return;
        }
        if (value > approvedAmount) {
            toast.warning(`You are approved for a maximum of ₹${approvedAmount.toLocaleString()}.`);
            setLoanAmount(approvedAmount);
            return;
        }
        if (value < minLoanAmount) {
            setLoanAmount(minLoanAmount);
            return;
        }
        setLoanAmount(value);
    };

    const handleFormSubmit = () => {
        if (loanAmount < minLoanAmount || loanAmount > approvedAmount) {
            toast.error(`Please select an amount between ₹${minLoanAmount} and ₹${approvedAmount}.`);
            setErrors({ loanAmount: `Amount must be between ₹${minLoanAmount} and ₹${approvedAmount}.` });
            return;
        }
        onSubmit({ finalLoanAmount: loanAmount });
    };

    // Fee Calculation (similar to PreApprovedLoanAmount.tsx)
    const flatFee = applicationData?.loanConfig?.platformFee || 0;
    const loanInterestPercentage = applicationData?.loanConfig?.loanInterest ? (loanAmount / applicationData.loanConfig.loanInterest) / 100 : 0.02; // Example default interest
    const interest = Math.round(loanAmount * loanInterestPercentage);
    const loanProtectionFee = applicationData?.loanConfig?.loanProtectionFee || 0;
    const loanProcessingFee = applicationData?.loanConfig?.processingFee || 0;
    const gstOnProcessingFee = Math.round(loanProcessingFee * 0.18);
    const totalAmount = loanAmount + interest;
    const disbursingAmount = loanAmount - loanProtectionFee - gstOnProcessingFee - loanProcessingFee - flatFee;

    const sliderPercentage = approvedAmount > minLoanAmount ? ((loanAmount - minLoanAmount) / (approvedAmount - minLoanAmount)) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="text-center mb-2">
                <h3 className="text-lg font-semibold text-gray-700">
                    Congratulations! You’re Approved for ₹{approvedAmount.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-500">Adjust the slider to select your desired loan amount.</p>
            </div>

            {/* Loan Amount Display and Slider */}
            <div className="mb-8">
                <div className="text-3xl font-medium text-primary mb-6 text-center">
                    ₹{loanAmount > 0 ? loanAmount.toLocaleString() : '0'}
                </div>
                <div className="relative mb-6">
                    <input
                        type="range"
                        min={minLoanAmount}
                        max={approvedAmount}
                        step="500"
                        value={loanAmount}
                        onChange={(e) => handleLoanAmountChange(e.target.value)}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #5D15C1 0%, #5D15C1 ${sliderPercentage}%, #e5e7eb ${sliderPercentage}%, #e5e7eb 100%)`
                        }}
                        disabled={loading}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>₹{minLoanAmount.toLocaleString()}</span>
                        <span>₹{approvedAmount.toLocaleString()}</span>
                    </div>
                </div>
                {errors.loanAmount && <p className="text-red-500 text-xs mt-1 text-center">{errors.loanAmount}</p>}
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2 mb-6 text-left text-sm">
                <div className="flex justify-between items-center"><span className="text-gray-600">Platform fee (inc. GST)</span><span className="font-medium">₹ {flatFee.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Interest</span><span className="font-medium">₹ {interest.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Loan Protection Fee</span><span className="font-medium">₹ {loanProtectionFee.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Processing Fee</span><span className="font-medium">₹ {loanProcessingFee.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">GST On Processing Fee</span><span className="font-medium">₹ {gstOnProcessingFee.toLocaleString()}</span></div>
                <div className="flex justify-between items-center font-semibold pt-2 border-t mt-2"><span className="text-gray-700">Total Payable by [Due Date]</span><span className="text-gray-900">₹ {totalAmount.toLocaleString()}</span></div>
                <div className="flex justify-between items-center font-semibold"><span className="text-gray-700">Net Disbursing Amount</span><span className="text-gray-900">₹ {disbursingAmount.toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-xs"><span className="text-gray-600">Transfer to</span><span className="font-medium">****{applicationData?.bankDetail?.accountNumber?.slice(-4) || 'XXXX'} ({applicationData?.bankDetail?.bankName || 'Your Bank'})</span></div>
            </div>

            {/* KFS & Loan Documents */}
            <div className="mb-6 border-t pt-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <span className="text-gray-700 font-medium text-sm">KFS & Loan Documents</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center text-xs text-gray-600 mt-4">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                100% Safe & Secure
            </div>

            <div className="flex justify-between gap-3 mt-8 pt-4 border-t">
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
                    disabled={loading || loanAmount < minLoanAmount || loanAmount > approvedAmount}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>
        </div>
    );
};

export default FinalLoanAmountForm;