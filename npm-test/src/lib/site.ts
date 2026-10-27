const configuredName = process.env.NEXT_PUBLIC_SITE_NAME?.trim();
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const site = {
  name: configuredName || "GatherPlay",
  description:
    "A small, considered collection of party games for real gatherings — plus live trivia everyone can play from their phone.",
  tagline: "Good times. Great games. Everyone included.",
  url: configuredUrl || "http://localhost:3000",
  navigation: [
    { href: "/games", label: "Offline games" },
    { href: "/online", label: "Online games" },
    { href: "/finder", label: "Game finder" },
  ],
  footer: {
    explore: [
      { href: "/games", label: "Offline games" },
      { href: "/online", label: "Online games" },
      { href: "/finder", label: "Game finder" },
    ],
    account: [
      { href: "/login", label: "Sign in" },
      { href: "/signup", label: "Create an account" },
      { href: "/dashboard", label: "Your dashboard" },
    ],
    support: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/setup", label: "Backend setup" },
    ],
  },
} as const;

export const playerLimits = {
  triviaMin: 2,
  triviaMax: 10,
  questionSeconds: 20,
  questionCount: 8,
} as const;
