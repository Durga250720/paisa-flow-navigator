
import React from 'react';

const MyBorrowingsContent = () => {
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
    </div>
  );
};

export default MyBorrowingsContent;
