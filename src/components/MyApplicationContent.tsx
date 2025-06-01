
import React from 'react';

const MyApplicationContent = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">My Application</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Application Status</div>
          <div className="text-2xl font-bold text-green-600">Approved</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Credit Limit</div>
          <div className="text-2xl font-bold">₹25,000</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-medium">Application Details</h2>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Application ID</div>
              <div className="font-medium">APP-12345</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Applied Date</div>
              <div className="font-medium">1 Feb 2025</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">KYC Status</div>
              <div className="font-medium text-green-600">Verified</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Document Status</div>
              <div className="font-medium text-green-600">Approved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplicationContent;
