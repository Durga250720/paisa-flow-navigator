// src/components/RepaymentsContent.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/environment';
import { format, differenceInDays, isToday, startOfDay } from 'date-fns';
import { Eye } from "lucide-react";
import { toTitleCase } from '../lib/utils';
import { toast } from 'react-toastify';

// Define a more specific type for a repayment item in the list
interface RepaymentListItem {
  id: string; // This is the crucial ID for navigation
  loanId: string;
  loanDisplayId: string;
  dueLoanAmount: number;
  dueDate: string;
  pendingAmount: number;
  amountPaid: number;
  lateFeeCharged: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
}

const RepaymentsContent = () => {
  // Use the specific type here
  const [repayments, setRepayments] = useState<RepaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchRepayments = async (page: number) => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${config.baseURL}repayment/filter`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageNo: page,
            size: ITEMS_PER_PAGE,
            borrowerId: authToken,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch repayment data.');
        }

        const result = await response.json();
        if (result.data && Array.isArray(result.data.data)) {
          // The API response contains the 'id' field we need.
          setRepayments(result.data.data);
          setTotalItems(result.data.count || 0);
        } else {
          console.warn("Unexpected API response structure for repayments:", result);
          setRepayments([]);
          setTotalItems(0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        setRepayments([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRepayments(currentPage);
  }, [navigate, currentPage]);

  // MODIFICATION: This function now navigates to the detail page
  const handleViewDetails = (repaymentId: string) => {
    if (!repaymentId) {
      toast.error("Cannot view details: Repayment ID is missing.");
      return;
    }
    // Navigate to the new route
    navigate(`/admin/repayments/${repaymentId}`);
  };

  // ... (handlePreviousPage, handleNextPage, getStatusClasses, getDueDateMessage functions remain the same) ...
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * ITEMS_PER_PAGE < totalItems) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const getStatusClasses = (status: string) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PARTIAL':
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueDateMessage = (dueDateString: string | null | undefined): string | JSX.Element => {
    if (!dueDateString) {
      return 'N/A';
    }
    try {
      const today = startOfDay(new Date());
      const dueDate = startOfDay(new Date(dueDateString));

      if (isToday(dueDate)) {
        return 'Due today';
      }

      const daysDifference = differenceInDays(dueDate, today);

      if (daysDifference < 0) { // Past due
        return <span className="text-red-500 font-medium">Overdue by {Math.abs(daysDifference)} day{Math.abs(daysDifference) > 1 ? 's' : ''}</span>;
      }
      return <span>Due in {daysDifference} day{daysDifference > 1 ? `'s` : ''}</span>;
    } catch (error) {
      console.error("Error parsing due date:", error);
      return format(new Date(dueDateString), 'd MMM yyyy'); // Fallback to original format
    }
  };


  return (
      <div className="p-4 h-full w-full">
        <div className="text-xl font-medium text-primary mb-2">Repayment Management</div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-2" style={{height:'calc(100% - 40px)'}}>
          {/* Loading and Error states are unchanged */}
          {loading && (
              <div className="flex justify-center items-center h-full">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-4 text-gray-600">Fetching repayments...</p>
              </div>
          )}
          {error && (
              <div className="flex justify-center items-center h-full text-red-500">
                <p>Error: {error}</p>
              </div>
          )}
          {!loading && !error && (
              <>
                <div className="overflow-x-auto h-[calc(100%-60px)]">
                  <table className="w-full text-sm">
                    {/* thead is unchanged */}
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan ID</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan Amount</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Due Date</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Due Amount</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Paid Amount</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Late Fee Amount</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {repayments.length > 0 ? (
                        repayments.map((repayment) => (
                            // MODIFICATION: Use the unique repayment 'id' for the key
                            <tr className="border-b" key={repayment.id}>
                              <td className="text-xs font-normal p-3">{repayment.loanDisplayId || 'N/A'}</td>
                              <td className="text-xs font-normal p-3">₹ {repayment.dueLoanAmount?.toLocaleString('en-IN') || 'N/A'}</td>
                              <td className="text-xs font-normal p-3">{getDueDateMessage(repayment.dueDate)}</td>
                              <td className="text-xs font-normal p-3">₹ {repayment.pendingAmount?.toLocaleString('en-IN') || 'N/A'}</td>
                              <td className="text-xs font-normal p-3">₹ {repayment.amountPaid?.toLocaleString('en-IN') || 0}</td>
                              <td className="text-xs font-normal p-3">₹ {repayment.lateFeeCharged?.toLocaleString('en-IN') || 'N/A'}</td>
                              <td className="text-xs font-normal p-3">
                          <span className={`${getStatusClasses(repayment.status)} px-2 py-1 rounded text-xs font-normal`}>
                            {toTitleCase(repayment.status.split('_').join(' '))}
                          </span>
                              </td>
                              <td className="text-xs font-normal p-3">
                                {/* MODIFICATION: Call the new handler on click */}
                                <Eye
                                    className="w-5 h-5 text-blue-600 cursor-pointer"
                                    onClick={() => handleViewDetails(repayment.id)}
                                />
                              </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                          <td colSpan={8} className="p-4 text-center text-gray-500">No repayment history found.</td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination is unchanged */}
                {repayments.length > 0 && (
                    <div className="flex justify-between items-center p-4 border-t h-[60px]">
                      <button
                          onClick={handlePreviousPage}
                          disabled={currentPage === 0 || loading}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-primary">
                  Page {currentPage + 1} of {totalPages > 0 ? totalPages : 1}
                </span>
                      <button
                          onClick={handleNextPage}
                          disabled={(currentPage + 1) * ITEMS_PER_PAGE >= totalItems || loading}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                )}
              </>
          )}
        </div>
      </div>
  );
};

export default RepaymentsContent;