import { MapPin, Phone, Navigation, Clock } from "lucide-react";
import { Reveal, Kicker } from "@/components/Reveal";
import { CONTACT, HOURS } from "@/data/content";

const isOpenNow = () => {
  const now = new Date();
  const day = now.getDay(); // 0 Sun ... 6 Sat
  const h = now.getHours();
  const close = day === 5 || day === 6 ? 22 : 21;
  return h >= 10 && h < close;
};

export const Location = () => {
  const open = isOpenNow();
  return (
    <section id="lokalizacja" className="relative py-28 md:py-36 px-6 lg:px-10" data-testid="location-section">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <Reveal><Kicker>Znajdź nas</Kicker></Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif text-4xl md:text-6xl text-cream font-light mt-4">Lokalizacja i godziny</h2>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <Reveal className="h-full">
            <div className="relative overflow-hidden rounded-[2rem] h-[420px] lg:h-full min-h-[420px] glass p-1.5">
              <iframe
                title="Mapa Trio Molo Cafe"
                src={CONTACT.mapsEmbed}
                className="w-full h-full rounded-[1.6rem] grayscale-[0.2] contrast-110"
                style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg)" }}
                loading="lazy"
                data-testid="map-embed"
              />
            </div>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal delay={0.1}>
              <div className="glass rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0"><MapPin size={18} /></span>
                  <div>
                    <div className="font-serif text-2xl text-cream">{CONTACT.address}</div>
                    <div className="text-sand/60 text-sm mt-1">{CONTACT.city}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <span className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0"><Phone size={18} /></span>
                  <a href={CONTACT.phoneHref} className="text-cream hover:text-gold transition-colors" data-testid="location-phone">{CONTACT.phone}</a>
                </div>
                <a
                  href={CONTACT.directions}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-gold rounded-full px-7 py-3.5 text-sm font-semibold inline-flex items-center gap-2 mt-8"
                  data-testid="location-directions-btn"
                >
                  <Navigation size={16} /> Wyznacz trasę
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="glass rounded-2xl p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3 text-gold">
                    <Clock size={18} />
                    <span className="uppercase tracking-[0.2em] text-xs font-semibold">Godziny otwarcia</span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      open ? "text-turquoise border-turquoise/50 bg-turquoise/10" : "text-sand/60 border-sand/20"
                    }`}
                    data-testid="open-badge"
                  >
                    ● {open ? "Otwarte" : "Zamknięte"}
                  </span>
                </div>
                <ul className="divide-y divide-sand/10">
                  {HOURS.map((h) => (
                    <li key={h.day} className="flex justify-between py-3 text-sm">
                      <span className="text-sand/80">{h.day}</span>
                      <span className="text-cream font-medium">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
