
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FileText, CreditCard, Repeat } from 'lucide-react';

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    {
      title: "My Application",
      icon: FileText,
      path: '/dashboard/application'
    },
    {
      title: "My Borrowings",
      icon: CreditCard,
      path: '/dashboard/borrowings'
    },
    {
      title: "Repayments",
      icon: Repeat,
      path: '/dashboard/repayments'
    }
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <Sidebar className="w-64">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => handleItemClick(item.path)}
                    isActive={location.pathname === item.path}
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
  );
};

export default DashboardSidebar;
