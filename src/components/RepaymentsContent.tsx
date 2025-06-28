// src/components/RepaymentsContent.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/environment';
import { format, differenceInDays, isToday, startOfDay } from 'date-fns';
import { Eye, Search, X, Calendar as CalendarIcon } from "lucide-react";
import { toTitleCase } from '../lib/utils';
import { toast } from 'react-toastify';
import { DayPicker } from 'react-day-picker';

// --- INTERFACES & TYPES ---

// Updated interface to match the detailed API response
interface RepaymentListItem {
  id: string;
  loanId: string;
  loanDisplayId: string;
  borrowerName: string;
  dueLoanAmount: number;
  dueDate: string;
  pendingAmount: number;
  amountPaid: number;
  lateFeeCharged: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
}

type StatusFilter = 'ALL' | 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';

interface Filters {
  search: string;
  status: StatusFilter;
  startDate: Date | null;
  endDate: Date | null;
}

// --- HELPER & CHILD COMPONENTS ---

// A skeleton loader for a better loading experience
const TableSkeleton = () => (
    <tbody>
    {Array.from({ length: 10 }).map((_, i) => (
        <tr key={i} className="border-b animate-pulse">
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-5"></div></td>
        </tr>
    ))}
    </tbody>
);


const RepaymentsContent = () => {
  const [repayments, setRepayments] = useState<RepaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'ALL',
    startDate: null,
    endDate: null,
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setCurrentPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);


  const fetchRepayments = useCallback(async (page: number, currentFilters: Filters, searchStr: string) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
      toast.warn("Authentication token not found. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);

    const requestBody: any = {
      pageNo: page,
      size: ITEMS_PER_PAGE,
      borrowerId: authToken,
      searchRequest: searchStr || null,
      status: currentFilters.status !== 'ALL' ? currentFilters.status : null,
      startDate: currentFilters.startDate ? format(currentFilters.startDate, 'dd-MM-yyyy') : null,
      endDate: currentFilters.endDate ? format(currentFilters.endDate, 'dd-MM-yyyy') : null,
    };

    // Clean up null values from request body
    Object.keys(requestBody).forEach(key => {
      if (requestBody[key] === null) {
        delete requestBody[key];
      }
    });

    try {
      const response = await fetch(`${config.baseURL}repayment/filter`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch repayment data.');
      }

      const result = await response.json();
      if (result.data && Array.isArray(result.data.data)) {
        setRepayments(result.data.data);
        setTotalItems(result.data.count || 0);
      } else {
        console.warn("Unexpected API response structure:", result);
        setRepayments([]);
        setTotalItems(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
      setRepayments([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Effect to trigger fetch when dependencies change
  useEffect(() => {
    // We use a separate function for filters to avoid resetting page on every filter change
    // Page reset is handled manually where needed (e.g., search, status change)
    fetchRepayments(currentPage, filters, debouncedSearch);
  }, [navigate, currentPage, filters, debouncedSearch, fetchRepayments]);

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key !== 'search') {
      setCurrentPage(0); // Reset page for instant filters
    }
  };


  const clearFilters = () => {
    setFilters({ search: '', status: 'ALL', startDate: null, endDate: null });
    setCurrentPage(0);
  };

  const handleViewDetails = (repaymentId: string) => {
    if (!repaymentId) {
      toast.error("Cannot view details: Repayment ID is missing.");
      return;
    }
    navigate(`/admin/repayments/${repaymentId}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusClasses = (status: string) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-blue-100 text-blue-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueDateMessage = (dueDateString: string | null | undefined): string | JSX.Element => {
    if (!dueDateString) return 'N/A';
    try {
      const today = startOfDay(new Date());
      const dueDate = startOfDay(new Date(dueDateString));
      if (isToday(dueDate)) return 'Due today';
      const daysDifference = differenceInDays(dueDate, today);
      if (daysDifference < 0) {
        return <span className="text-red-500 font-medium">Overdue by {Math.abs(daysDifference)} day{Math.abs(daysDifference) > 1 ? 's' : ''}</span>;
      }
      return <span>Due in {daysDifference} day{daysDifference > 1 ? 's' : ''}</span>;
    } catch (error) {
      console.error("Error parsing due date:", error);
      return format(new Date(dueDateString), 'd MMM yyyy');
    }
  };

  const paginationItems = useMemo(() => {
    const items = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) items.push(i);
    } else {
      items.push(0);
      if (currentPage > 2) items.push('...');
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);
      for (let i = start; i <= end; i++) items.push(i);
      if (currentPage < totalPages - 3) items.push('...');
      items.push(totalPages - 1);
    }
    return items;
  }, [currentPage, totalPages]);

  return (
      <div className="p-4 h-full w-full flex flex-col">
        <div className="text-xl font-medium text-primary mb-4">Repayment Management</div>

        {/* --- Filter Bar --- */}
        <div className="p-4 bg-white rounded-lg shadow-sm mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                  type="text"
                  placeholder="Search by Loan ID, Name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            {/* Status Filter */}
            <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value as StatusFilter)}
                className="px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            {/* Date Range Picker */}
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <DayPicker
                  mode="range"
                  selected={{ from: filters.startDate!, to: filters.endDate! }}
                  onSelect={(range) => {
                    handleFilterChange('startDate', range?.from ?? null);
                    handleFilterChange('endDate', range?.to ?? null);
                  }}
                  className="absolute bg-white border rounded-md shadow-lg z-20 hidden" // This is a placeholder, use a popover/modal library for better UX
                  footer={
                    <div className="p-2 text-center text-sm text-gray-600">
                      {filters.startDate && filters.endDate
                          ? `${format(filters.startDate, 'd MMM yyyy')} - ${format(filters.endDate, 'd MMM yyyy')}`
                          : 'Please select a date range.'}
                    </div>
                  }
              />
              <input
                  readOnly
                  value={filters.startDate && filters.endDate ? `${format(filters.startDate, 'd MMM')} - ${format(filters.endDate, 'd MMM')}` : 'Select Date Range'}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md cursor-pointer"
                  // In a real app, clicking this would open the DayPicker in a popover
              />
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-grow flex flex-col">
          {error && (
              <div className="flex-grow flex justify-center items-center text-red-500 p-4">
                <p>Error: {error}</p>
              </div>
          )}
          {!error && (
              <>
                <div className="overflow-x-auto flex-grow">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan ID</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan Amount</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Due Date</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Pending Amount</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Paid Amount</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Late Fee</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
                      <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Action</th>
                    </tr>
                    </thead>
                    {loading ? (
                        <TableSkeleton />
                    ) : (
                        <tbody>
                        {repayments.length > 0 ? (
                            repayments.map((repayment) => (
                                <tr className="border-b hover:bg-gray-50" key={repayment.id}>
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
                                    <Eye
                                        className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-800"
                                        onClick={() => handleViewDetails(repayment.id)}
                                    />
                                  </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-gray-500">
                                <h3 className="text-lg font-medium">No Repayments Found</h3>
                                <p className="mt-1">Try adjusting your search or filter criteria.</p>
                              </td>
                            </tr>
                        )}
                        </tbody>
                    )}
                  </table>
                </div>
                {/* --- Enhanced Pagination --- */}
                {totalItems > 0 && (
                    <div className="flex justify-between items-center p-4 border-t h-[60px]">
                <span className="text-sm text-gray-600">
                  Showing <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE + 1, totalItems)}</span> to <span className="font-medium">{Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
                </span>
                      <nav className="flex items-center gap-1">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                        {paginationItems.map((item, index) =>
                            typeof item === 'number' ? (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(item)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${currentPage === item ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                                >
                                  {item + 1}
                                </button>
                            ) : (
                                <span key={index} className="px-3 py-1.5 text-sm font-medium">...</span>
                            )
                        )}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                      </nav>
                    </div>
                )}
              </>
          )}
        </div>
      </div>
  );
};

export default RepaymentsContent;