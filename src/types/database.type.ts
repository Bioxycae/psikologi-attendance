import type { UserRole } from "./auth.type";

export type User = {
   id: string;
   name: string;
   email: string;
   password: string;
   role: UserRole;
   image_url: string | null;
   image_public_id: string | null;
   created_at: string;
};

export type Presensi = {
   id: string;
   user_id: string;
   latitude: number;
   longitude: number;
   face_verified: boolean;
   liveness_verified: boolean;
   qr_code: string;
   created_at: string;
};

export type AppSettings = {
   id: string;
   latitude: number;
   longitude: number;
   radius: number;
   checkpoint_start_hour: number;
   checkpoint_end_hour: number;
   attendance_time_hour: number;
   attendance_time_minute: number;
   checkout_time_hour: number;
   checkout_time_minute: number;
   created_at: string;
};