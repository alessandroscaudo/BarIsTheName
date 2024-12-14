import "./globals.css";
import Navbar from "@/components/navbar";

export const metadata = {
  title: "Il Mio Sito",
  description: "Navbar visibile su tutte le pagine",
  appleWebApp: {
    title: "Bar",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <meta name="apple-mobile-web-app-title" content="Bar" />
      </head>
      <body>
        {/* Navbar visibile su tutte le pagine */}
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
