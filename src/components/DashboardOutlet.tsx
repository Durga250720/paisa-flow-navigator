
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MyApplicationContent from './MyApplicationContent';
import MyBorrowingsContent from './MyBorrowingsContent';
import RepaymentsContent from './RepaymentsContent';

const DashboardOutlet = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/application" replace />} />
      <Route path="/application" element={<MyApplicationContent />} />
      <Route path="/borrowings" element={<MyBorrowingsContent />} />
      <Route path="/repayments" element={<RepaymentsContent />} />
    </Routes>
  );
};

export default DashboardOutlet;
