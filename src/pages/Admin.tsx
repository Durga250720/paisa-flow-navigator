
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from '@/components/AdminSidebar';
import AdminOutlet from '@/components/AdminOutlet';
import styles from '../pages-styles/Admin.module.css';
import { toast } from "sonner";
import { LogOut } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();

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
    toast.info("Logout functionality to be implemented!");
    localStorage.clear();
    navigate('/');
    toast.success("You have been logged out successfully!");
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
          <div className='flex justify-end w-full'>
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
    </div>
  );
};

export default Admin;
