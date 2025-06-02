
import React from 'react';

const RepaymentsContent = () => {
  return (
    <div className="p-4 h-full">
      <h1 className="text-2xl font-bold mb-6">Repayment Management</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{height:'92%'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Loan ID</th>
                <th className="text-left p-3">Loan Amount</th>
                <th className="text-left p-3">Due Date</th>
                <th className="text-left p-3">Due Amount</th>
                <th className="text-left p-3">Paid Amount</th>
                <th className="text-left p-3">Payment Source</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">LOAN-3678</td>
                <td className="p-3">₹ 7,000.00</td>
                <td className="p-3">4/5/2025</td>
                <td className="p-3">₹15000</td>
                <td className="p-3">₹15000</td>
                <td className="p-3">NACH (ICICI XXXX4532)</td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    ✓ Paid
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-blue-600 text-xs">Details</button>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-3">LOAN-3679</td>
                <td className="p-3">₹ 7,000.00</td>
                <td className="p-3">4/10/2025</td>
                <td className="p-3">₹20000</td>
                <td className="p-3">₹20000</td>
                <td className="p-3">NACH (HDFC XXXX7896)</td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    ✓ Paid
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-blue-600 text-xs">Details</button>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-3">LOAN-3680</td>
                <td className="p-3">₹ 7,000.00</td>
                <td className="p-3">4/12/2025</td>
                <td className="p-3">₹12000</td>
                <td className="p-3">₹10000</td>
                <td className="p-3">UPI Autopay (SBI XXXX7234)</td>
                <td className="p-3">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    ⚠ Partial
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-blue-600 text-xs">Details</button>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-3">LOAN-3681</td>
                <td className="p-3">₹ 7,000.00</td>
                <td className="p-3">4/15/2025</td>
                <td className="p-3">₹18000</td>
                <td className="p-3">-</td>
                <td className="p-3"></td>
                <td className="p-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    ⏳ Pending
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-blue-600 text-xs">Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RepaymentsContent;
