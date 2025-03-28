"use client";

import UserAuthForm from "./user-auth-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "../../../app/globals.css";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default function SignInViewPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      // Slow down the video playback (adjust as needed)
      videoRef.current.playbackRate = 0.8;
    }
  }, []);

  const handleVideoEnded = () => {
    setFade(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
      setFade(false);
    }, 500);
  };

  return (
    <div className="relative h-screen bg-black">
      {/* Full-screen video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        className={`absolute inset-0 w-full h-full object-cover bg-black transition-opacity duration-500 ${
          fade ? "opacity-0" : "opacity-100"
        }`}
      >
        <source src="/assets/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay content */}
      <div className="relative z-10 h-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Logo & Quote */}
        <div className="hidden lg:flex flex-col p-10 text-white">
          <div className="flex items-center text-lg font-medium">
            <Image
              src="/assets/images/logo_hawktesters.svg"
              alt="Icon"
              width={12}
              height={12}
              className="mr-2 h-6 w-6"
            />
            Hawktesters
          </div>
          <div className="mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;It takes 20 years to build a reputation and few minutes
                of cyber-incident to ruin it.&rdquo;
              </p>
              <footer className="text-sm">Stephane Nappo</footer>
            </blockquote>
          </div>
        </div>

        {/* Right Column: Login Form with Gradient Background */}
        <div
          className="flex items-center justify-center p-4 lg:p-8"
          style={{
            background: "linear-gradient(to right, transparent 0%, black 35%)",
          }}
        >
          <div className="relative mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]  text-white">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Hawktesters Client Portal
              </h1>
              <p className="text-sm ">
                Enter your email below to access the portal
              </p>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Optional top-right login link */}
      <Link
        href="/examples/authentication"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 hidden md:right-8 md:top-8"
        )}
      >
        Login
      </Link>
    </div>
  );
}
