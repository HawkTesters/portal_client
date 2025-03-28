"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Extend the schema to include new password fields.
const formSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string().optional(),
  token: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
});

type UserFormValue = z.infer<typeof formSchema>;

// Define auth states.
type AuthState = "email" | "password" | "reset" | "2fa-setup" | "2fa-verify";

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = "/dashboard/hawktesters";
  const [loading, startTransition] = useTransition();
  const [step, setStep] = useState<AuthState>("email");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const defaultValues: UserFormValue = {
    email: "demo@gmail.com",
    password: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: UserFormValue) => {
    if (step === "email") {
      // Check if a password is required for this email.
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(
          result.error || "An error occurred while verifying the email."
        );
        return;
      }

      if (result.userType && result.userType !== "GENERIC") {
        // For non-GENERIC users – reveal the password input.
        setStep("password");
        toast("Password required for this account.");
      } else {
        // For GENERIC users – sign in immediately.
        startTransition(() => {
          signIn("credentials", {
            email: data.email,
            callbackUrl,
          });
        });
        toast.success("Signed In Successfully!");
      }
    } else if (step === "password") {
      if (!data.password) {
        toast.error("Password is required");
        return;
      }
      // Call the login endpoint.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Login failed");
        return;
      }

      console.log("RESULT: ", result);
      // Check flags returned from the login endpoint.
      if (result.firstTimeLogin) {
        setUserId(result.id);
        setStep("reset");
        toast("First time login: Please reset your password.");
      } else if (result.twoFactorSetupRequired) {
        setUserId(result.id);
        setStep("2fa-setup");
        const setupRes = await fetch(
          `/api/auth/2fa/setup?userId=${result.id}`,
          { method: "GET" }
        );
        const setupData = await setupRes.json();
        if (!setupRes.ok) {
          toast.error(setupData.error || "Failed to set up 2FA.");
          return;
        }
        setQrCodeUrl(setupData.qrCodeUrl);
        toast("2FA setup required. Scan the QR code and enter your code.");
      } else if (result.twoFactorRequired) {
        setUserId(result.id);
        setStep("2fa-verify");
        toast("2FA verification required. Enter your authentication code.");
      } else {
        toast.success("Signed In Successfully!");
        window.location.href = callbackUrl;
      }
    } else if (step === "reset") {
      // Validate that both new password fields are provided and match.
      if (!data.newPassword || !data.confirmPassword) {
        toast.error("Both new password fields are required");
        return;
      }
      if (data.newPassword !== data.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      console.log("DATA: ", data);
      // Call the password-reset endpoint.
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          newPassword: data.newPassword,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Password reset failed");
        return;
      }
      // After successful reset, proceed with 2FA if needed.
      if (result.twoFactorSetupRequired) {
        setStep("2fa-setup");
        const setupRes = await fetch(`/api/auth/2fa/setup?userId=${userId}`, {
          method: "GET",
        });
        const setupData = await setupRes.json();
        if (!setupRes.ok) {
          toast.error(setupData.error || "Failed to set up 2FA.");
          return;
        }
        setQrCodeUrl(setupData.qrCodeUrl);
        toast("2FA setup required. Scan the QR code and enter your code.");
      } else if (result.twoFactorRequired) {
        setStep("2fa-verify");
        toast("2FA verification required. Enter your authentication code.");
      } else {
        toast.success("Password reset successful! Signing in.");
        signIn("credentials", {
          email: data.email,
          tokenVerified: "true",
          callbackUrl,
        });
      }
    } else if (step === "2fa-setup" || step === "2fa-verify") {
      if (!data.token) {
        toast.error("Authentication code is required");
        return;
      }
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token: data.token }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "2FA verification failed");
        return;
      }
      toast.success("2FA verification successful!");
      signIn("credentials", {
        email: data.email,
        tokenVerified: "true",
        callbackUrl,
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          {/* Email Field: shown in "email" step and remains in "password" and "reset" steps */}
          {(step === "email" || step === "password" || step === "reset") && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email..."
                      disabled={loading || step === "password"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Password Field: shown only in "password" step */}
          {step === "password" && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Reset Fields: shown only in "reset" step */}
          {step === "reset" && (
            <>
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter new password..."
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password..."
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* 2FA Token Field: shown in 2fa-setup and 2fa-verify steps */}
          {(step === "2fa-setup" || step === "2fa-verify") && (
            <>
              {step === "2fa-setup" && qrCodeUrl && (
                <div className="flex flex-col items-center">
                  <p className="mb-2">
                    Scan this QR code with your authenticator app:
                  </p>
                  <img src={qrCodeUrl} alt="2FA QR Code" className="mb-4" />
                </div>
              )}
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authentication Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your 2FA code..."
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <Button
            disabled={loading}
            className="ml-auto mt-2 w-full"
            type="submit"
          >
            {step === "email"
              ? "Continue With Email"
              : step === "password"
              ? "Sign In"
              : step === "reset"
              ? "Reset Password"
              : step === "2fa-setup"
              ? "Verify & Setup 2FA"
              : "Verify 2FA"}
          </Button>

          {(step === "password" ||
            step === "reset" ||
            step === "2fa-setup" ||
            step === "2fa-verify") && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => setStep("email")}
              disabled={loading}
              className="ml-auto w-full"
            >
              Back
            </Button>
          )}
        </form>
      </Form>
    </>
  );
}
