"use client";

import {
   Search,
   ShieldCheck,
   SlidersHorizontal,
} from "lucide-react";
import {
   useEffect,
   useMemo,
   useState,
} from "react";
import { toast } from "sonner";

import { SessionDetailDialog } from "@/components/dialogs/SessionDetailDialog";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { SessionActivityCard } from "@/components/admin/SessionActivityCard";

type AdminAttendanceSession = {
   id: string;
   user_name: string;
   attendance_time: string;
   checkout_time: string | null;
   checkpoint_time: string | null;
   location_name?: string;
};

type AdminDashboardData = {
   totalAssistants: number;
   presentToday: number;
   inProgressToday: number;
   completedToday: number;
   recentAttendance: AdminAttendanceSession[];
};

type AdminDashboardResponse = {
   success: boolean;
   message?: string;
   data: AdminDashboardData;
};

const filterOptions = [
   {
      label: "All Sessions",
      value: "all",
   },
   {
      label: "In Progress",
      value: "in_progress",
   },
   {
      label: "Completed",
      value: "completed",
   },
   {
      label: "Checkpoint Missed",
      value: "checkpoint_missed",
   },
];

const AdminDashboardPage = () => {
   const [
      dashboardData,
      setDashboardData,
   ] = useState<AdminDashboardData | null>(null);

   const [
      search,
      setSearch,
   ] = useState("");

   const [
      selectedFilter,
      setSelectedFilter,
   ] = useState("all");

   const [
      isFilterOpen,
      setIsFilterOpen,
   ] = useState(false);

   const [
      isLoading,
      setIsLoading,
   ] = useState(true);

   const [
      selectedSession,
      setSelectedSession,
   ] = useState<AdminAttendanceSession | null>(null);

   useEffect(() => {
      const loadDashboard = async () => {
         try {
            const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
               toast.error("Failed to load admin dashboard");
               return;
            }
            const result = await response.json() as AdminDashboardResponse;

            if (!result.success) {
               toast.error(
                  result.message ||
                  "Failed to load admin dashboard"
               );
               return;
            }

            setDashboardData(result.data);
         } catch (error) {
            console.error(error);
            toast.error("Failed to load admin dashboard");
         } finally {
            setIsLoading(false);
         }
      };

      void loadDashboard();
   }, []);

   const filteredSessions = useMemo(() => {
      const sessions = dashboardData?.recentAttendance || [];

      return sessions.filter((session) => {
         const matchesSearch =
            session.user_name
               .toLowerCase()
               .includes(search.toLowerCase()) ||
            String(session.id).includes(search) ||
            (session.location_name || "")
               .toLowerCase()
               .includes(search.toLowerCase());

         if (selectedFilter === "all") {
            return matchesSearch;
         }

         const isCompleted = session.checkout_time !== null && session.checkpoint_time !== null;
         const isMissed = session.checkout_time !== null && session.checkpoint_time === null;

         const sessionStatusValue = isCompleted
            ? "completed"
            : isMissed
               ? "checkpoint_missed"
               : "in_progress";

         return matchesSearch && sessionStatusValue === selectedFilter;
      });
   }, [dashboardData, search, selectedFilter]);

   if (isLoading) {
      return (
         <div className="flex min-h-100 flex-1 flex-col items-center justify-center rounded-xl border border-(--pertama) bg-(--kesembilan) p-12">
            <div className="flex flex-col items-center gap-4">
               <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-(--ketiga) border-t-(--pertama)"></div>
                  <ShieldCheck size={28} className="absolute text-(--pertama) animate-pulse" />
               </div>
               <p className="text-sm font-medium tracking-wide text-(--keenam) animate-pulse">
                  Loading admin dashboard...
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className="flex flex-col gap-10 lg:gap-16">
         <div className="rounded-xl border border-(--pertama) bg-(--kesembilan) px-8 py-10 lg:py-10">
            <h1 className="text-2xl font-semibold text-(--pertama) lg:text-3xl">
               Welcome back, Admin
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-(--pertama) lg:text-base">
               Here is an overview of today&apos;s laboratory sessions and validation tasks.
            </p>
         </div>

         <StatsGrid
            totalAssistants={dashboardData?.totalAssistants || 0}
            presentToday={dashboardData?.presentToday || 0}
            inProgressToday={dashboardData?.inProgressToday || 0}
            completedToday={dashboardData?.completedToday || 0}
         />

         <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
               <h2 className="text-3xl font-semibold text-(--pertama)">
                  Activity
               </h2>

               <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
                  <div className="relative">
                     <Search
                        size={18}
                        className="absolute top-1/2 left-4 -translate-y-1/2 text-(--keenam)"
                     />

                     <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search participant, time, or session"
                        className="h-12 w-full rounded-md border border-(--pertama) bg-transparent pr-4 pl-11 text-sm outline-none sm:w-80"
                     />
                  </div>

                  <div className="relative">
                     <button
                        type="button"
                        onClick={() => setIsFilterOpen((prev) => !prev)}
                        className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-(--pertama) px-5 text-base font-semibold text-(--kedua) sm:w-auto"
                     >
                        <SlidersHorizontal size={20} />
                        Filter
                     </button>

                     {isFilterOpen && (
                        <div className="absolute right-0 top-14 z-30 w-56 rounded-md border border-(--pertama) bg-(--kedua) p-2 shadow-lg">
                           {filterOptions.map((option) => (
                              <button
                                 key={option.value}
                                 type="button"
                                 onClick={() => {
                                    setSelectedFilter(option.value);
                                    setIsFilterOpen(false);
                                  }}
                                 className={
                                    selectedFilter === option.value
                                       ? "flex h-10 w-full cursor-pointer items-center rounded-md bg-(--pertama) px-3 text-left text-sm font-semibold text-(--kedua)"
                                       : "flex h-10 w-full cursor-pointer items-center rounded-md px-3 text-left text-sm font-semibold text-(--pertama) hover:bg-(--ketiga)"
                                 }
                              >
                                 {option.label}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
               {filteredSessions.length === 0 ? (
                  <div className="rounded-md border border-(--pertama) bg-(--kesembilan) p-6 md:col-span-2 2xl:col-span-4">
                     <p className="text-sm text-(--keenam)">
                        No attendance activity found.
                     </p>
                  </div>
               ) : (
                  filteredSessions.map((session) => (
                     <SessionActivityCard
                        key={session.id}
                        session={session}
                        onClick={() => setSelectedSession(session)}
                     />
                  ))
               )}
            </div>
         </div>

         {selectedSession && (
            <SessionDetailDialog
               session={selectedSession}
               onClose={() => setSelectedSession(null)}
            />
         )}
      </div>
   );
};

export default AdminDashboardPage;
