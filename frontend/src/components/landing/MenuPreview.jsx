import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Reveal, Kicker } from "@/components/Reveal";

const Card = ({ item, i }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
    className="group relative overflow-hidden rounded-2xl glass"
    data-testid={`bestseller-${i}`}
  >
    <div className="relative h-56 overflow-hidden">
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
      <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.2em] text-gold bg-navy/60 px-3 py-1 rounded-full border border-gold/30">
        {item.category}
      </span>
    </div>
    <div className="p-6 flex items-start justify-between gap-4">
      <div>
        <h3 className="font-serif text-2xl text-cream">{item.name}</h3>
        <p className="text-sm text-sand/60 mt-1">{item.description}</p>
      </div>
      <span className="font-serif text-2xl text-gold whitespace-nowrap">{item.price}</span>
    </div>
  </motion.div>
);

export const MenuPreview = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/menu", { params: { bestseller: true } })
      .then((r) => {
        // Zabezpieczenie: zapisuj w stanie tylko jeśli odebrano prawdziwą tablicę
        if (Array.isArray(r.data)) {
          setItems(r.data);
        } else {
          setItems([]);
        }
      })
      .catch(() => setItems([]));
  }, []);

  // Zabezpieczenie: upewniamy się, że bezpiecznie pracujemy na tablicy
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section id="menu" className="relative py-28 md:py-36 px-6 lg:px-10" data-testid="menu-section">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <Reveal><Kicker>Karta</Kicker></Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-serif text-4xl md:text-6xl text-cream font-light mt-4">Najpopularniejsze</h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p className="text-sand/60 max-w-sm text-sm md:text-base">
              Nasze bestsellery — to, co goście zamawiają najczęściej, spoglądając na morze.
            </p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {safeItems.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl h-80 skeleton" />
              ))
            : safeItems.slice(0, 4).map((item, i) => <Card key={item._id || i} item={item} i={i} />)}
        </div>

        <Reveal delay={0.2} className="mt-14 flex justify-center">
          <a href="#galeria" className="group inline-flex items-center gap-3 text-cream border border-gold/40 rounded-full px-8 py-4 text-sm font-semibold hover:bg-gold hover:text-navy transition-colors duration-300" data-testid="full-menu-btn">
            Zobacz pełne menu
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </Reveal>
      </div>
    </section>
  );
};
