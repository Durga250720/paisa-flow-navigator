
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardOutlet from '@/components/DashboardOutlet';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleBorrow = () => {
    navigate('/basic-info');
  };

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
          <DashboardSidebar />
          <SidebarInset className="flex-1">
            <DashboardOutlet />
            
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
