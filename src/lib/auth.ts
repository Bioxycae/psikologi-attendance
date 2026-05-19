import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/constants/auth.constant";

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
      .setExpirationTime("7d")
      .sign(secret);
};

export const verifySession = async (
   token: string
) => {
   try {
      const { payload } =
         await jwtVerify(token, secret);

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