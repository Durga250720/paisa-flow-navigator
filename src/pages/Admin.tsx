
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from '@/components/AdminSidebar';
import AdminOutlet from '@/components/AdminOutlet';
import styles from '../pages-styles/Admin.module.css';
import { toast } from "sonner";
import { LogOut } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
    }
  }, [navigate]); 

  const handleHelpClick = () => {
    toast.info("This feature will be coming soon!");
  };

  const handleLogout = () => {
    // Show the confirmation popup
    setShowLogoutConfirm(true);
  };

  const executeLogout = () => {
    toast.info("Logout functionality to be implemented!");
    localStorage.clear();
    navigate('/');
    toast.success("You have been logged out successfully!");
    setShowLogoutConfirm(false); // Close the popup
  };
  
  return (
    <div className={`${styles.container}`}>
      <div className={`${styles.leftPanel}`}>
        <SidebarProvider>
          <DashboardSidebar />
        </SidebarProvider>
      </div>
      <div className={`${styles.rightRenderingPanel}`}>
        <nav className={`${styles.navContainer} bg-white shadow-sm z-50 px-6 py-4 flex justify-end items-center`}>
          <div className='flex justify-end w-full gap-3'>
            <button className={`${styles.helpButton} flex items-center gap-2`} onClick={handleHelpClick}>
              <div className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
                <span className="font-semibold text-lg">?</span>
              </div>
              Help
            </button>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 p-2 rounded-md"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </nav>
        <div className={`${styles.renderingContainer}`}>
          <AdminOutlet />
        </div>
      </div>
      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-sm text-gray-700 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={executeLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
