import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/environment';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react'; // Import the icon
import styles from './styles/MyBorrowingsContent.module.css';
import axios from 'axios';
import axiosInstance from '@/lib/axiosInstance';

const MyBorrowingsContent = () => {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for API
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 10; // Or your desired page size

  // const handleBorrowClick = () => {
  //   navigate('/admin/create-borrowing');
  // };

  useEffect(() => {
const fetchBorrowingsData = async (page: number) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        navigate('/');
        return;
    }

    setLoading(true);
    setError(null);

    try {
        // GET requests don't usually need Content-Type headers
        const response = await axiosInstance.get(
            `${config.baseURL}loan-application/${authToken}/user-borrowings/filter?pageNo=0&size=10`
        );

        const res = response.data;
        
        if (res.data && Array.isArray(res.data.data)) {
            setTotalItems(res.data.count || 0);
            setBorrowings(res.data.data);
            setHasMorePages(res.data.data.length === ITEMS_PER_PAGE);
        } else {
            setBorrowings([]);
            setTotalItems(0);
            setHasMorePages(false);
        }

    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch borrowing history.';
        setError(errorMessage);
        setBorrowings([]);
    } finally {
        setLoading(false);
    }
};

    fetchBorrowingsData(currentPage);
  }, [navigate, currentPage, ITEMS_PER_PAGE]);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMorePages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className={`${styles.mainContainer} p-4`}>
      <div className={`${styles.firstContainer} flex justify-between items-center`}>
        <div className={`${styles.titleContainer}`}>My Borrowings</div>
        {/* <div className={`${styles.buttonContainer}`}>
          <button 
            className={`${styles.borrowContainer}`}
            onClick={handleBorrowClick}
          >
            Borrow
          </button>
        </div> */}
      </div>
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2 mt-2">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-xs text-gray-600 mb-2">Available Limit</div>
          <div className="text-lg font-medium">₹25,000</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-xs text-gray-600 mb-2">Total Borrowed</div>
          <div className="text-lg font-medium">9,000</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-xs text-gray-600 mb-2">Auto Pay</div>
          <div className="text-base font-medium">XXXX XXXX 17490</div>
          <div className="text-xs text-gray-500">ICICI Bank</div>
          <button className="text-primary text-xs mt-1 float-right">Change Bank</button>
        </div>
      </div> */}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-2">
        {/* <div className="p-4 border-b flex items-center justify-between">
          <div className="text-base font-medium">Loan History</div>
          <div className="flex items-center gap-2">
            <button className="text-sm text-gray-600">Filters</button>
            <select className="text-sm border rounded px-2 py-1">
              <option>All Status</option>
            </select>
          </div>
        </div> */}

        {loading && <div className={`${styles.loadingSection} p-4 text-center col-span-full !h-[83vh]`}>Fetching borrowing history...</div>}
        {error && <div className="p-4 text-center text-red-500 col-span-full">Error: {error}</div>}

        {!loading && !error && (
          <div className={`${styles.tableContainer} overflow-x-auto`}>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan ID</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan Amount</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Disburse Date</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Due Date</th>
                  {/* <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan Status</th> */}
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Transfered Bank</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Transfered To</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.length > 0 ? (
                  borrowings.map((borrowing) => (
                    <tr key={borrowing.displayId} className="border-b">
                      <td className="text-xs font-normal p-3">{borrowing.displayId || 'N/A'}</td>
                      <td className="text-xs font-normal p-3">₹ {borrowing.loanAmount?.toLocaleString('en-IN') || 0}</td>
                      <td className="text-xs font-normal p-3">
                        {borrowing.disbursedDate ? format(new Date(borrowing.disbursedDate), 'd MMM yy') : 'N/A'}
                      </td>
                      <td className="text-xs font-normal p-3">
                        {borrowing.repaymentDate ? format(new Date(borrowing.repaymentDate), 'd MMM yy') : 'N/A'}
                      </td>
                      {/* <td className="text-xs font-normal p-3">
                        <span className={`px-2 py-1 rounded text-xs ${borrowing.loanStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {borrowing.loanStatus || 'N/A'}
                        </span>
                      </td> */}
                      <td className="text-xs font-normal p-3">{borrowing?.bankDetail?.bankName || 'N/A'}</td>
                      <td className="text-xs font-normal p-3">xxxxxx{borrowing?.bankDetail?.accountNumber.slice(-4) || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">No borrowing history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && borrowings.length > 0 && (
          <div className="flex justify-between items-center p-4 border-t">
            <button
              onClick={handlePreviousPage}
              disabled={totalPages <= 1 || currentPage === 0 || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-primary">
              Page {currentPage + 1} of {totalPages > 0 ? totalPages : 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={totalPages <= 1 || !hasMorePages || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBorrowingsContent;
