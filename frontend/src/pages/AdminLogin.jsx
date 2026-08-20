import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.detail || "Błąd logowania");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full bg-navy-2/60 border border-sand/15 rounded-xl px-4 py-3.5 text-cream placeholder:text-sand/40 focus:outline-none focus:border-gold transition-colors";

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6 grain relative">
      <div className="absolute inset-0 bg-gradient-to-b from-ocean/10 to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="glass rounded-[2rem] p-10 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-5">
            <Lock size={22} />
          </div>
          <div className="font-serif text-3xl text-cream">Trio Molo — Panel</div>
          <p className="text-sand/60 text-sm mt-2">Zaloguj się, aby zarządzać treścią</p>
        </div>

        <form onSubmit={submit} className="space-y-4" data-testid="login-form">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} required data-testid="login-email" />
          <input type="password" placeholder="Hasło" value={password} onChange={(e) => setPassword(e.target.value)} className={input} required data-testid="login-password" />
          {error && <p className="text-sm text-red-400" data-testid="login-error">{error}</p>}
          <button type="submit" disabled={loading} className="btn-gold rounded-full w-full py-4 text-sm font-semibold disabled:opacity-60" data-testid="login-submit">
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>
        <a href="/" className="block text-center text-xs text-sand/50 hover:text-gold mt-6 transition-colors">← Wróć na stronę</a>
      </motion.div>
    </div>
  );
}
