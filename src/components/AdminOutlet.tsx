
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MyApplicationContent from './MyApplicationContent';
import MyBorrowingsContent from './MyBorrowingsContent';
import RepaymentsContent from './RepaymentsContent';
import KYCDocumentsContent from './KYCDocumentsContent';
import PrivacyPolicyContent from './PrivacyPolicyContent';
import CreateMyBorrowing from './CreateMyBorrowing';

const AdminOutlet  = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/kyc-documents" replace />} />
      <Route path="/my-application" element={<MyApplicationContent />} />
      <Route path="/my-borrowings" element={<MyBorrowingsContent />} />
      <Route path="/my-repayments" element={<RepaymentsContent />} />
      <Route path="/kyc-documents" element={<KYCDocumentsContent />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyContent />} />
      <Route path="/create-borrowing" element={<CreateMyBorrowing />} />
    </Routes>
  );
};

export default AdminOutlet ;
