"use client";

import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import React, { useState, useEffect } from "react";

interface CompanyOverviewData {
  profileName: string;
  profileImage: string;
  jobTitle: string;
  email: string;
  greetingDescription?: string;
  languages?: { language: string; level: string }[];
  experience?: {
    yearRange: string;
    title: string;
    subtitle?: string;
    description?: string;
  }[];
  clients?: { logo: string; alt?: string }[];
  vulnerabilities?: { logo: string; alt?: string }[];
  conferences?: { logo: string; alt?: string }[];
  // Remove `certifications` from here since we now fetch from the API
  achievements?: { icon: string; value: string; description: string }[];
  testimonials?: { quote: string; image: string; name: string }[];
}

// Our DB model for certifications includes id, title, logo, alt
interface Certification {
  id: string;
  title: string;
  logo: string;
  alt: string;
  // any other fields as needed
}

interface CompanyOverviewProps {
  data: CompanyOverviewData;
}

export const CompanyOverview: React.FC<CompanyOverviewProps> = ({ data }) => {
  const {
    profileName,
    profileImage,
    jobTitle,
    email,
    greetingDescription,
    languages,
    experience,
    clients,
    vulnerabilities,
    conferences,
    achievements,
    testimonials,
  } = data;

  // Local state for the certifications fetched from the API
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // On mount, fetch certifications
  useEffect(() => {
    async function fetchCertifications() {
      try {
        const response = await fetch("/api/certifications");
        if (!response.ok) {
          throw new Error("Error fetching certifications");
        }
        const data = await response.json();
        setCertifications(data);
      } catch (error) {
        console.error("Error fetching certifications:", error);
      }
    }

    fetchCertifications();
  }, []);

  // Opens a mailto: link
  function openMailto(mail: string) {
    window.location.href = `mailto:${mail}`;
  }

  return (
    <PageContainer>
      {/* Parent flex column to keep header at top */}
      <div className="flex flex-col w-full min-h-screen">
        {/* Full-width Header */}
        <header className="w-full border-b px-6 py-4 flex items-center justify-between bg-white">
          <Heading
            title="Hawktesters Overview"
            className="text-3xl"
            description=""
          />
          <Button variant="outline" onClick={() => openMailto(email)}>
            Contact Us
          </Button>
        </header>

        {/* Two-column layout below the header */}
        <div className="flex w-full">
          {/* Sidebar (hidden on smaller screens) */}
          <aside className="hidden md:block w-full md:w-1/4 border-r px-6 py-6 bg-gray-50">
            <div className="flex flex-col space-y-8">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-xl">
                    {profileName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                  <span className="inline-block text-sm px-2 py-1 rounded-full bg-gray-100">
                    {jobTitle}
                  </span>
                  <Separator className="my-2" />
                  <div className="text-base text-center">
                    <p className="mb-2">Email: {email}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMailto(email)}
                    >
                      Send Email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Languages Card */}
              {languages && languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-base space-y-1">
                      {languages.map((langObj, i) => (
                        <li key={i}>
                          • {langObj.language}: {langObj.level}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>

          {/* Main content with vertical scrolling */}
          <ScrollArea className="w-full px-6 py-6">
            <div className="max-w-5xl mx-auto space-y-10 pb-10">
              {/* Intro Section */}
              <section>
                <Heading
                  title={`Hello from ${profileName} 👋`}
                  className="text-2xl"
                  description=""
                />
                <p className="mt-2 text-lg">{greetingDescription || ""}</p>
              </section>

              <Separator />

              {/* Experience Section */}
              {experience && experience.length > 0 && (
                <section>
                  <Heading
                    title="Experience"
                    className="text-2xl"
                    description=""
                  />
                  <Card className="mt-4">
                    <CardContent>
                      <ul className="space-y-4 m-2 p-2">
                        {experience.map((item, idx) => (
                          <li key={idx}>
                            <span className="inline-block px-2 py-1 bg-blue-500 text-white rounded text-xs">
                              {item.yearRange}
                            </span>
                            <h6 className="font-semibold mt-2 text-base">
                              {item.title}
                            </h6>
                            {item.subtitle && (
                              <p className="italic text-base">
                                {item.subtitle}
                              </p>
                            )}
                            {item.description && (
                              <p className="text-base">{item.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Clients Section */}
              {clients && clients.length > 0 && (
                <section>
                  <Heading
                    title="Clients"
                    className="text-2xl"
                    description=""
                  />
                  <Card className="mt-4">
                    <CardContent>
                      <div className="flex w-full flex-wrap">
                        {clients.map((client, i) => (
                          <div
                            key={i}
                            className="basis-1/2 sm:basis-1/3 md:basis-1/4 flex items-center justify-center p-2"
                          >
                            <img
                              src={client.logo}
                              alt={client.alt ?? "Client"}
                              className="object-contain w-full h-auto p-4"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Vulnerabilities Section */}
              {vulnerabilities && vulnerabilities.length > 0 && (
                <section>
                  <Heading
                    title="Vulnerabilities Reported"
                    className="text-2xl"
                    description=""
                  />
                  <Card className="mt-4">
                    <CardContent>
                      <div className="flex w-full flex-wrap">
                        {vulnerabilities.map((vuln, i) => (
                          <div
                            key={i}
                            className="basis-1/2 sm:basis-1/3 md:basis-1/4 flex items-center justify-center p-2"
                          >
                            <img
                              src={vuln.logo}
                              alt={vuln.alt ?? "Vulnerability"}
                              className="object-contain w-full h-auto p-4"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Conferences Section */}
              {conferences && conferences.length > 0 && (
                <section>
                  <Heading
                    title="Conferences"
                    className="text-2xl"
                    description=""
                  />
                  <Card className="mt-4">
                    <CardContent>
                      <div className="flex w-full flex-wrap">
                        {conferences.map((conf, i) => (
                          <div
                            key={i}
                            className="basis-1/2 sm:basis-1/3 md:basis-1/4 flex items-center justify-center p-2"
                          >
                            <img
                              src={conf.logo}
                              alt={conf.alt ?? "Conference"}
                              className="object-contain w-full h-auto p-4"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Certifications Section (fetched from /api/certifications) */}
              {certifications.length > 0 && (
                <section>
                  <Heading
                    title="Certifications"
                    className="text-2xl"
                    description=""
                  />
                  <Card className="mt-4">
                    <CardContent>
                      <div className="flex w-full flex-wrap">
                        {certifications.map((certi, i) => (
                          <div
                            key={certi.id}
                            className="basis-1/2 sm:basis-1/3 md:basis-1/4 flex flex-col items-center justify-center p-2"
                          >
                            {/* If you had a details page or external link, you could wrap the img in <a> */}
                            <img
                              src={certi.logo}
                              alt={certi.alt ?? "Certification"}
                              className="object-contain w-full h-auto p-4"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Achievements Section */}
              {achievements && achievements.length > 0 && (
                <section>
                  <Heading
                    title="Achievements"
                    className="text-2xl"
                    description=""
                  />
                  <Card className="mt-4">
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((ach, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 p-4 border mt-6 rounded bg-white"
                          >
                            <img
                              src={ach.icon}
                              alt="achievement-icon"
                              className="w-12 h-12"
                            />
                            <div>
                              <h4 className="text-xl font-bold">{ach.value}</h4>
                              <p className="text-base">{ach.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Testimonials Section */}
              {testimonials && testimonials.length > 0 && (
                <section>
                  <Heading
                    title="Testimonials"
                    className="text-2xl"
                    description=""
                  />
                  <Card className="mt-4">
                    <CardContent>
                      <div className="grid gap-4">
                        {testimonials.map((test, idx) => (
                          <div
                            key={idx}
                            className="p-4 border rounded bg-white flex flex-col items-start mt-6 md:flex-row md:items-center gap-4"
                          >
                            <div className="flex-shrink-0">
                              <img
                                src={test.image}
                                alt="testimonial"
                                className="w-16 h-16 object-contain"
                              />
                            </div>
                            <div>
                              <p className="mb-2 italic text-base">
                                “{test.quote}”
                              </p>
                              <p className="font-semibold text-base">
                                {test.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </PageContainer>
  );
};
