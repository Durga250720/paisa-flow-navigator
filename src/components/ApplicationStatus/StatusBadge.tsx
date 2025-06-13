
import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const getStatusClasses = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'disbursed':
      return 'bg-blue-100 text-blue-800';
    case 'defaulted':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return '✓ Approved';
    case 'PENDING':
      return '⏳ Pending Approval';
    case 'REJECTED':
      return '✕ Rejected';
    case 'DISBURSED':
      return '💸 Disbursed';
    case 'DEFAULTED':
      return '⚠️ Defaulted';
    default:
      return status;
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(status)}`}>
      {getStatusText(status)}
    </span>
  );
};
