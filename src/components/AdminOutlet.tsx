
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MyApplicationContent from './MyApplicationContent';
import MyBorrowingsContent from './MyBorrowingsContent';
import RepaymentsContent from './RepaymentsContent';

const AdminOutlet  = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/my-application" replace />} />
      <Route path="/my-application" element={<MyApplicationContent />} />
      <Route path="/my-borrowings" element={<MyBorrowingsContent />} />
      <Route path="/my-repayments" element={<RepaymentsContent />} />
    </Routes>
  );
};

export default AdminOutlet ;
