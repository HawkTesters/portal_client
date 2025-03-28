"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserType } from "@prisma/client";

// Define a schema for team members with name and email only.
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Team member name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Enter a valid email address.",
  }),
});

export default function TeamForm({
  initialData,
  pageTitle,
}: {
  initialData: any | null; // Replace with your TeamMember type if available
  pageTitle: string;
}) {
  const router = useRouter();

  const defaultValues = {
    name: initialData?.name || "",
    email: initialData?.email || "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    values: defaultValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting team member:", values);

    // Prepare the payload with name, email, and userType as TEAM.
    const payload = {
      name: values.name,
      email: values.email,
      userType: UserType.TEAM,
    };

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error submitting team member:", errorData);
        toast.error("Error submitting team member.");
        return;
      }

      const data = await res.json();
      console.log("Team member submitted successfully:", data);
      toast.success("Team member submitted successfully!");
      router.push("/dashboard/team");
    } catch (error) {
      console.error("Error while submitting team member:", error);
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
            {/* Team Member Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Member Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team member name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-3" type="submit">{pageTitle}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
