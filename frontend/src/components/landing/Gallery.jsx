import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { api, mediaUrl } from "@/lib/api";
import { Reveal, Kicker } from "@/components/Reveal";

const CATS = ["Wszystkie", "Taras", "Kawa", "Ciasta", "Koktajle", "Zachód słońca"];

export const Gallery = () => {
  const [all, setAll] = useState([]);
  const [cat, setCat] = useState("Wszystkie");
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    api.get("/gallery").then((r) => setAll(r.data)).catch(() => {});
  }, []);

  const filtered = useMemo(
    () => (cat === "Wszystkie" ? all : all.filter((g) => g.category === cat)),
    [all, cat]
  );

  const slides = filtered.map((g) => ({ src: mediaUrl(g.url), description: g.caption }));

  return (
    <section id="galeria" className="relative py-28 md:py-36 px-6 lg:px-10" data-testid="gallery-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Reveal><Kicker>Galeria</Kicker></Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif text-4xl md:text-6xl text-cream font-light mt-4">Chwile na molo</h2>
          </Reveal>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-[0.15em] transition-colors duration-300 border ${
                cat === c
                  ? "bg-gold text-navy border-gold"
                  : "border-sand/20 text-sand/70 hover:border-gold/60 hover:text-gold"
              }`}
              data-testid={`gallery-filter-${c}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
          <AnimatePresence mode="popLayout">
            {filtered.map((g, i) => (
              <motion.figure
                layout
                key={g._id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                onClick={() => setIndex(i)}
                className="relative mb-5 overflow-hidden rounded-2xl cursor-pointer group break-inside-avoid"
                data-testid={`gallery-item-${i}`}
              >
                <img
                  src={mediaUrl(g.url)}
                  alt={g.caption}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 ring-1 ring-inset ring-gold/0 group-hover:ring-gold/50 rounded-2xl transition-all duration-500" />
                <figcaption className="absolute bottom-4 left-4 text-cream text-sm font-serif opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  {g.caption}
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Lightbox open={index >= 0} index={index} close={() => setIndex(-1)} slides={slides} />
    </section>
  );
};
