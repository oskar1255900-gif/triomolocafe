import { useState } from "react";
import { Phone, Facebook, Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { Reveal, Kicker } from "@/components/Reveal";
import { api } from "@/lib/api";
import { CONTACT } from "@/data/content";

export const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await api.post("/contact", form);
      toast.success(data.message || "Wiadomość wysłana!");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Nie udało się wysłać wiadomości. Spróbuj ponownie.");
    } finally {
      setSending(false);
    }
  };

  const input = "w-full bg-navy-2/60 border border-sand/15 rounded-xl px-4 py-3.5 text-cream placeholder:text-sand/40 focus:outline-none focus:border-gold transition-colors";

  return (
    <section id="kontakt" className="relative py-28 md:py-36 px-6 lg:px-10" data-testid="contact-section">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14">
        <div>
          <Reveal><Kicker>Kontakt</Kicker></Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif text-4xl md:text-6xl text-cream font-light mt-4">Napisz do nas</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-sand/70 mt-6 max-w-md leading-relaxed">
              Masz pytanie o rezerwację lub wydarzenie? Zadzwoń lub napisz — odpowiemy najszybciej jak to możliwe.
            </p>
          </Reveal>

          <div className="mt-10 space-y-4">
            {[
              { icon: Phone, label: CONTACT.phone, href: CONTACT.phoneHref },
              { icon: Mail, label: CONTACT.email, href: `mailto:${CONTACT.email}` },
              { icon: MapPin, label: `${CONTACT.address}, ${CONTACT.city}`, href: CONTACT.directions },
            ].map((c) => (
              <a key={c.label} href={c.href} target={c.icon === MapPin ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-4 glass rounded-xl px-5 py-4 hover:border-gold/40 transition-colors group">
                <span className="w-9 h-9 rounded-full bg-gold/15 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-navy transition-colors"><c.icon size={16} /></span>
                <span className="text-sand/90 text-sm">{c.label}</span>
              </a>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <a href={CONTACT.phoneHref} className="btn-gold rounded-full px-6 py-3 text-sm font-semibold inline-flex items-center gap-2" data-testid="contact-call-btn">
              <Phone size={16} /> Zadzwoń
            </a>
            <a href={CONTACT.facebook} target="_blank" rel="noreferrer" className="rounded-full px-6 py-3 text-sm font-semibold border border-sand/30 text-cream hover:border-gold hover:text-gold transition-colors inline-flex items-center gap-2" data-testid="contact-fb-btn">
              <Facebook size={16} /> Facebook
            </a>
          </div>
        </div>

        <Reveal delay={0.15}>
          <form onSubmit={submit} className="glass rounded-[2rem] p-8 md:p-10 space-y-5" data-testid="contact-form">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-sand/60">Imię</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${input} mt-2`} placeholder="Twoje imię" data-testid="contact-name" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-sand/60">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${input} mt-2`} placeholder="twoj@email.pl" data-testid="contact-email" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-sand/60">Wiadomość</label>
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${input} mt-2 resize-none`} placeholder="Twoja wiadomość..." data-testid="contact-message" />
            </div>
            <button type="submit" disabled={sending} className="btn-gold rounded-full w-full py-4 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60" data-testid="contact-submit">
              <Send size={16} /> {sending ? "Wysyłanie..." : "Wyślij wiadomość"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
};
