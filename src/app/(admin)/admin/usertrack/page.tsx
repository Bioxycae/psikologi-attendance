"use client";

import {
   User,
   Monitor,
   Smartphone,
   Globe,
   Clock,
   Trash2,
   Loader2,
   Search,
   ShieldAlert,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

type SessionUser = {
   name: string;
   email: string;
   image_url: string | null;
};

type ActiveSession = {
   id: string;
   user_id: string;
   ip_address: string;
   device_info: string;
   created_at: string;
   last_active: string;
   users: SessionUser | null;
};

type APIResponse = {
   success: boolean;
   message?: string;
   data?: ActiveSession[];
};

const UserTrackPage = () => {
   const [sessions, setSessions] = useState<ActiveSession[]>([]);
   const [search, setSearch] = useState("");
   const [isLoading, setIsLoading] = useState(true);
   const [revokingId, setRevokingId] = useState<string | null>(null);

   const loadSessions = async () => {
      try {
         const response = await fetch("/api/admin/sessions", { cache: "no-store" });
         const contentType = response.headers.get("content-type");
         if (!contentType || !contentType.includes("application/json")) {
            toast.error("Gagal memuat sesi aktif");
            return;
         }
         const result = await response.json() as APIResponse;

         if (!result.success || !result.data) {
            toast.error(result.message || "Gagal memuat sesi aktif");
            return;
         }

         setSessions(result.data);
      } catch (error) {
         console.error(error);
         toast.error("Gagal menghubungkan ke server");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      void loadSessions();
   }, []);

   const handleRevokeSession = async (id: string) => {
      try {
         setRevokingId(id);
         const response = await fetch(`/api/admin/sessions?id=${id}`, {
            method: "DELETE",
         });
         const contentType = response.headers.get("content-type");
         if (!contentType || !contentType.includes("application/json")) {
            toast.error("Gagal mengakhiri sesi");
            return;
         }
         const result = await response.json() as APIResponse;

         if (!result.success) {
            toast.error(result.message || "Gagal mengakhiri sesi");
            return;
         }

         toast.success("Sesi berhasil diakhiri");
         setSessions((prev) => prev.filter((session) => session.id !== id));
      } catch (error) {
         console.error(error);
         toast.error("Terjadi kesalahan koneksi");
      } finally {
         setRevokingId(null);
      }
   };

   const parseDevice = (userAgent: string) => {
      const ua = userAgent.toLowerCase();
      let osName = "Unknown OS";
      let browserName = "Browser";

      if (ua.includes("windows")) osName = "Windows";
      else if (ua.includes("android")) osName = "Android";
      else if (ua.includes("iphone") || ua.includes("ipad")) osName = "iOS";
      else if (ua.includes("macintosh") || ua.includes("mac os")) osName = "macOS";
      else if (ua.includes("linux")) osName = "Linux";

      if (ua.includes("edg")) browserName = "Edge";
      else if (ua.includes("chrome") && !ua.includes("chromium")) browserName = "Chrome";
      else if (ua.includes("safari") && !ua.includes("chrome")) browserName = "Safari";
      else if (ua.includes("firefox")) browserName = "Firefox";
      else if (ua.includes("opera") || ua.includes("opr")) browserName = "Opera";
      else if (ua.includes("mobile")) browserName = "Mobile Browser";

      return { osName, browserName };
   };

   const filteredSessions = useMemo(() => {
      return sessions.filter((session) => {
         const name = session.users?.name?.toLowerCase() || "";
         const email = session.users?.email?.toLowerCase() || "";
         const ip = session.ip_address?.toLowerCase() || "";
         const query = search.toLowerCase();

         return name.includes(query) || email.includes(query) || ip.includes(query);
      });
   }, [sessions, search]);

   if (isLoading) {
      return (
         <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center rounded-xl border border-(--pertama) bg-(--kesembilan) p-12">
            <div className="flex flex-col items-center gap-4">
               <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-(--ketiga) border-t-(--pertama)"></div>
                  <ShieldAlert size={28} className="absolute text-(--pertama) animate-pulse" />
               </div>
               <p className="text-sm font-medium tracking-wide text-(--keenam) animate-pulse">
                  Loading active sessions...
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className="flex flex-col gap-10 lg:gap-16">
         <div className="rounded-xl border border-(--pertama) bg-(--kesembilan) px-8 py-10 lg:py-10">
            <h1 className="text-2xl font-semibold text-(--pertama) lg:text-3xl">
               User Sessions Tracking
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-(--pertama) lg:text-base">
               Pantau dan kelola semua sesi aktif pengguna. Anda dapat memutuskan sesi perangkat kapan saja secara instan.
            </p>
         </div>

         <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
               <h2 className="text-3xl font-semibold text-(--pertama)">
                  Active Sessions ({filteredSessions.length})
               </h2>

               <div className="relative w-full lg:w-80">
                  <Search
                     size={18}
                     className="absolute top-1/2 left-4 -translate-y-1/2 text-(--keenam)"
                  />
                  <input
                     type="text"
                     value={search}
                     onChange={(event) => setSearch(event.target.value)}
                     placeholder="Cari nama, email, atau IP Address..."
                     className="h-12 w-full rounded-md border border-(--pertama) bg-transparent pr-4 pl-11 text-sm outline-none"
                  />
               </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
               {filteredSessions.length === 0 ? (
                  <div className="rounded-md border border-(--pertama) bg-(--kesembilan) p-8 text-center">
                     <p className="text-sm text-(--keenam)">
                        Tidak ada sesi aktif yang ditemukan.
                     </p>
                  </div>
               ) : (
                  filteredSessions.map((session) => {
                     const { osName, browserName } = parseDevice(session.device_info);
                     const isMobile = osName === "Android" || osName === "iOS";
                     const formattedDate = new Date(session.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Jakarta",
                     });

                      return (
                        <div
                           key={session.id}
                           className="flex flex-col gap-5 rounded-lg border border-(--pertama) bg-(--kesembilan) p-5 shadow-sm transition-all hover:bg-slate-50/5 xl:flex-row xl:items-center xl:justify-between xl:p-6"
                        >
                           <div className="flex items-center gap-4 w-full xl:w-auto">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--pertama) text-white overflow-hidden border border-(--pertama)">
                                 {session.users?.image_url ? (
                                    <img
                                       src={session.users.image_url}
                                       alt={session.users.name}
                                       className="h-full w-full object-cover"
                                    />
                                 ) : (
                                    <User size={22} />
                                 )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                 <h3 className="truncate text-base font-semibold text-(--pertama)">
                                    {session.users?.name || "Unknown User"}
                                 </h3>
                                 <p className="truncate text-sm text-(--keenam)">
                                    {session.users?.email || "No Email"}
                                 </p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:flex xl:items-center xl:gap-12 w-full xl:w-auto">
                              <div className="flex items-center gap-2.5">
                                 {isMobile ? (
                                    <Smartphone size={18} className="text-(--pertama)" />
                                 ) : (
                                    <Monitor size={18} className="text-(--pertama)" />
                                 )}
                                 <div className="flex flex-col">
                                    <span className="text-xs text-(--keenam) leading-none">Device / OS</span>
                                    <span className="text-sm font-medium text-(--pertama)">
                                       {osName} ({browserName})
                                     </span>
                                 </div>
                              </div>

                              <div className="flex items-center gap-2.5">
                                 <Globe size={18} className="text-(--pertama)" />
                                 <div className="flex flex-col">
                                    <span className="text-xs text-(--keenam) leading-none">IP Address</span>
                                    <span className="text-sm font-medium text-(--pertama)">
                                       {session.ip_address}
                                    </span>
                                 </div>
                              </div>

                              <div className="flex items-center gap-2.5">
                                 <Clock size={18} className="text-(--pertama)" />
                                 <div className="flex flex-col">
                                    <span className="text-xs text-(--keenam) leading-none">Login Sejak</span>
                                    <span className="text-sm font-medium text-(--pertama)">
                                       {formattedDate}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center justify-end border-t border-(--pertama) pt-4 xl:border-t-0 xl:pt-0 w-full xl:w-auto">
                              <button
                                 type="button"
                                 onClick={() => void handleRevokeSession(session.id)}
                                 disabled={revokingId === session.id}
                                 className="flex h-11 w-full xl:w-auto cursor-pointer items-center justify-center gap-2 rounded-md border border-red-500 bg-transparent px-4 text-sm font-semibold text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:pointer-events-none disabled:opacity-50"
                              >
                                 {revokingId === session.id ? (
                                    <>
                                       <Loader2 size={16} className="animate-spin" />
                                       Revoking...
                                    </>
                                 ) : (
                                    <>
                                       <Trash2 size={16} />
                                       Revoke Session
                                    </>
                                 )}
                              </button>
                           </div>
                        </div>
                     );
                  })
               )}
            </div>
         </div>
      </div>
   );
};

export default UserTrackPage;
