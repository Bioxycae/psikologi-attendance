import { MobileHeader } from "@/components/layouts/MobileHeader";
import { NavItem } from "@/components/layouts/NavItem";
import { Sidebar } from "@/components/layouts/Sidebar";
import { History, LayoutDashboard, ScanFace } from "lucide-react";
import { ReactNode } from "react";

type UserLayoutProps = {
   children: ReactNode;
};

const UserLayout = ({
   children,
}: UserLayoutProps) => {
   return (
      <div className="flex h-screen">
         <Sidebar>
            <NavItem
               href="/dashboard"
               icon={<LayoutDashboard size={22} />}
            >
               Dashboard
            </NavItem>

            <NavItem
               href="/history"
               icon={<History size={22} />}
            >
               History
            </NavItem>

            <NavItem
               href="/validate"
               icon={<ScanFace size={22} />}
            >
               Validate
            </NavItem>
         </Sidebar>

         <div className="flex min-w-0 flex-1 flex-col bg-(--kedua)">
            <MobileHeader title="PsychoLab" />

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

export default UserLayout;
