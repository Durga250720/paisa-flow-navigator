import React, { useEffect, useState } from 'react';
import styles from './styles/CreateMyBorrowing.module.css';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/environment';
import { Button } from '@/components/ui/button';
import {Eye } from 'lucide-react';

const MyApplicationContent = () => {
  const [applicationData, setApplicationData] = useState<any | null>([]);
  const [loading, setLoading] = useState(true);
  const authToken = localStorage.getItem('authToken');
  const navigate = useNavigate();


  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
      return;
    }

    fetchApplications();
  }, [navigate])

  const fetchApplications = async () => {
    setLoading(true);
    try {

      const response = await fetch(`${config.baseURL}loan-application/${authToken}/detail`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch loan application details.' }));
        throw new Error(errorData.message || 'Failed to fetch loan application details.');
      }
      const result = await response.json();
      console.log(result)
      setApplicationData(result.data)

      setLoading(false)
    } catch (error) {

      setLoading(false)
    }
    finally {

      setLoading(false)
    }
  }

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

   const getStatusClasses = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewApplicationDetails = (appId:any) => {
    navigate(`/admin/view-application/${appId}`)
  }

  return (
    <div className="p-4 h-full w-full">
      <div className="text-xl font-medium text-primary mb-2">Applied Applications</div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '95%' }}>
        {loading && <div className={`${styles.loadingSection} p-4 text-center col-span-full`}>Fetching borrowing history...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Application ID</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan Amount</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Created On</th>
                {/* <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Due Amount</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Paid Amount</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Payment Source</th> */}
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {applicationData.length > 0 ? (
                applicationData.map((application) => (
                  <tr className="border-b" key={application.displayId}>
                    <td className="text-xs font-normal p-3">{application.displayId}</td>
                    <td className="text-xs font-normal p-3">₹ {application.loanAmount}</td>
                    <td className="text-xs font-normal p-3">{ formatDate(application.updatedAt)}</td>
                    {/* <td className="text-xs font-normal p-3">₹15000</td>
                    <td className="text-xs font-normal p-3">₹15000</td> */}
                    {/* <td className="text-xs font-normal p-3">NACH (ICICI XXXX4532)</td> */}
                    <td className="text-xs font-normal p-3">
                      <span className={`${getStatusClasses(application.applicationStatus)} rounded text-xs font-normal p-2`}>
                        {application.applicationStatus === 'APPROVED' ? '✓ ' : ''}
                        {application.applicationStatus === 'PENDING' ? '⏳ ' : ''}
                        {application.applicationStatus === 'REJECTED' ? '✕ ' : ''}
                        {application.applicationStatus}
                      </span>
                    </td>
                    <td className="text-xs font-normal p-3">
                      <button className="p-2" onClick={() => handleViewApplicationDetails(application?.id)}>
                          <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) :
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">No borrowing history found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyApplicationContent;
