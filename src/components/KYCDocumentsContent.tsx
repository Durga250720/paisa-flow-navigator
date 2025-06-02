
import React from 'react';
import { FileText, CheckCircle, User } from 'lucide-react';

const KYCDocumentsContent = () => {
  const documents = [
    {
      type: "PAN Card",
      status: "Verified",
      icon: FileText
    },
    {
      type: "Salary Slips",
      status: "Verified",
      icon: FileText
    },
    {
      type: "PAN Card",
      status: "Verified",
      icon: FileText
    },
    {
      type: "Salary Slips",
      status: "Verified",
      icon: FileText
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Borrower Profile Section */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-medium text-gray-900">Borrower Profile</h2>
        </div>
        
        <div className="space-y-3">
          <div>
            <span className="text-gray-900 font-medium">Rajesh Kumar</span>
          </div>
          <div className="text-sm text-blue-600">
            ID: RRW 39201
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <div className="text-sm text-gray-600">CIBIL Score</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">732</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Employment</div>
              <div className="text-sm font-medium">Salaried</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Monthly Income</div>
              <div className="text-sm font-medium">₹1,35,000</div>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Verification Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2">KYC Verification</h3>
        <p className="text-sm text-gray-600 mb-6">customer's documents</p>
        
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <doc.icon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{doc.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KYCDocumentsContent;
