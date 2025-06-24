import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/environment';
import { format, differenceInDays, isToday, isFuture, startOfDay } from 'date-fns'; 
import { Eye } from "lucide-react";
import { toTitleCase } from '../lib/utils';
import {toast } from 'react-toastify';

const RepaymentsContent = () => {
  const [repayments, setRepayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for API
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchRepayments = async (page: number) => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/'); // Redirect to login if no token
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${config.baseURL}repayment/filter`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageNo: page,
            size: ITEMS_PER_PAGE,
            borrowerId: authToken,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch repayment data.' }));
          throw new Error(errorData.message || 'Failed to fetch repayment data.');
        }

        const result = await response.json();
        console.log(result.data.data)
        if (result.data && Array.isArray(result.data.data)) {
          setRepayments(result.data.data);
          setTotalItems(result.data.count || 0);
        } else {
          // Handle cases where data might be directly in result.data or other structures
          if (Array.isArray(result.data) && typeof result.count === 'number') {
            setRepayments(result.data);
            setTotalItems(result.count);
          } else {
            console.warn("Unexpected API response structure for repayments:", result);
            setRepayments([]);
            setTotalItems(0);
          }
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

  const handleViewBorrowingHistory = () => {
    toast.warning(
      'View Borrowing History Coming soon!'
    )
  }

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
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-2" style={{height:'calc(100% - 40px)'}}> {/* Adjust height for title */}
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
        <div className="overflow-x-auto h-[calc(100%-60px)]"> {/* Adjust height for pagination */}
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan ID</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan Amount</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Due Date</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Due Amount</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Paid Amount</th>
                {/* <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Payment Delay(days)</th> */}
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Late Fee Amount</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {repayments.length > 0 ? (
                repayments.map((repayment) => (
                  <tr className="border-b" key={repayment.loanId || repayment.id}>
                    <td className="text-xs font-normal p-3">{repayment.loanDisplayId || repayment.loanId || 'N/A'}</td>
                    <td className="text-xs font-normal p-3">₹ {repayment.dueLoanAmount?.toLocaleString('en-IN') || 'N/A'}</td>
                    <td className="text-xs font-normal p-3">
                      {getDueDateMessage(repayment.dueDate)}
                    </td>
                    <td className="text-xs font-normal p-3">₹ {repayment.pendingAmount?.toLocaleString('en-IN') || 'N/A'}</td>
                    <td className="text-xs font-normal p-3">₹ {repayment.amountPaid?.toLocaleString('en-IN') || 0}</td>
                    {/* <td className="text-xs font-normal p-3">{repayment.lateDays || '-'}</td> */}
                    <td className="text-xs font-normal p-3">₹ {repayment.lateFeeCharged || 'N/A'}</td>
                    <td className="text-xs font-normal p-3">
                      <span className={`${getStatusClasses(repayment.status)} px-2 py-1 rounded text-xs font-normal`}>
                        {toTitleCase(repayment.status.split('_').join(' ')) || 'N/A'}
                      </span>
                    </td>
                    <td className="text-xs font-normal p-3">
                      {/* <button 
                        className="text-xs font-normal text-blue-600 hover:underline"
                        // onClick={() => handleViewDetails(repayment.id)} // Implement if needed
                      >
                        Details
                      </button> */}
                      <Eye className="w-5 h-5 text-blue-600 cursor-pointer" onClick={handleViewBorrowingHistory}/> 
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
