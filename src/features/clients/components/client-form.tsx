"use client";

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
import { UserType } from "@prisma/client";
import { Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Schema validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
});

export default function ClientForm({
  initialData,
  pageTitle,
}: {
  initialData: any | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const userType = session?.user.userType || "GENERIC";

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  const [userEmails, setUserEmails] = useState<{ id: string; email: string }[]>(
    initialData?.users || []
  );
  const [newEmail, setNewEmail] = useState("");
  const [assessments] = useState<any[]>(initialData?.assessments || []);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Uploads the logo file and returns the URL
  async function uploadLogo(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("logo", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      toast.error(error.message || "Failed to upload logo.");
      return null;
    }

    const data = await res.json();
    return data.files.logo[0]; // URL of the uploaded file
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let logoUrl = initialData?.logoUrl || null;

      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
        if (!logoUrl) return; // Upload failed
      }

      const payload = {
        name: values.name,
        logoUrl,
      };

      const endpoint = initialData
        ? `/api/clients/${initialData.id}`
        : "/api/clients";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Client submission error:", errorData);
        toast.error("Error submitting client.");
        return;
      }

      toast.success("Client submitted successfully!");
      router.push("/dashboard/clients");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred.");
    }
  }

  async function handleAddEmail() {
    if (!newEmail) return;

    try {
      z.string().email().parse(newEmail);
    } catch {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!initialData) {
      toast.error("Client must be created before adding users.");
      return;
    }

    try {
      const res = await fetch(`/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          clientId: initialData.id,
          userType: UserType.CLIENT,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error adding email:", errorData);
        toast.error("Error adding user email.");
        return;
      }

      const createdUser = await res.json();
      setUserEmails([...userEmails, createdUser]);
      toast.success("User added successfully!");
      setNewEmail("");
    } catch (error) {
      console.error("Error adding user email:", error);
      toast.error("An unexpected error occurred.");
    }
  }

  async function handleRemoveEmail(userId: string) {
    if (!initialData) {
      toast.error("Client must be created before removing users.");
      return;
    }
    try {
      const res = await fetch(
        `/api/clients/${initialData.id}/users/${userId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error removing email:", errorData);
        toast.error("Error removing user email.");
        return;
      }
      setUserEmails(userEmails.filter((user) => user.id !== userId));
      toast.success("User removed successfully!");
    } catch (error) {
      console.error("Error removing user email:", error);
      toast.error("An unexpected error occurred.");
    }
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Company Logo</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <Button type="submit">{pageTitle}</Button>
          </form>
        </Form>

        {/* User Emails */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">User Emails</h3>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter user email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Button type="button" onClick={handleAddEmail}>
              Add
            </Button>
          </div>
          {userEmails.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded border p-2"
            >
              {user.email}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveEmail(user.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Assessments hidden if CLIENT */}
        {userType !== UserType.CLIENT && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Assessments</h3>
            {assessments.map((a) => (
              <div key={a.id} className="p-4 border rounded">
                <strong>{a.title}</strong>
                <div className="text-sm">
                  Deadline: {new Date(a.deadline).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
