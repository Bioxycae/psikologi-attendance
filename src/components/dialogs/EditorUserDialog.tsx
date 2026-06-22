"use client";
/* eslint-disable @next/next/no-img-element */

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, ImagePlus, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
    updateUserSchema,
    type UpdateUserSchema,
} from "@/schemas/user.schema";

type EditUserDialogProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onSuccess: () => void;
   user: {
      id: string;
      name: string;
      email: string;
      role: string;
      image_url?: string | null;
   } | null;
};

export const EditUserDialog = ({
   open,
   onOpenChange,
   onSuccess,
   user,
}: EditUserDialogProps) => {
   const [previewImage, setPreviewImage] = useState<string | null>(null);
   const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
   const [showPassword, setShowPassword] = useState(false);

   const {
      register,
      handleSubmit,
      reset,
      setValue,
      control,
      formState: { errors, isSubmitting },
   } = useForm<UpdateUserSchema>({
      resolver: zodResolver(updateUserSchema),
   });

   const roleValue = useWatch({ control, name: "role" });

   useEffect(() => {
      if (!user) return;
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("role", user.role as "admin" | "user");
      setPreviewImage(user.image_url || null);
   }, [user, setValue]);

   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setValue("image", file);
      setPreviewImage(URL.createObjectURL(file));
   };

   const handleUpdateUser = async (data: UpdateUserSchema) => {
      if (!user) return;

      try {
         const formData = new FormData();
         formData.append("name", data.name);
         formData.append("email", data.email);
         if (data.password) formData.append("password", data.password);
         formData.append("role", data.role);
         if (data.image) formData.append("image", data.image);

         const response = await fetch(`/api/users/${user.id}`, {
            method: "PUT",
            body: formData,
         });

         const result = await response.json();

         if (!result.success) {
            toast.error(result.message);
            return;
         }

         toast.success(result.message);
         if (data.password) {
            navigator.clipboard.writeText(data.password);
            toast.success("New password copied successfully!");
         }
         reset();
         onOpenChange(false);
         onSuccess();
      } catch (error) {
         console.error(error);
         toast.error("Failed to update user");
      }
   };

   const inputClass = "h-11 w-full rounded-md border border-(--pertama) px-4 text-sm text-(--pertama) outline-none";
   const labelClass = "text-sm font-medium text-(--pertama)";

   return (
      <Dialog.Root open={open} onOpenChange={(open) => {
         if (!open) setIsRoleMenuOpen(false);
         onOpenChange(open);
      }}>
         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-(--pertama) bg-(--kesembilan) p-6 shadow-xl">
               <div className="flex flex-col gap-5">
                  <div>
                     <Dialog.Title className="text-xl font-semibold text-(--pertama)">
                        Edit User
                     </Dialog.Title>

                     <Dialog.Description className="mt-1 text-sm text-(--keenam)">
                        Update user information
                     </Dialog.Description>
                  </div>

                  <form
                     onSubmit={handleSubmit(handleUpdateUser)}
                     className="flex flex-col gap-4"
                  >
                     <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Profile Image</label>
                        <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-(--pertama) bg-white transition-colors hover:bg-(--ketiga)/50">
                           {previewImage ? (
                              <img
                                 src={previewImage}
                                 alt="Preview"
                                 className="h-full w-full object-contain p-2"
                              />
                           ) : (
                              <div className="flex flex-col items-center justify-center gap-1 text-(--pertama)">
                                 <ImagePlus size={24} />
                                 <span className="text-sm font-semibold">Choose File</span>
                                 <span className="text-xs font-normal text-(--keenam)">No image selected</span>
                              </div>
                           )}
                           <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                           />
                        </label>
                     </div>

                     <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Name</label>
                        <input
                           type="text"
                           placeholder="Input name"
                           {...register("name")}
                           className={inputClass}
                        />
                        {errors.name && (
                           <p className="text-xs text-red-500">{errors.name.message}</p>
                        )}
                     </div>

                     <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Email</label>
                        <input
                           type="email"
                           placeholder="Input email"
                           {...register("email")}
                           className={inputClass}
                        />
                        {errors.email && (
                           <p className="text-xs text-red-500">{errors.email.message}</p>
                        )}
                     </div>

                     <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Old Password</label>
                        <input
                           type="text"
                           disabled
                           value="•••••••• (Encrypted)"
                           className={`${inputClass} bg-gray-100/50 text-gray-500 cursor-not-allowed`}
                        />
                     </div>

                     <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>
                           New Password <span className="text-xs font-normal text-(--keenam)">(Leave empty to keep unchanged)</span>
                        </label>
                        <div className="relative">
                           <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Input new password"
                              {...register("password")}
                              className={`${inputClass} pr-10`}
                           />
                           <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--keenam) hover:text-(--pertama) cursor-pointer"
                              title={showPassword ? "Hide Password" : "Show Password"}
                           >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                           </button>
                        </div>
                        {errors.password && (
                           <p className="text-xs text-red-500">{errors.password.message}</p>
                        )}
                     </div>

                     <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Role</label>
                        <div className="relative">
                           <button
                              type="button"
                              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                              className={`${inputClass} flex cursor-pointer items-center justify-between`}
                           >
                              <span className={roleValue ? "text-(--pertama)" : "text-gray-400"}>
                                 {roleValue === "admin" ? "Admin" : roleValue === "user" ? "User" : "Select role"}
                              </span>
                              <ChevronDown size={18} className={`text-(--pertama) transition-transform ${isRoleMenuOpen ? "rotate-180" : ""}`} />
                           </button>

                           {isRoleMenuOpen && (
                              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-(--pertama) bg-white shadow-lg">
                                 <button
                                    type="button"
                                    onClick={() => { setValue("role", "admin", { shouldValidate: true }); setIsRoleMenuOpen(false); }}
                                    className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors hover:bg-(--pertama) hover:text-white ${roleValue === "admin" ? "bg-(--pertama) text-white" : "text-(--pertama)"}`}
                                 >
                                    Admin
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => { setValue("role", "user", { shouldValidate: true }); setIsRoleMenuOpen(false); }}
                                    className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors hover:bg-(--pertama) hover:text-white ${roleValue === "user" ? "bg-(--pertama) text-white" : "text-(--pertama)"}`}
                                 >
                                    User
                                 </button>
                              </div>
                           )}
                        </div>
                        {errors.role && (
                           <p className="text-xs text-red-500">{errors.role.message}</p>
                        )}
                     </div>

                     <div className="flex justify-end gap-3 pt-4">
                        <button
                           type="button"
                           onClick={() => onOpenChange(false)}
                           className="cursor-pointer rounded-md border border-(--pertama) px-5 py-2.5 text-sm font-medium text-(--pertama) transition-colors hover:bg-(--ketiga)"
                        >
                           Cancel
                        </button>

                        <button
                           type="submit"
                           disabled={isSubmitting}
                           className="cursor-pointer rounded-md bg-(--pertama) px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                        >
                           {isSubmitting ? "Updating..." : "Update User"}
                        </button>
                     </div>
                  </form>
               </div>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   );
};