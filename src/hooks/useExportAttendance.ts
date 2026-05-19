"use client";

import { useState } from "react";

import { toast } from "sonner";

type ExportOptions = {
   startDate?: string;
   endDate?: string;
};

export const useExportAttendance =
   () => {
      const [
         isExporting,
         setIsExporting,
      ] = useState(false);

      const handleExport =
         async (
            options?: ExportOptions
         ) => {
            try {
               setIsExporting(true);

               const params =
                  new URLSearchParams();

               if (
                  options?.startDate
               ) {
                  params.append(
                     "startDate",
                     options.startDate
                  );
               }

               if (
                  options?.endDate
               ) {
                  params.append(
                     "endDate",
                     options.endDate
                  );
               }

               const response =
                  await fetch(
                     `/api/attendance/export?${params.toString()}`
                  );

               if (
                  !response.ok
               ) {
                  toast.error(
                     "Gagal export data"
                  );

                  return;
               }

               const blob =
                  await response.blob();

               const url =
                  window.URL.createObjectURL(
                     blob
                  );

               const a =
                  document.createElement(
                     "a"
                  );

               a.href = url;

               a.download =
                  `attendance_${Date.now()}.csv`;

               document.body.appendChild(
                  a
               );

               a.click();

               window.URL.revokeObjectURL(
                  url
               );

               document.body.removeChild(
                  a
               );

               toast.success(
                  "Data berhasil diexport"
               );
            } catch (error) {
               console.error(error);

               toast.error(
                  "Gagal export data"
               );
            } finally {
               setIsExporting(false);
            }
         };

      return {
         isExporting,

         handleExport,
      };
   };
