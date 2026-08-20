import { Facebook, Phone, MapPin } from "lucide-react";
import { CONTACT } from "@/data/content";

export const Footer = () => (
  <footer className="relative border-t border-sand/10 py-16 px-6 lg:px-10" data-testid="footer">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="text-center md:text-left">
        <div className="font-serif text-3xl text-cream">Trio Molo Cafe</div>
        <div className="text-xs tracking-[0.25em] text-gold uppercase mt-2">
          Kawa • Desery • Koktajle • Kołobrzeg
        </div>
      </div>

      <div className="flex gap-4">
        {[
          { icon: Facebook, href: CONTACT.facebook, label: "Facebook" },
          { icon: Phone, href: CONTACT.phoneHref, label: "Telefon" },
          { icon: MapPin, href: CONTACT.directions, label: "Lokalizacja" },
        ].map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-sand/80 hover:text-gold hover:border-gold/40 transition-colors"
            data-testid={`footer-${s.label.toLowerCase()}`}
          >
            <s.icon size={18} />
          </a>
        ))}
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-sand/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-sand/40">
      <span>© {new Date().getFullYear()} Trio Molo Cafe. Wszelkie prawa zastrzeżone.</span>
      <a href="/admin" className="hover:text-gold transition-colors" data-testid="footer-admin-link">Panel administratora</a>
    </div>
  </footer>
);
