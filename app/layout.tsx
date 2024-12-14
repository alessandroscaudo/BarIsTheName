import "./globals.css";
import Navbar from "@/components/navbar";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Navbar visibile su tutte le pagine */}
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
