import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "O nas", href: "#o-nas" },
  { label: "Menu", href: "#menu" },
  { label: "Galeria", href: "#galeria" },
  { label: "Atmosfera", href: "#atmosfera" },
  { label: "Kontakt", href: "#kontakt" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          scrolled ? "glass" : "bg-transparent"
        }`}
        data-testid="navbar"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <a href="#hero" className="flex flex-col leading-none" data-testid="nav-logo">
            <span className="font-serif text-2xl text-cream tracking-wide">Trio Molo</span>
            <span className="text-[10px] tracking-[0.35em] text-gold uppercase">Cafe · Kołobrzeg</span>
          </a>

          <nav className="hidden md:flex items-center gap-9">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-sand/80 hover:text-gold transition-colors duration-300 relative group"
                data-testid={`nav-link-${l.href.replace("#", "")}`}
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <a
              href="#kontakt"
              className="btn-gold rounded-full px-5 py-2 text-sm font-semibold"
              data-testid="nav-reserve"
            >
              Rezerwuj stolik
            </a>
          </nav>

          <button
            className="md:hidden text-cream"
            onClick={() => setOpen(true)}
            aria-label="Otwórz menu"
            data-testid="nav-hamburger"
          >
            <Menu size={26} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] glass flex flex-col p-8 md:hidden"
            data-testid="mobile-menu"
          >
            <div className="flex justify-between items-center mb-16">
              <span className="font-serif text-2xl text-cream">Trio Molo</span>
              <button onClick={() => setOpen(false)} className="text-cream" data-testid="mobile-menu-close">
                <X size={28} />
              </button>
            </div>
            <nav className="flex flex-col gap-7">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i }}
                  className="font-serif text-3xl text-sand hover:text-gold transition-colors"
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
