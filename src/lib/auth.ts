import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/constants/auth.constant";
import { createServerSupabase } from "@/lib/supabase/server";

import type { SessionPayload } from "@/types/auth.type";

const secretKey = process.env.JWT_SECRET!;
const secret = new TextEncoder().encode(secretKey);

export const comparePassword = async (
   password: string,
   hashedPassword: string
) => {
   return bcrypt.compare(password, hashedPassword);
};

export const createSession = async (
   payload: SessionPayload
) => {
   return await new SignJWT(payload)
      .setProtectedHeader({
         alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime("3650d")
      .sign(secret);
};

export const verifySession = async (
   token: string
) => {
   try {
      const { payload } =
         await jwtVerify(token, secret);

      const supabase = createServerSupabase();
      const { data: dbSession, error } = await supabase
         .from("user_sessions")
         .select("id")
         .eq("token", token)
         .single();

      if (error || !dbSession) {
         return null;
      }

      return payload as SessionPayload;
   } catch {
      return null;
   }
};

export const getSession =
   async () => {
      const cookieStore =
         await cookies();

      const token = cookieStore.get(SESSION_COOKIE)?.value;

      if (!token) {
         return null;
      }

      return verifySession(token);
   };