
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from '@/components/AdminSidebar';
import AdminOutlet from '@/components/AdminOutlet';
import styles from '../pages-styles/Admin.module.css';
import { toast } from "sonner";

const Admin = () => {
  // const navigate = useNavigate();
   const handleHelpClick = () => {
    toast.info("This feature will be coming soon!");
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
          </div>
        </nav>
        <div className={`${styles.renderingContainer}`}>
          <AdminOutlet />
        </div>
      </div>
      {/* <div className="bg-white shadow-sm">
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
            <AdminOutlet />
          </SidebarInset>
        </div>
      </SidebarProvider> */}
    </div>
  );
};

export default Admin;
