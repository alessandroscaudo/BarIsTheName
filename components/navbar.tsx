"use client";
import React, { useState, useEffect, FC } from "react";
import Link from "next/link"; // Importa Link di Next.js per la navigazione interna

// Props per NavLink
interface NavLinkProps {
  href: string;
  label: string;
}

// Componente principale Navbar
const Navbar: FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Imposta lo stato iniziale
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Componente per i singoli link di navigazione
  const NavLink: FC<NavLinkProps> = ({ href, label }) => (
    <Link href={href} passHref>
      <div className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
        <span className="text-xs mt-1">{label}</span>
      </div>
    </Link>
  );

  // Contenuto della navigazione
  const NavigationContent: FC = () => (
    <>
      <NavLink href="/" label="Home" />
      <NavLink href="/profilo" label="Profilo" />
      <NavLink href="/carrello" label="Carrello" />
      <NavLink href="/impostazioni" label="Impostazioni" />
    </>
  );

  return (
    <>
      {/* Navbar Desktop */}
      {!isMobile && (
        <nav className="hidden md:flex w-full bg-white shadow-md py-4 px-6 items-center justify-between">
          <div className="flex space-x-6">
            <NavigationContent />
          </div>
        </nav>
      )}

      {/* Bottom Navigation Mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t z-50">
          <div className="grid grid-cols-4 py-2">
            <NavigationContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
