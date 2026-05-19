export const formatAttendanceDate =
   (
      value: string
   ) => {
      const date =
         new Date(value);

      const formattedDate =
         new Intl.DateTimeFormat(
            "id-ID",
            {
               day: "2-digit",
               month: "long",
               year: "numeric",
            }
         ).format(date);

      const formattedTime =
         new Intl.DateTimeFormat(
            "id-ID",
            {
               hour: "2-digit",
               minute: "2-digit",
               second: "2-digit",
               hour12: false,
               timeZone:
                  "Asia/Jakarta",
            }
         )
            .format(date)
            .replaceAll(
               ".",
               ":"
            );

      return `${formattedDate} pukul ${formattedTime}`;
   };