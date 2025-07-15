import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import MyApplicationContent from './MyApplicationContent';
import MyBorrowingsContent from './MyBorrowingsContent';
import RepaymentsContent from './RepaymentsContent';
import KYCDocumentsContent from './KYCDocumentsContent';
import PrivacyPolicyContent from './PrivacyPolicyContent';
import CreateMyBorrowing from './CreateMyBorrowing';
import ApplicationDetailsContent from './ApplicationDetailsContent';
import RepaymentView from "@/components/RepaymentView.tsx";
import RazorPaySuccess from '../pages/razorpay-status/RazorPaySuccess';

const AdminOutlet = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/admin/kyc-documents" replace/>}/>
            <Route path="/my-application" element={<MyApplicationContent/>}/>
            <Route path='/view-application/:id' element={<ApplicationDetailsContent/>}/>
            <Route path="/my-borrowings" element={<MyBorrowingsContent/>}/>
            <Route path="/my-repayments" element={<RepaymentsContent/>}/>
            <Route path="/repayments/:repaymentId" element={<RepaymentView/>}/>
            <Route path="/kyc-documents" element={<KYCDocumentsContent/>}/>
            <Route path="/privacy-policy" element={<PrivacyPolicyContent/>}/>
            <Route path="/create-borrowing" element={<CreateMyBorrowing/>}/>
            <Route path="/payment-success" element={<RazorPaySuccess/>}/>
        </Routes>
    );
};

export default AdminOutlet;
