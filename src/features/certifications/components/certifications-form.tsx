// app/features/certifications/certification-form.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const certificationSchema = z.object({
  href: z.string().url({ message: "Please enter a valid URL" }),
});

export type CertificationFormData = z.infer<typeof certificationSchema> & {
  id?: string;
  logo?: string;
  alt?: string;
};

export default function CertificationForm({
  initialData,
  pageTitle,
  readOnly = false,
}: {
  initialData: CertificationFormData | null;
  pageTitle: string;
  readOnly?: boolean;
}) {
  const router = useRouter();

  const form = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      href: initialData?.href || "",
    },
  });

  async function onSubmit(values: CertificationFormData) {
    if (readOnly) return;
    try {
      const endpoint =
        initialData && initialData.id
          ? `/api/certifications/${initialData.id}`
          : "/api/certifications";
      const method = initialData && initialData.id ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        toast.error("Error submitting certification.");
        return;
      }
      await res.json();
      toast.success("Certification submitted successfully!");
      router.push("/dashboard/certifications");
    } catch (error) {
      console.error("Error while submitting certification:", error);
      toast.error("An unexpected error occurred.");
    }
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Certification URL Field */}
            <FormField
              control={form.control}
              name="href"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certification URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter certification URL"
                      {...field}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Display derived logo and alt if available */}
            {initialData?.href && initialData.logo && (
              <div className="mt-4">
                <img
                  src={initialData.logo}
                  alt={initialData.alt || "Certification Logo"}
                  width="100"
                />
                <p className="mt-2">URL: {initialData.href}</p>
              </div>
            )}
            {!readOnly && <Button type="submit">{pageTitle}</Button>}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
