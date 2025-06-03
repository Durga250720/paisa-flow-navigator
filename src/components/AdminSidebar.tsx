
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
import { FileText, CreditCard, Repeat, Shield } from 'lucide-react';
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active status directly in the array definition
  const sidebarItems = [
    {
      title: "KYC Documents",
      icon: Shield,
      path: '/admin/kyc-documents',
      isActive: location.pathname === '/admin/kyc-documents'
    },
    {
      title: "My Borrowings",
      icon: CreditCard,
      path: '/admin/my-borrowings',
      isActive: location.pathname === '/admin/my-borrowings'
    },
    {
      title: "Repayments",
      icon: Repeat,
      path: '/admin/my-repayments',
      isActive: location.pathname === '/admin/my-repayments'
    },
    {
      title: "My Application",
      icon: FileText,
      path: '/admin/my-application',
      isActive: location.pathname === '/admin/my-application'
    }
  ];

  const footerBarItems = [
    {
      title: "Privacy Policy",
      icon: Shield,
      path: '/admin/privacy-policy',
      isActive: location.pathname === '/admin/privacy-policy'
    },
    {
      title: "Terms & Conditions",
      icon: FileText,
      path: '/admin/terms-conditions',
      isActive: location.pathname === '/admin/terms-conditions'
    }
  ]
  const handleItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <Sidebar className='p-4'>
      <SidebarContent>
        <div className={`${styles.logoContainer} flex items-center justify-center`}>
          <img
            src="/lovable-uploads/53f43cc9-5dc2-4799-81fd-84c9577132eb.png"
            alt="Paisa 108"
            className="h-8 w-auto"
          />
        </div>
        <div className={`${styles.bottomContainer}`}>
          <div className={`${styles.bottomContainer1}`}>
            <SidebarGroup className='h-full overflow-auto'>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => handleItemClick(item.path)}
                        isActive={item.isActive} // Use the isActive from the item object
                        className={`
                        w-full justify-start mb-2
                        ${styles.tabItem}
                        ${item.isActive
                            ? styles.activeItemBg
                            : '' // Default hover for non-active
                          }
                      `}
                      >
                        <item.icon className={`${item.isActive ? styles.iconActiveColor : ''} mr-2 h-4 w-4`} />
                        <span className={`${item.isActive ? styles.activeItemTitle : styles.itemTitle}`}>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
          {/* <div className={`${styles.bottomContainer2}`}>
            <SidebarGroup className='h-full overflow-auto'>
              <SidebarGroupContent>
                <SidebarMenu>
                  {footerBarItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => handleItemClick(item.path)}
                        isActive={item.isActive} // Use the isActive from the item object
                        className={`
                        w-full justify-start mb-2
                        ${styles.tabItem}
                        ${item.isActive
                            ? styles.activeItemBg
                            : '' // Default hover for non-active
                          }
                      `}
                      >
                        <item.icon className={`${item.isActive ? styles.iconActiveColor : ''} mr-2 h-4 w-4`} />
                        <span className={`${item.isActive ? styles.activeItemTitle : styles.itemTitle}`}>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div> */}
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
