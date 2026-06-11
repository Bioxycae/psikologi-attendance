"use client";

import { Footer } from "@/components/layouts/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { loginSchema, LoginSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    BrainCircuit,
    Eye,
    EyeOff,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const LoginPage = () => {
   const router = useRouter();
   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<LoginSchema>({
      resolver: zodResolver(loginSchema),
   });

   const handleLogin = async (
      data: LoginSchema
   ) => {
      try {
         setIsSubmitting(true);
         const response = await fetch(
            "/api/login",
            {
               method: "POST",
               headers: {
                  "Content-Type":
                     "application/json",
               },
               body: JSON.stringify(data),
            }
         );

         const result =
            await response.json();

         if (!response.ok) {
            toast.error(result.message, {
               id: "login-error",
            });
            setIsSubmitting(false);
            return;
         }

         toast.success("Login berhasil", {
            id: "login-success",
         });

         if (result.role === "admin") {
            router.replace("/admin/dashboard");

            return;
         }

         router.replace("/dashboard");
      } catch {
         toast.error(
            "Terjadi kesalahan server",
            {
               id: "server-error",
            }
         );
         setIsSubmitting(false);
      }
   };

   return (
      <div className="flex min-h-screen flex-col bg-(--kedua)">
         <main className="flex flex-1 flex-col items-center justify-center px-6">
            <Card className="max-w-142 rounded-xl p-6 lg:p-6">
               <div className="flex flex-col items-center">
                  <div className="mb-8 flex items-center gap-3 pt-3">
                     <BrainCircuit
                        size={24}
                        className="text-purple-300"
                     />

                     <h1 className="text-xl font-semibold tracking-wide text-(--pertama)">
                        PsychoLabskuy
                     </h1>
                  </div>

                  <form
                     onSubmit={handleSubmit(handleLogin)}
                     className="w-full"
                  >
                     <div className="flex flex-col gap-3">

                        <div className="flex flex-col gap-1">
                           <label className="text-xl font-semibold tracking-wide text-(--pertama)">
                              Email
                           </label>

                           <Input
                              type="email"
                              placeholder="example@gmail.com"
                              className="h-9"
                              {...register("email")}
                           />
                           {errors.email && (
                              <p className="text-sm text-red-500">
                                 {errors.email.message}
                              </p>
                           )}
                        </div>

                        <div className="flex flex-col gap-2">
                           <label className="text-xl font-semibold tracking-wide text-(--pertama)">
                              Password
                           </label>

                           <div className="relative">
                              <Input
                                 type={
                                    isPasswordVisible
                                       ? "text"
                                       : "password"
                                 }
                                 placeholder="**********"
                                 className="h-9 pr-12"
                                 {...register("password")}
                              />
                              {errors.password && (
                                 <p className="text-sm text-red-500">
                                    {errors.password.message}
                                 </p>
                              )}

                              <button
                                 type="button"
                                 onClick={() =>
                                    setIsPasswordVisible(
                                       !isPasswordVisible
                                    )
                                 }
                                 className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
                              >
                                 {isPasswordVisible ? (
                                    <Eye
                                       size={20}
                                       className="text-(--pertama)"
                                    />
                                 ) : (
                                    <EyeOff
                                       size={20}
                                       className="text-(--pertama)"
                                    />
                                 )}
                              </button>
                           </div>
                        </div>

                        <Button
                           type="submit"
                           disabled={isSubmitting}
                           className="mt-1 h-11 rounded-md text-base font-bold flex items-center justify-center gap-2"
                        >
                           {isSubmitting ? (
                              <>
                                 <Loader2 size={18} className="animate-spin" />
                                 Logging in...
                              </>
                           ) : (
                              "Login"
                           )}
                        </Button>
                     </div>
                  </form>
               </div>
            </Card>
            <div className="mt-6 text-center text-sm font-light text-(--pertama) lg:text-xl">
               <span>Need access? </span>

               <Link
                  href="https://wa.me/6287871371566"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-(--kedelapan) underline"
               >
                  Contact Lab Administrator
               </Link>
            </div>
         </main>

         <Footer />
      </div>
   );
};

export default LoginPage;
