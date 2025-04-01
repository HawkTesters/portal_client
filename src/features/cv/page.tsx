"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React from "react";


export interface CVData {
  profileImage: string;
  profileName: string;
  jobTitle: string;
  email: string;
  greetingTitle?: string | null;
  greetingDescription?: string | null;
  footerText?: string | null;
  languages: string[];
  interests: string[];
  education: {
    yearRange: string;
    title: string;
    subtitle: string;
    description: string;
  }[];
  experience: {
    yearRange: string;
    title: string;
    subtitle: string;
    description: string;
  }[];
  services: { icon: string; alt: string; name: string; description: string }[];
  cves?: string[];
  userCertifications: {
    certification: {
      alt: string;
      logo: string;
      title: string;
    };
    href: string;
  }[];
  achievements: {
    icon: string;
    value: string;
    description: string;
    href?: string;
  }[];
  testimonials: { quote: string; image: string; name: string }[];
  translations?: {
    sidebar: {
      downloadCV: string;
      mail: string;
      languages: string[];
      interests: string;
      cve: string;
    };
    nav: {
      home: string;
      team: {
        team: string;
        isaac: string;
        luis: string;
        samir: string;
      };
      language: {
        name: string;
        es: string;
        fr: string;
        en: string;
        it: string;
      };
    };
    header: {
      alt: {
        hamburger: string;
        share: string;
      };
      share: string;
    };
    intro: {
      title: string;
    };
    resume: {
      subtitle: string;
      education: string;
      experience: string;
    };
    certifications: {
      subtitle: string;
      title: string;
    };
    achievements: {
      subtitle: string;
      title: string;
    };
  };
  lang?: string;
}


interface CVPageProps {
  cvData: CVData;
}

const CVPage: React.FC<CVPageProps> = ({ cvData }) => {
  const openMailto = () => {
    window.location.href = `mailto:${cvData.email}`;
  };

  return (
    <div className="max-h-screen bg-white text-black flex flex-col">
      <div className="container mx-auto flex flex-1 overflow-y-auto mt-8">
        {/* Aside */}
        <aside className="w-full md:w-1/3 p-4">
          {/* Personal Information Widget */}
          <Card className="mb-2">
            <CardHeader>
              <CardTitle>Information:</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{cvData.email}</p>
              <Button
                variant="outline"
                className="mt-2"
                size="sm"
                onClick={openMailto}
              >
                <img
                  src="/assets/images/share.svg"
                  alt="Share"
                  className="mr-2 h-4 w-4"
                />
                Contact
              </Button>
            </CardContent>
          </Card>
          {/* Languages Widget */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              {cvData.languages.map((lang, idx) => (
                <p key={idx} className="text-sm">
                  {lang}
                </p>
              ))}
            </CardContent>
          </Card>
          {/* Interests Widget */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Interests</CardTitle>
            </CardHeader>
            <CardContent>
              {cvData.interests.map((interest, idx) => (
                <p key={idx} className="text-sm">
                  {interest}
                </p>
              ))}
            </CardContent>
          </Card>
          {/* CVEs Widget */}
          {cvData.cves && cvData.cves.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>CVE</CardTitle>
              </CardHeader>
              <CardContent>
                {cvData.cves.map((cve, idx) => (
                  <p key={idx} className="text-sm">
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {cve}
                    </a>
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </aside>

        {/* Main Content */}
        <main className="w-full md:w-2/3 p-4">
          {/* Intro Section */}
          <section className="mb-8">
            <Heading title={`${cvData.profileName}'s CV`} description="" />
            <p className="mt-2">{cvData.greetingDescription}</p>
          </section>

          {/* Resume Section */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education Column */}
              <div>
                <Heading title="Education" description="" />
                <ul className="space-y-4">
                  {cvData.education.map((edu, idx) => (
                    <li key={idx} className="border-l-4 border-primary pl-4">
                      <span className="text-sm font-semibold">
                        {edu.yearRange}
                      </span>
                      <h3 className="font-bold">{edu.title}</h3>
                      <p className="text-sm">{edu.subtitle}</p>
                      <p className="text-sm">{edu.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Experience Column */}
              <div>
                <Heading title="Experience" description="" />
                <ul className="space-y-4">
                  {cvData.experience.map((exp, idx) => (
                    <li key={idx} className="border-l-4 border-primary pl-4">
                      <span className="text-sm font-semibold">
                        {exp.yearRange}
                      </span>
                      <h3 className="font-bold">{exp.title}</h3>
                      <p className="text-sm">{exp.subtitle}</p>
                      <p className="text-sm">{exp.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Certifications Section */}
          <section className="mb-8">
            <Heading title="Certifications" description="" />
            <div className="flex flex-wrap gap-4">
              {cvData.userCertifications.map((cert, idx) => (
                <div key={idx} className="w-24">
                  <a href={cert.href} target="_blank" rel="noopener noreferrer">
                    <img
                      src={cert.certification.logo}
                      alt={cert.certification.alt}
                      className="w-full"
                    />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Achievements Section */}
          <section className="mb-8">
            <Heading title="Achievements" description="" />
            <div className="flex flex-wrap gap-4">
              {cvData.achievements.map((ach, idx) => (
                <div key={idx} className="text-center border p-4 rounded">
                  <img
                    src={ach.icon}
                    alt="achievement icon"
                    className="w-12 h-12 mx-auto mb-2"
                  />
                  <p className="font-bold">{ach.value}</p>
                  <p className="text-sm">{ach.description}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <footer className="bg-gray-800 text-white text-center p-4 mt-8">
        <p>{cvData.footerText}</p>
      </footer>
    </div>
  );
};

export default CVPage;