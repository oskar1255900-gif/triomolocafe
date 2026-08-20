import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarCheck, Users, Clock, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const inputCls = "w-full bg-navy-2/60 border border-sand/15 rounded-xl px-4 py-3 text-cream placeholder:text-sand/40 focus:outline-none focus:border-gold transition-colors";

export const ReservationModal = ({ open, onClose }) => {
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "19:00", guests: 2, note: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await api.post("/reservations", { ...form, guests: Number(form.guests) });
      toast.success(data.message || "Rezerwacja wysłana!");
      setForm({ name: "", phone: "", date: "", time: "19:00", guests: 2, note: "" });
      onClose();
    } catch {
      toast.error("Nie udało się wysłać rezerwacji. Spróbuj ponownie.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-navy/85 backdrop-blur-sm"
          onClick={onClose}
          data-testid="reservation-modal"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-[2rem] p-8 md:p-10 w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-sand/60 hover:text-gold" data-testid="reservation-close"><X size={22} /></button>
            <div className="mb-7">
              <div className="w-12 h-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mb-4"><CalendarCheck size={22} /></div>
              <h3 className="font-serif text-3xl text-cream">Rezerwuj stolik</h3>
              <p className="text-sand/60 text-sm mt-2">Wybierz datę i liczbę osób — potwierdzimy telefonicznie.</p>
            </div>

            <form onSubmit={submit} className="space-y-4" data-testid="reservation-form">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand/40" />
                  <input required placeholder="Imię i nazwisko" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputCls} pl-10`} data-testid="res-name" />
                </div>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand/40" />
                  <input required placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${inputCls} pl-10`} data-testid="res-phone" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.15em] text-sand/50 flex items-center gap-1 mb-1.5"><CalendarCheck size={12} /> Data</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} data-testid="res-date" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.15em] text-sand/50 flex items-center gap-1 mb-1.5"><Clock size={12} /> Godzina</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputCls} data-testid="res-time" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.15em] text-sand/50 flex items-center gap-1 mb-1.5"><Users size={12} /> Osoby</label>
                  <input type="number" min="1" max="30" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} className={inputCls} data-testid="res-guests" />
                </div>
              </div>
              <textarea rows={2} placeholder="Uwagi (opcjonalnie)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={`${inputCls} resize-none`} data-testid="res-note" />
              <button type="submit" disabled={sending} className="btn-gold rounded-full w-full py-4 text-sm font-semibold disabled:opacity-60" data-testid="res-submit">
                {sending ? "Wysyłanie..." : "Wyślij prośbę o rezerwację"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
