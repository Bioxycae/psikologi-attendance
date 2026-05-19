import { MobileHeader } from "@/components/layouts/MobileHeader";
import { NavItem } from "@/components/layouts/NavItem";
import { Sidebar } from "@/components/layouts/Sidebar";
import { LayoutDashboard, Settings, Globe } from "lucide-react";
import { ReactNode } from "react";

type AdminLayoutProps = {
   children: ReactNode;
};

const AdminLayout = ({
   children,
}: AdminLayoutProps) => {
   return (
      <div className="flex min-h-screen">
         <Sidebar>
            <div className="flex flex-col gap-3">
               <NavItem
                  href="/admin/dashboard"
                  icon={<LayoutDashboard size={22} />}
               >
                  Dashboard
               </NavItem>

               <NavItem
                  href="/admin/manage"
                  icon={<Settings size={22} />}
               >
                  Manage
               </NavItem>

               <NavItem
                  href="/admin/usertrack"
                  icon={<Globe size={22} />}
               >
                  User Track
               </NavItem>
            </div>
         </Sidebar>

         <div className="flex min-w-0 flex-1 flex-col bg-(--kedua)">
            <MobileHeader
               title="Admin"
               variant="admin"
            />

            <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 pb-8 lg:p-9 lg:pb-9"> 
               {children}
            </main>

            <footer className="border-t border-(--pertama) py-6 text-center text-xs text-(--pertama)">
               Copyright Daniel
            </footer>
         </div>
      </div>
   );
};

export default AdminLayout;
