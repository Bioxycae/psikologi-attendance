import { PRESENSI_STATUS } from "@/constants/presensi.constant";

export type PresensiStatus =
   (typeof PRESENSI_STATUS)[keyof typeof PRESENSI_STATUS];