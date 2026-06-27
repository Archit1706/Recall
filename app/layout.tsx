import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://recall-forever.vercel.app";

const KEYWORDS = [
  "spaced repetition",
  "spaced repetition app",
  "FSRS",
  "FSRS algorithm",
  "free Anki alternative",
  "Anki alternative",
  "self-hosted Anki",
  "second brain",
  "personal knowledge management",
  "PKM",
  "flashcards app",
  "free flashcards",
  "open source flashcards",
  "learning app",
  "memory app",
  "remember everything",
  "study app",
  "active recall",
  "forgetting curve",
  "Ebbinghaus",
  "long-term memory",
  "knowledge retention",
  "study smarter",
  "review scheduler",
  "PWA flashcards",
  "AI flashcards",
  "Claude flashcards",
  "AI quiz generator",
  "save links to remember",
  "remember articles",
  "PDF spaced repetition",
  "markdown notes spaced repetition",
  "code snippets memorize",
  "self-hostable learning app",
  "Next.js spaced repetition",
  "Neon Postgres app",
  "Vercel learning app",
  "Recall app",
  "Recall by Archit",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Recall — Free Spaced Repetition App with FSRS & AI Flashcards",
    template: "%s · Recall",
  },
  description:
    "Recall is a free, self-hostable spaced repetition app. Paste any link, PDF, note, or code snippet and Recall schedules optimal reviews with the FSRS algorithm so you remember everything you learn. AI-generated flashcards, instant capture, PWA, dark mode, web push.",
  applicationName: "Recall",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: KEYWORDS,
  authors: [{ name: "Archit Rathod", url: "https://github.com/Archit1706" }],
  creator: "Archit Rathod",
  publisher: "Archit Rathod",
  category: "education",
  classification: "Education, Productivity, Memory, Learning",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Recall",
    statusBarStyle: "default",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Recall",
    title: "Recall — Free Spaced Repetition App with FSRS & AI Flashcards",
    description:
      "Your calm second brain. Save anything you learn. Recall schedules optimal reviews with FSRS so it sticks. Free, self-hostable, AI-assisted.",
    url: SITE_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Recall — Free Spaced Repetition App with FSRS & AI Flashcards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recall — Free Spaced Repetition App with FSRS & AI Flashcards",
    description:
      "Save anything you learn. Recall schedules optimal reviews with FSRS so it sticks. Free, self-hostable, AI-assisted.",
    creator: "@archit1706",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon",
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0a0a0b",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('recall-theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
