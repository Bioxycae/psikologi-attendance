export type UserRole =
   | "admin"
   | "user";

export type SessionPayload = {
   id: string;
   name: string;
   email: string;
   role: UserRole;
};