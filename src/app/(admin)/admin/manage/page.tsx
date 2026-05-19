"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, MapPin, Clock, UserCheck, Edit2, Trash2 } from "lucide-react";

import { CreateUserDialog } from "@/components/dialogs/CreateUserDialog";
import { EditCheckpointDialog } from "@/components/dialogs/EditCheckpointDialog";
import { EditUserDialog } from "@/components/dialogs/EditorUserDialog";
import { EditSettingsDialog } from "@/components/dialogs/EditSettingsDialog";
import { ImageViewDialog } from "@/components/dialogs/ImageViewDialog";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import type {
   AppSettings,
   User,
} from "@/types/database.type";

const LIMIT = 6;

const ManagePage = () => {
   const [users, setUsers] = useState<User[]>([]);
   const [settings, setSettings] = useState<AppSettings | null>(null);

   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [isEditOpen, setIsEditOpen] = useState(false);
   const [isDeleteOpen, setIsDeleteOpen] = useState(false);
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
   const [isCheckpointOpen, setIsCheckpointOpen] = useState(false);
   const [isImageViewOpen, setIsImageViewOpen] = useState(false);

   const [selectedUser, setSelectedUser] = useState<User | null>(null);

   const [currentOffset, setCurrentOffset] = useState(0);
   const [hasMore, setHasMore] = useState(false);

   const fetchUsers = async (offset = 0, append = false) => {
      try {
         const response = await fetch(`/api/users?limit=${LIMIT}&offset=${offset}`);
         const result = await response.json();

         if (!result.success) {
            toast.error(result.message);
            return;
         }

         setUsers(prev => append ? [...prev, ...result.data] : result.data || []);
         setHasMore(result.hasMore);
      } catch (error) {
         console.error(error);
      }
   };

   const fetchSettings = async () => {
      try {
         const response = await fetch("/api/settings");
         const result = await response.json();

         if (!result.success) {
            toast.error(result.message);
            return;
         }

         setSettings(result.data);
      } catch (error) {
         console.error(error);
      }
   };

   const handleDeleteUser = async () => {
      if (!selectedUser) return;

      try {
         const response = await fetch(`/api/users/${selectedUser.id}`, {
            method: "DELETE",
         });

         const result = await response.json();

         if (!result.success) {
            toast.error(result.message);
            return;
         }

         toast.success(result.message);
         setIsDeleteOpen(false);

         setCurrentOffset(0);
         fetchUsers(0, false);
      } catch (error) {
         console.error(error);
      }
   };

   const handleLoadMore = async () => {
      const nextOffset = currentOffset + LIMIT;
      await fetchUsers(nextOffset, true);
      setCurrentOffset(nextOffset);
   };

   useEffect(() => {
      fetchUsers();
      fetchSettings();
   }, []);

   const admins = users.filter((u) => u.role === "admin");
   const regulars = users.filter((u) => u.role !== "admin");

   return (
      <div className="flex flex-col gap-6">
         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-(--pertama) bg-(--kesembilan) p-5 lg:p-7">
            <div>
               <h1 className="text-2xl lg:text-3xl font-semibold text-(--pertama)">
                  Manage Users
               </h1>
               <p className="mt-1 text-sm text-(--keenam)">
                  This page is intended for managing users
               </p>
            </div>

            <button
               onClick={() => setIsCreateOpen(true)}
               type="button"
               className="flex h-[100px] w-full lg:w-32 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-(--pertama) text-(--kedua) transition-all hover:opacity-90"
            >
               <Plus size={32} />
               <span className="text-sm font-medium">Create User</span>
            </button>
         </div>

         <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
            {settings && (
               <>
                  <div className="min-w-[300px] snap-center shrink-0 rounded-xl border border-(--pertama) bg-(--kesembilan) p-6 lg:min-w-0">
                     <div className="flex items-start justify-between">
                        <div>
                           <p className="text-xs font-medium text-(--keenam)">Attendance Settings</p>
                           <h2 className="mt-2 text-xl font-bold text-(--pertama)">Dynamic Location</h2>
                           <div className="mt-4 flex flex-col gap-1 text-sm text-(--keenam)">
                              <p>Latitude: {settings.latitude}</p>
                              <p>Longitude: {settings.longitude}</p>
                              <p>Radius: {settings.radius}m</p>
                           </div>
                           <button
                              onClick={() => setIsSettingsOpen(true)}
                              type="button"
                              className="mt-6 cursor-pointer text-sm font-medium text-blue-600 hover:underline"
                           >
                              Edit Settings
                           </button>
                        </div>
                        
                        <MapPin size={24} className="text-(--pertama) shrink-0" />
                     </div>
                  </div>

                  <div className="min-w-[300px] snap-center shrink-0 rounded-xl border border-(--pertama) bg-(--kesembilan) p-6 lg:min-w-0">
                     <div className="flex items-start justify-between">
                        <div>
                           <p className="text-xs font-medium text-(--keenam)">Attendance Settings</p>
                           <h2 className="mt-2 text-xl font-bold text-(--pertama)">Time Configuration</h2>
                           <div className="mt-4 flex flex-col gap-1 text-sm text-(--keenam)">
                              <p>Checkpoint: {settings.checkpoint_start_hour ?? 11}:00 - {settings.checkpoint_end_hour ?? 14}:00</p>
                              <p>Attendance: {settings.attendance_time_hour ?? 7}:{String(settings.attendance_time_minute ?? 30).padStart(2, "0")}</p>
                              <p>Checkout: {settings.checkout_time_hour ?? 16}:{String(settings.checkout_time_minute ?? 30).padStart(2, "0")}</p>
                           </div>
                           <button
                              onClick={() => setIsCheckpointOpen(true)}
                              type="button"
                              className="mt-6 cursor-pointer text-sm font-medium text-blue-600 hover:underline"
                           >
                              Edit Times
                           </button>
                        </div>
                        
                        <Clock size={24} className="text-(--pertama) shrink-0" />
                     </div>
                  </div>
               </>
            )}

            {admins.map((admin) => (
               <div
                  key={admin.id}
                  className="min-w-[300px] snap-center shrink-0 rounded-xl border border-(--pertama) bg-(--kesembilan) p-6 lg:min-w-0"
               >
                  <div className="flex items-start justify-between">
                     <span className="text-xs font-medium text-(--keenam)">
                        Administrator
                     </span>
                     <div className="text-(--pertama)">
                        <UserCheck size={20} />
                     </div>
                  </div>

                  <h2 className="mt-3 text-xl font-bold text-(--pertama)">
                     {admin.name}
                  </h2>
                  <p className="mt-1 text-sm text-(--keenam)">
                     {admin.email}
                  </p>

                  <div className="mt-6 flex items-center justify-between">
                     <button
                        onClick={() => {
                           setSelectedUser(admin);
                           setIsImageViewOpen(true);
                        }}
                        className="cursor-pointer text-sm font-semibold text-blue-600 hover:underline"
                     >
                        Image View
                     </button>

                     <div className="flex items-center gap-4">
                        <button
                           onClick={() => {
                              setSelectedUser(admin);
                              setIsEditOpen(true);
                           }}
                           type="button"
                           className="cursor-pointer text-(--keenam) hover:text-(--pertama)"
                           title="Edit Admin"
                        >
                           <Edit2 size={18} />
                        </button>

                        <button
                           onClick={() => {
                              setSelectedUser(admin);
                              setIsDeleteOpen(true);
                           }}
                           type="button"
                           className="cursor-pointer text-red-400 hover:text-red-600"
                           title="Delete Admin"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         <div className="mt-3">
            <h2 className="text-xl font-bold text-(--pertama) mb-5">
               All Users
            </h2>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
               {regulars.length > 0 ? (
                  regulars.map((user) => (
                     <div
                        key={user.id}
                        className="rounded-xl border border-(--pertama) bg-(--kesembilan) p-6"
                     >
                        <div className="flex items-start justify-between">
                           <span className="text-xs font-medium text-(--keenam)">
                              User
                           </span>
                           <div className="text-(--pertama)">
                              <UserCheck size={20} />
                           </div>
                        </div>

                        <h2 className="mt-3 text-xl font-bold text-(--pertama)">
                           {user.name}
                        </h2>
                        <p className="mt-1 text-sm text-(--keenam)">
                           {user.email}
                        </p>

                        <div className="mt-6 flex items-center justify-between">
                           <button
                              onClick={() => {
                                 setSelectedUser(user);
                                 setIsImageViewOpen(true);
                              }}
                              className="cursor-pointer text-sm font-semibold text-blue-600 hover:underline"
                           >
                              Image View
                           </button>

                           <div className="flex items-center gap-4">
                              <button
                                 onClick={() => {
                                    setSelectedUser(user);
                                    setIsEditOpen(true);
                                 }}
                                 type="button"
                                 className="cursor-pointer text-(--keenam) hover:text-(--pertama)"
                                 title="Edit User"
                              >
                                 <Edit2 size={18} />
                              </button>

                              <button
                                 onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteOpen(true);
                                 }}
                                 type="button"
                                 className="cursor-pointer text-red-400 hover:text-red-600"
                                 title="Delete User"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                     </div>
                  ))
               ) : (
                  <p className="text-sm text-(--keenam)">Tidak ada user biasa yang ditemukan.</p>
               )}
            </div>
         </div>

         {hasMore && (
            <div className="flex justify-center mt-2">
               <button
                  onClick={handleLoadMore}
                  className="cursor-pointer rounded-xl bg-(--pertama) px-6 py-3 text-sm font-semibold text-(--kedua) transition-opacity hover:opacity-90"
               >
                  Load More
               </button>
            </div>
         )}

         <ConfirmDialog
            title="Delete User"
            description="Apakah lu yakin ingin menghapus user ini?"
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={handleDeleteUser}
         />

         <CreateUserDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSuccess={() => {
               setCurrentOffset(0);
               fetchUsers(0, false);
            }}
         />

         <EditUserDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSuccess={() => {
               setCurrentOffset(0);
               fetchUsers(0, false);
            }}
            user={selectedUser}
         />

         <EditSettingsDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            settings={settings}
            onSuccess={fetchSettings}
         />

         <EditCheckpointDialog
            open={isCheckpointOpen}
            onOpenChange={setIsCheckpointOpen}
            settings={settings}
            onSuccess={fetchSettings}
         />

         <ImageViewDialog
            open={isImageViewOpen}
            onOpenChange={setIsImageViewOpen}
            imageUrl={selectedUser?.image_url || null}
            userName={selectedUser?.name || "User"}
         />
      </div>
   );
};

export default ManagePage;