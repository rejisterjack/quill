export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Quill",
  description: "Production-ready, self-hosted AI knowledge base chatbot in 100% TypeScript.",
  navItems: [
    { label: "Home", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Chat", href: "/chat" },
    { label: "Login", href: "/login" },
  ],
  navMenuItems: [
    { label: "Home", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Chat", href: "/chat" },
    { label: "Login", href: "/login" },
  ],
  links: {
    github: "https://github.com/rejisterjack/quill",
    docs: "/docs",
  },
};
