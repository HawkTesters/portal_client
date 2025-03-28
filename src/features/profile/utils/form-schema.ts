import * as z from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  cv: z.object({
    jobTitle: z.string().min(1, { message: "Job Title is required" }),
    greetingTitle: z.string().optional(),
    greetingDescription: z.string().optional(),
    languages: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([]),
    experience: z
      .array(
        z.object({
          title: z.string().min(1, { message: "Experience title is required" }),
          subtitle: z
            .string()
            .min(1, { message: "Experience subtitle is required" }),
          yearRange: z.string().min(1, { message: "Year range is required" }),
          description: z
            .string()
            .min(1, { message: "Experience description is required" }),
        })
      )
      .default([]),
    achievements: z
      .array(
        z.object({
          icon: z.string().min(1, { message: "Achievement icon is required" }),
          value: z
            .string()
            .min(1, { message: "Achievement value is required" }),
          description: z
            .string()
            .min(1, { message: "Achievement description is required" }),
        })
      )
      .default([]),
    userCertifications: z
      .array(
        z.object({
          certification: z.object({
            alt: z
              .string()
              .min(1, { message: "Certification alt text is required" }),
            logo: z
              .string()
              .min(1, { message: "Certification logo is required" }),
            title: z
              .string()
              .min(1, { message: "Certification title is required" }),
          }),
          // Optionally, you can use the same logo as the static one or allow an override.
          logo: z
            .string()
            .min(1, { message: "User Certification logo is required" }),
          href: z
            .string()
            .url({ message: "Certification link must be a valid URL" }),
        })
      )
      .default([]),
  }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;