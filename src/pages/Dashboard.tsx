
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { CreditCard, Repeat } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('borrowings');

  const handleBorrow = () => {
    navigate('/basic-info');
  };

  const sidebarItems = [
    {
      title: "My Borrowings",
      icon: CreditCard,
      key: 'borrowings'
    },
    {
      title: "Repayments",
      icon: Repeat,
      key: 'repayments'
    }
  ];

  const renderBorrowingsContent = () => (
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

  const renderRepaymentsContent = () => (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Repayment Management</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      <SidebarProvider>
        <div className="flex w-full">
          <Sidebar className="w-64">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sidebarItems.map((item) => (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          onClick={() => setActiveView(item.key)}
                          isActive={activeView === item.key}
                          className="w-full justify-start"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <SidebarInset className="flex-1">
            {activeView === 'borrowings' ? renderBorrowingsContent() : renderRepaymentsContent()}
            
            <button
              onClick={handleBorrow}
              className="fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-lg font-medium"
            >
              Borrow
            </button>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
