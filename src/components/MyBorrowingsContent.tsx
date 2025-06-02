import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/environment';
import { format } from 'date-fns'; // For formatting dates

interface BorrowingDetails {
  displayId: string;
  loanAmount: number;
  disburseDate: string; // Assuming date is a string, adjust if it's a Date object
  dueDate: string;      // Assuming date is a string
  loanStatus: string;
  paidTo: string; // Or a more specific type if you have one for bank details
  // Add any other relevant fields from your API response
}

const MyBorrowingsContent = () => {
  const [borrowings, setBorrowings] = useState<BorrowingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBorrowingsData = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/'); // Redirect to login if no token
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${config.baseURL}borrower/filter`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pageNo: 0,
            pageSize: 10,
            searchText: ""
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch borrowing history.' }));
          throw new Error(errorData.message || 'Failed to fetch borrowing history.');
        }

        const res = await response.json();        
          setBorrowings(res.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        setBorrowings([]); // Ensure borrowings is an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowingsData();
  }, [navigate]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Available Limit</div>
          <div className="text-2xl font-bold">₹25,000</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Total Borrowed</div>
          <div className="text-2xl font-bold">9,000</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Auto Pay</div>
          <div className="text-lg font-medium">XXXX XXXX 17490</div>
          <div className="text-xs text-gray-500">ICICI Bank</div>
          <button className="text-primary text-sm mt-1">Change Bank</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-medium">Loan History</h2>
          <div className="flex items-center gap-2">
            <button className="text-sm text-gray-600">Filters</button>
            <select className="text-sm border rounded px-2 py-1">
              <option>All Status</option>
            </select>
          </div>
        </div>
        
        {loading && <div className="p-4 text-center col-span-full">Loading loan history...</div>}
        {error && <div className="p-4 text-center text-red-500 col-span-full">Error: {error}</div>}
        
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Loan ID</th>
                  <th className="text-left p-3">Loan Amount</th>
                  <th className="text-left p-3">Disburse Date</th>
                  <th className="text-left p-3">Due Date</th>
                  <th className="text-left p-3">Loan Status</th>
                  <th className="text-left p-3">Paid To</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.length > 0 ? (
                  borrowings.map((borrowing) => (
                    <tr key={borrowing.displayId} className="border-b">
                      <td className="p-3">{borrowing.displayId || 'N/A'}</td>
                      <td className="p-3">₹ {borrowing.loanAmount?.toLocaleString('en-IN') || 0}</td>
                      <td className="p-3">
                        {borrowing.disburseDate ? format(new Date(borrowing.disburseDate), 'd MMM yy') : 'N/A'}
                      </td>
                      <td className="p-3">
                        {borrowing.dueDate ? format(new Date(borrowing.dueDate), 'd MMM yy') : 'N/A'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${borrowing.loanStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {borrowing.loanStatus || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">{borrowing.paidTo || 'N/A'}</td>
                      <td className="p-3">
                        <button className="text-primary">→</button>
                      </td>
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
      </div>
    </div>
  );
};

export default MyBorrowingsContent;
