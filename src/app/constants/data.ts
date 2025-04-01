// data.js
enum UserType {
  GENERIC = "GENERIC",
  TEAM = "TEAM",
  CLIENT = "CLIENT",
  ADMIN = "ADMIN",
}

export const hawktesters = {
  profileImage: "/assets/images/logo_big_color.png",
  profileName: "Hawktesters S.L.",
  jobTitle: "Ethical Hacking Agency",
  email: "sales@hawktesters.com",
  languages: [
    { language: "English", level: "Fluent C2" },
    { language: "Spanish", level: "Native" },
    { language: "Italian", level: "Native" },
    { language: "Catalan", level: "Native" },
  ],
  interests: ["Web Security", "Infrastructure", "Social Engineering"],
  greetingTitle: "Hello from ",
  greetingDescription:
    "Hawktesters is a premier offensive security agency dedicated to fortifying digital infrastructures through proactive and comprehensive security assessments. Our expert team leverages state-of-the-art penetration testing, red teaming, and adversarial simulation techniques to identify vulnerabilities and safeguard our clients against evolving cyber threats. With a deep commitment to innovation and excellence, Hawktesters transforms risk into resilience, ensuring that organizations are not only prepared for today's challenges but are also future-proofed against tomorrow’s adversaries.",
  experience: [
    {
      yearRange: "25 years",
      title: "Experienced Offensive Security Engineers",
      subtitle: "",
      description:
        "The agency has more than 25 years of combined experience in offensive security.",
    },
    {
      yearRange: "10 years",
      title: "Ethical Hacking in Financial Institutions",
      subtitle: "",
      description:
        "The core team has several years of practice in executing penetration test and security assessments for different financial entities.",
    },
  ],
  clients: [
    { logo: "/assets/clients/Logo_Banco_BISA.png", alt: "BISA" },
    { logo: "/assets/clients/makrosoft.png", alt: "MAKROSOFT" },
    { logo: "/assets/clients/RyvalLogo.png", alt: "RYVAL" },
  ],
  vulnerabilities: [
    { logo: "/assets/logos/BancoDeChile.png", alt: "Banco De Chile" },
    { logo: "/assets/logos/bbva.png", alt: "BBVA" },
    { logo: "/assets/logos/bigpoint.svg", alt: "bigpoint" },
    { logo: "/assets/logos/endian.jpg", alt: "endian" },
    { logo: "/assets/logos/facebook.png", alt: "Facebook" },
    { logo: "/assets/logos/google.png", alt: "google" },
    { logo: "/assets/logos/harvard.png", alt: "harvard" },
    { logo: "/assets/logos/kiuwan.png", alt: "kiuwan" },
    { logo: "/assets/logos/legis.png", alt: "legis" },
    { logo: "/assets/logos/nasa.png", alt: "nasa" },
    { logo: "/assets/logos/nestle.png", alt: "nestle" },
    { logo: "/assets/logos/ovh.png", alt: "OVH" },
  ],
  achievements: [
    {
      icon: "/assets/images/puzzle.svg",
      value: "350+",
      description: "COMPLETED ASSESSMENTS",
    },
    {
      icon: "/assets/images/001-target.svg",
      value: "16",
      description: "PUBLISHED CVEs",
    },
  ],
  conferences: [
    { logo: "/assets/logos/blackhat.png", alt: "Blackhat" },
    { logo: "/assets/logos/DragonJarCon2.png", alt: "DragonJar" },
    { logo: "/assets/logos/flisol.png", alt: "Flisol" },
    { logo: "/assets/logos/bsidesco.png", alt: "BSidesCO" },
    { logo: "/assets/logos/barcamp.png", alt: "Barcamp" },
  ],
  testimonials: [
    {
      quote:
        "Thanks to their thorough penetration testing, we addressed security gaps we never knew existed. Their report made it easy for us to take immediate steps.",
      image: "/assets/clients/RyvalLogo.png",
      name: "CEO @ Ryval S.L.",
    },
    {
      quote:
        "Their team was professional, transparent, and responsive. We walked away with concrete solutions to strengthen our security posture.",
      image: "/assets/clients/Logo_Banco_BISA.png",
      name: "Threat and Vulnerability Management Specialist @ Banco BISA S.A.",
    },
  ],
};

// data.js
export const navItems = [
  {
    title: "Hawktesters",
    url: "/dashboard/hawktesters",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
    roles: [UserType.ADMIN, UserType.TEAM, UserType.CLIENT, UserType.GENERIC],
  },
  {
    title: "Assessments",
    url: "/dashboard/assessment",
    icon: "binary",
    shortcut: ["a", "a"],
    isActive: false,
    items: [],
    roles: [UserType.ADMIN, UserType.TEAM, UserType.CLIENT],
  },
  {
    title: "Clients",
    url: "/dashboard/clients",
    icon: "contact",
    shortcut: ["c", "c"],
    isActive: false,
    items: [],
    // Only ADMIN should see the Clients section.
    roles: [UserType.ADMIN],
  },
  {
    title: "Client",
    url: (session: any) => `/dashboard/client/${session.user.clientId || ""}`,
    icon: "contact",
    shortcut: ["c", "c"],
    isActive: false,
    items: [],
    // Only ADMIN should see the Clients section.
    roles: [UserType.CLIENT],
  },
  {
    title: "Technical Team",
    url: "/dashboard/team",
    icon: "users",
    shortcut: ["t", "t"],
    isActive: false,
    items: [],
    // Only ADMIN and TEAM members can see this.
    roles: [UserType.ADMIN, UserType.TEAM],
  },
  {
    title: "Certifications",
    url: "/dashboard/certifications",
    icon: "award",
    shortcut: ["c", "c"],
    isActive: false,
    items: [],
    // ADMIN and TEAM can view Certifications.
    roles: [UserType.ADMIN, UserType.TEAM],
  },
  {
    title: "Account",
    url: "#", // Parent with no direct link.
    icon: "billing",
    isActive: true,
    roles: [UserType.TEAM],
    items: [
      {
        title: "Profile",
        url: "/dashboard/profile",
        icon: "userPen",
        shortcut: ["m", "m"],
        roles: [UserType.TEAM],
      },
    ],
  },
];
