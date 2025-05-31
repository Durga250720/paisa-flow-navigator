
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleBorrow = () => {
    navigate('/basic-info');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="font-medium">Paisa108</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600">Help</button>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
              1
            </div>
            <span className="text-sm">Shruti</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-4 mb-6">
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded">
            <span>📊</span>
            My Borrowings
          </button>
          <button className="flex items-center gap-2 text-gray-600 px-4 py-2">
            <span>💳</span>
            Repayments
          </button>
        </div>

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
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3">LOAN-39201</td>
                    <td className="p-3">₹ 7,000.00</td>
                    <td className="p-3">1 Feb 25</td>
                    <td className="p-3">1 {i <= 3 ? 'Mar' : 'April'} 25</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Active
                      </span>
                    </td>
                    <td className="p-3">ICICI (2B XXX)</td>
                    <td className="p-3">
                      <button className="text-primary">→</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={handleBorrow}
          className="fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-lg font-medium"
        >
          Borrow
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
