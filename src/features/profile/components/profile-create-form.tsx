"use client";
import { useEffect, useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProfileFormValues, profileSchema } from "../utils/form-schema";

interface ProfileFormType {
  initialData: ProfileFormValues | null;
  categories: any;
}

const ProfileCreateForm: React.FC<ProfileFormType> = ({
  initialData,
  categories,
}) => {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(0);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // NEW: State for available certifications from the API
  const [availableCerts, setAvailableCerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await fetch("/api/certifications");
        if (!res.ok) {
          throw new Error("Failed to fetch certifications");
        }
        const certs = await res.json();
        setAvailableCerts(certs);
      } catch (error) {
        console.error("Error fetching certifications:", error);
      }
    };

    fetchCerts();
  }, []);

  const title = initialData ? "Edit CV" : "Create Your CV";
  const description = initialData
    ? "Edit your CV details."
    : "Let's create your professional CV.";
  const toastMessage = initialData ? "CV updated." : "CV created.";
  const action = initialData ? "Save changes" : "Create";

  // Default values adapted for a nested CV structure.
  const defaultValues: ProfileFormValues = {
    name: "",
    email: "",
    cv: {
      jobTitle: "",
      greetingTitle: "",
      greetingDescription: "",
      languages: [],
      interests: [],
      experience: [
        {
          title: "",
          subtitle: "",
          yearRange: "",
          description: "",
        },
      ],
      achievements: [
        {
          icon: "",
          value: "",
          description: "",
        },
      ],
      userCertifications: [
        {
          certification: {
            alt: "",
            logo: "",
            title: "",
          },
          logo: "",
          href: "",
        },
      ],
    },
  };

  // Initialize the form.
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    control,
    formState: { errors },
  } = form;

  // Field arrays for nested arrays in CV.
  const { append, remove, fields } = useFieldArray({
    control,
    name: "cv.experience",
  });

  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({
    control,
    name: "cv.achievements",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control,
    name: "cv.userCertifications",
  });

  // Pre-populate form if initialData exists.
  useEffect(() => {
    if (initialData) {
      console.log(initialData);
      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        cv: {
          jobTitle: initialData.cv.jobTitle || "",
          greetingTitle: initialData.cv.greetingTitle || "",
          greetingDescription: initialData.cv.greetingDescription || "",
          experience:
            initialData.cv.experience && initialData.cv.experience.length > 0
              ? initialData.cv.experience
              : defaultValues.cv.experience,
          languages: initialData.cv.languages || [],
          interests: initialData.cv.interests || [],
          achievements:
            initialData.cv.achievements &&
            initialData.cv.achievements.length > 0
              ? initialData.cv.achievements
              : defaultValues.cv.achievements,
          userCertifications:
            initialData.cv.userCertifications &&
            initialData.cv.userCertifications.length > 0
              ? initialData.cv.userCertifications
              : defaultValues.cv.userCertifications,
        },
      });
    }
  }, [initialData, form]);

  // Steps for the multi-step form.
  const steps = [
    {
      id: "Step 1",
      name: "Basic Information",
      fields: [
        "name",
        "email",
        "cv.jobTitle",
        "cv.greetingTitle",
        "cv.greetingDescription",
        "cv.languages",
        "cv.interests",
      ],
    },
    {
      id: "Step 2",
      name: "Professional Experience",
      fields: fields
        ?.map((_, index) => [
          `cv.experience.${index}.title`,
          `cv.experience.${index}.subtitle`,
          `cv.experience.${index}.yearRange`,
          `cv.experience.${index}.description`,
        ])
        .flat(),
    },
    {
      id: "Step 3",
      name: "Certifications & Achievements",
      fields: [], // Add validations if needed.
    },
    { id: "Step 4", name: "Complete" },
  ];

  const next = async () => {
    const fieldsToValidate = steps[currentStep].fields;

    // Validate step’s fields
    if (fieldsToValidate && fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate, {
        shouldFocus: true,
      });
      if (!isValid) return;
    }

    // If not at last step, just go forward
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On the last step, do the actual submission
      await form.handleSubmit(processForm)();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep(currentStep - 1);
    }
  };

  const processForm: SubmitHandler<ProfileFormValues> = async (data) => {
    // Ensure nested arrays are defined.
    const payload = {
      ...data,
      cv: {
        ...data.cv,
        achievements: data.cv.achievements ?? [],
        certifications: data.cv.userCertifications ?? [],
      },
    };

    setData(payload);
    try {
      setLoading(true);
      const teamId = params?.id || initialData?.id;
      if (initialData) {
        const res = await fetch(`/api/team/${teamId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error("Failed to update CV");
        }
      } else {
        const res = await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error("Failed to create CV");
        }
      }
      router.refresh();
      router.push(`/api/team/${teamId}/cv`);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      if (initialData) {
        const res = await fetch(`/api/team/${params.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Failed to delete CV");
        }
      }
      router.refresh();
      router.push(`/dashboard/cv`);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
      </div>
      <Separator />
      <div>
        <ul className="flex gap-4">
          {steps.map((step, index) => (
            <li key={step.name} className="md:flex-1">
              {currentStep > index ? (
                <div className="group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
                  <span className="text-sm font-medium text-sky-600 transition-colors">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className="flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-sky-600">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : (
                <div className="group flex h-full w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
                  <span className="text-sm font-medium text-gray-500 transition-colors">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(processForm)}
          className="w-full space-y-8"
        >
          <div
            className={cn(
              currentStep === 1 || currentStep === 2
                ? "w-full md:inline-block"
                : "gap-8 md:grid md:grid-cols-3"
            )}
          >
            {currentStep === 0 && (
              <>
                {/* Profile Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Your Name"
                          {...field}
                        />
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
                        <Input
                          disabled={loading}
                          placeholder="your.email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Job Title */}
                <FormField
                  control={form.control}
                  name="cv.jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Your Position"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Greeting Title */}
                <FormField
                  control={form.control}
                  name="cv.greetingTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Greeting Title</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Hello, I'm ..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Languages (split by ',' but each entry is a "Language: Level" pair) */}
                <FormField
                  control={form.control}
                  name="cv.languages"
                  render={({ field: { value, onChange } }) => {
                    /**
                     * Local state array of objects, each item is { language, level }.
                     * Example: "English: Fluent C2" => { language: "English", level: "Fluent C2" }
                     */
                    const [langArray, setLangArray] = useState<
                      { language: string; level: string }[]
                    >([]);

                    // Parse the incoming array-of-strings from react-hook-form
                    useEffect(() => {
                      if (Array.isArray(value)) {
                        const parsed = value.map((item) => {
                          // Each item is in the format "English: Fluent C2"
                          const [language, level] = item
                            .split(":")
                            .map((x) => x.trim());
                          return {
                            language: language || "",
                            level: level || "",
                          };
                        });
                        setLangArray(parsed);
                      }
                    }, [value]);

                    // Helper to rebuild the string array and call onChange for RHF
                    const updateFormValue = (
                      arr: { language: string; level: string }[]
                    ) => {
                      // Re-join: { language, level } => "English: Fluent C2"
                      const joined = arr
                        .filter((obj) => !!obj.language) // keep only non-empty
                        .map((obj) => `${obj.language}: ${obj.level}`);
                      onChange(joined); // pass the updated array of strings back to RHF
                    };

                    // Handlers
                    const handleAdd = () => {
                      const updated = [
                        ...langArray,
                        { language: "", level: "" },
                      ];
                      setLangArray(updated);
                      updateFormValue(updated);
                    };

                    const handleRemove = (idx: number) => {
                      const updated = langArray.filter((_, i) => i !== idx);
                      setLangArray(updated);
                      updateFormValue(updated);
                    };

                    const handleChange = (
                      idx: number,
                      newLang: string,
                      newLevel: string
                    ) => {
                      const updated = [...langArray];
                      updated[idx] = { language: newLang, level: newLevel };
                      setLangArray(updated);
                      updateFormValue(updated);
                    };

                    return (
                      <FormItem>
                        <FormLabel>Languages</FormLabel>

                        {langArray.map((item, idx) => (
                          <div key={idx} className="mb-2 flex space-x-2">
                            {/* Language input */}
                            <Input
                              disabled={loading}
                              placeholder="e.g. English"
                              value={item.language}
                              onChange={(e) =>
                                handleChange(idx, e.target.value, item.level)
                              }
                            />

                            {/* Level dropdown (CEFR, Native, etc.) */}
                            <select
                              disabled={loading}
                              className="border rounded-md p-2"
                              value={item.level}
                              onChange={(e) =>
                                handleChange(idx, item.language, e.target.value)
                              }
                            >
                              <option value="">Select level</option>
                              <option value="Elementary (A2)">
                                Elementary (A2)
                              </option>
                              <option value="Intermediate (B1)">
                                Intermediate (B1)
                              </option>
                              <option value="Upper-Intermediate (B2)">
                                Upper-Intermediate (B2)
                              </option>
                              <option value="Advanced (C1)">
                                Advanced (C1)
                              </option>
                              <option value="Fluent (C2)">Fluent (C2)</option>
                              <option value="Native">Native</option>
                              <option value="Fluent">Fluent</option>
                            </select>

                            {/* Remove button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(idx)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        {/* Add new language row */}
                        <Button
                          type="button"
                          onClick={handleAdd}
                          className="mt-2"
                        >
                          + Add Language
                        </Button>

                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Interests (split by ',' into multiple inputs, but still stored as a single string) */}
                <FormField
                  control={form.control}
                  name="cv.interests"
                  render={({ field: { value, onChange } }) => {
                    // Local state for displaying the interests
                    const [interests, setInterests] = useState<string[]>([]);

                    // Parse the incoming array-of-strings from react-hook-form
                    useEffect(() => {
                      if (Array.isArray(value)) {
                        setInterests(value);
                      }
                    }, [value]);

                    // Update the react-hook-form field
                    const updateFormValue = (arr: string[]) => {
                      // Pass the updated array back to RHF
                      onChange(arr);
                    };

                    // Handlers
                    const handleAdd = () => {
                      const updated = [...interests, ""];
                      setInterests(updated);
                      updateFormValue(updated);
                    };

                    const handleRemove = (idx: number) => {
                      const updated = interests.filter((_, i) => i !== idx);
                      setInterests(updated);
                      updateFormValue(updated);
                    };

                    const handleChange = (idx: number, newVal: string) => {
                      const updated = [...interests];
                      updated[idx] = newVal;
                      setInterests(updated);
                      updateFormValue(updated);
                    };

                    return (
                      <FormItem>
                        <FormLabel>Interests</FormLabel>

                        {/* Each interest displayed as its own input row */}
                        {interests.map((interest, idx) => (
                          <div key={idx} className="mb-2 flex space-x-2">
                            <Input
                              disabled={loading}
                              placeholder="e.g. Technology"
                              value={interest}
                              onChange={(e) =>
                                handleChange(idx, e.target.value)
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(idx)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        {/* Add another interest row */}
                        <Button
                          type="button"
                          onClick={handleAdd}
                          className="mt-2"
                        >
                          + Add Interest
                        </Button>

                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Greeting Description (3-column span) */}
                <FormField
                  control={form.control}
                  name="cv.greetingDescription"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Greeting Description</FormLabel>
                      <FormControl>
                        <textarea
                          disabled={loading}
                          placeholder="A brief introduction"
                          className="w-full min-w-0 break-words resize-none rounded-md border border-gray-300 p-2 focus:border-sky-600 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {currentStep === 1 && (
              <>
                {fields.map((field, index) => (
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue={`item-${index}`}
                    key={field.id}
                  >
                    <AccordionItem value={`item-${index}`}>
                      <AccordionTrigger
                        className={cn(
                          "relative no-underline! [&[data-state=closed]>button]:hidden [&[data-state=open]>.alert]:hidden",
                          errors?.cv?.experience?.[index] && "text-red-700"
                        )}
                      >
                        {`Experience ${index + 1}`}
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-8"
                          onClick={() => remove(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        {errors?.cv?.experience?.[index] && (
                          <span className="alert absolute right-8">
                            <Trash className="h-4 w-4 text-red-700" />
                          </span>
                        )}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="relative mb-4 gap-8 rounded-md border p-4 md:grid md:grid-cols-3">
                          <FormField
                            control={form.control}
                            name={`cv.experience.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input
                                    disabled={loading}
                                    placeholder="Role or Position"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`cv.experience.${index}.subtitle`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subtitle</FormLabel>
                                <FormControl>
                                  <Input
                                    disabled={loading}
                                    placeholder="Company or Organization"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`cv.experience.${index}.yearRange`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year Range</FormLabel>
                                <FormControl>
                                  <Input
                                    disabled={loading}
                                    placeholder="e.g., 2018 - 2021"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`cv.experience.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input
                                    disabled={loading}
                                    placeholder="Describe your role and achievements"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    className="flex justify-center"
                    size={"lg"}
                    onClick={() =>
                      append({
                        title: "",
                        subtitle: "",
                        yearRange: "",
                        description: "",
                      })
                    }
                  >
                    Add More Experience
                  </Button>
                </div>
              </>
            )}
            {currentStep === 2 && (
              <>
                <div>
                  <h2 className="text-lg font-bold">Achievements</h2>
                  {achievementFields.map((field, index) => (
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue={`achievement-${index}`}
                      key={field.id}
                    >
                      <AccordionItem value={`achievement-${index}`}>
                        <AccordionTrigger className="relative">
                          {`Achievement ${index + 1}`}
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-8"
                            onClick={() => removeAchievement(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="relative mb-4 gap-8 rounded-md border p-4 md:grid md:grid-cols-3">
                            <FormField
                              control={form.control}
                              name={`cv.achievements.${index}.icon`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Icon</FormLabel>
                                  <FormControl>
                                    <Input
                                      disabled={loading}
                                      placeholder="Achievement Icon"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`cv.achievements.${index}.value`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Value</FormLabel>
                                  <FormControl>
                                    <Input
                                      disabled={loading}
                                      placeholder="Achievement Value"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`cv.achievements.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Input
                                      disabled={loading}
                                      placeholder="Achievement Description"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                  <div className="mt-4 flex justify-center">
                    <Button
                      type="button"
                      className="flex justify-center"
                      size={"lg"}
                      onClick={() =>
                        appendAchievement({
                          icon: "",
                          value: "",
                          description: "",
                        })
                      }
                    >
                      Add More Achievement
                    </Button>
                  </div>
                </div>
                <div className="mt-8">
                  <h2 className="text-lg font-bold">Certifications</h2>

                  {certificationFields.map((cert, index) => (
                    <Accordion
                      key={cert.id}
                      type="single"
                      collapsible
                      // Optionally use `defaultValue`
                      defaultValue={`certification-${index}`}
                    >
                      <AccordionItem value={`certification-${index}`}>
                        <AccordionTrigger className="relative">
                          {`Certification ${index + 1}`}
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-8"
                            onClick={() => removeCertification(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AccordionTrigger>

                        <AccordionContent>
                          <div className="mb-4 gap-8 rounded-md border p-4 md:grid md:grid-cols-2">
                            {/* Example: Show a link to the certification.href */}
                            <div>
                              <p className="font-bold">Title:</p>
                              <span>
                                {cert?.certification?.title ?? "Unknown"}
                              </span>
                              <br />
                              <a
                                href={cert.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                              >
                                Link to Credential
                              </a>
                            </div>

                            {/* Example: Show the logo */}
                            <div className="flex items-center">
                              <img
                                src={
                                  cert?.certification?.logo ??
                                  "/images/default-cert-logo.png"
                                }
                                alt={
                                  cert?.certification?.alt ??
                                  "Certification Logo"
                                }
                                className="h-12 w-12"
                              />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}

                  <div className="mt-4 flex justify-center">
                    <Button
                      type="button"
                      size="lg"
                      onClick={() =>
                        appendCertification({
                          certification: {
                            alt: "",
                            logo: "",
                            title: "",
                          },
                          href: "",
                        })
                      }
                    >
                      Add More Certification
                    </Button>
                  </div>
                </div>
              </>
            )}
            {currentStep === 3 && (
              <div>
                <h1 className="text-xl font-bold">Review Your CV</h1>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </form>
      </Form>

      <div className="mt-8 pt-5">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={currentStep === 0}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 ring-1 shadow-xs ring-sky-300 ring-inset hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Left arrow */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          {/* ***** CHANGE #2: remove `disabled={currentStep === steps.length - 1}` and show "Submit" on final step ***** */}
          <button
            type="button"
            onClick={next}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 ring-1 shadow-xs ring-sky-300 ring-inset hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {currentStep === steps.length - 1 ? "Submit" : "Next"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="inline-block h-6 w-6 ml-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileCreateForm;