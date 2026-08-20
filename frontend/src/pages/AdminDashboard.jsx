import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, LogOut, Coffee, Image as ImageIcon, X, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const CATS_MENU = ["Kawa", "Desery", "Koktajle", "Menu"];
const CATS_GALLERY = ["Taras", "Kawa", "Ciasta", "Koktajle", "Zachód słońca"];
const inputCls = "w-full bg-navy-2/60 border border-sand/15 rounded-lg px-3 py-2.5 text-cream text-sm placeholder:text-sand/40 focus:outline-none focus:border-gold transition-colors";

const Modal = ({ children, onClose, title }) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm" onClick={onClose}>
    <div className="glass rounded-2xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-serif text-2xl text-cream">{title}</h3>
        <button onClick={onClose} className="text-sand/60 hover:text-gold" data-testid="modal-close"><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

function MenuManager() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = useCallback(() => api.get("/menu").then((r) => setItems(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm({ name: "", description: "", price: "", category: "Kawa", image: "", bestseller: false, order: items.length + 1 }); setEditing("new"); };
  const openEdit = (it) => { setForm({ ...it }); setEditing(it._id); };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form }; delete payload._id; delete payload.id;
    payload.order = Number(payload.order) || 0;
    try {
      if (editing === "new") await api.post("/menu", payload);
      else await api.put(`/menu/${editing}`, payload);
      toast.success("Zapisano");
      setEditing(null); load();
    } catch { toast.error("Błąd zapisu"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Usunąć tę pozycję?")) return;
    await api.delete(`/menu/${id}`); toast.success("Usunięto"); load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sand/60 text-sm">{items.length} pozycji w menu</p>
        <button onClick={openNew} className="btn-gold rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2" data-testid="add-menu-btn"><Plus size={16} /> Dodaj pozycję</button>
      </div>
      <div className="grid gap-3">
        {items.map((it) => (
          <div key={it._id} className="glass rounded-xl p-4 flex items-center gap-4" data-testid={`menu-row-${it._id}`}>
            <img src={it.image} alt={it.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-cream font-medium truncate">{it.name}</span>
                {it.bestseller && <Star size={13} className="text-gold shrink-0" fill="currentColor" />}
              </div>
              <div className="text-xs text-sand/50 truncate">{it.category} · {it.price}</div>
            </div>
            <button onClick={() => openEdit(it)} className="text-sand/60 hover:text-gold p-2" data-testid={`edit-menu-${it._id}`}><Pencil size={16} /></button>
            <button onClick={() => remove(it._id)} className="text-sand/60 hover:text-red-400 p-2" data-testid={`delete-menu-${it._id}`}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing === "new" ? "Nowa pozycja" : "Edytuj pozycję"}>
          <form onSubmit={save} className="space-y-3" data-testid="menu-form">
            <input className={inputCls} placeholder="Nazwa" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="menu-name" />
            <input className={inputCls} placeholder="Opis" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Cena (np. 17 zł)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required data-testid="menu-price" />
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATS_MENU.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input className={inputCls} placeholder="URL zdjęcia" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} data-testid="menu-image" />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-sand/80 cursor-pointer">
                <input type="checkbox" checked={form.bestseller} onChange={(e) => setForm({ ...form, bestseller: e.target.checked })} className="accent-gold w-4 h-4" data-testid="menu-bestseller" />
                Bestseller
              </label>
              <input type="number" className={`${inputCls} w-24`} placeholder="Kolejność" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            </div>
            <button type="submit" className="btn-gold rounded-full w-full py-3 text-sm font-semibold" data-testid="menu-save">Zapisz</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function GalleryManager() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = useCallback(() => api.get("/gallery").then((r) => setItems(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm({ url: "", category: "Taras", caption: "", order: items.length + 1 }); setEditing("new"); };
  const openEdit = (it) => { setForm({ ...it }); setEditing(it._id); };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form }; delete payload._id; delete payload.id;
    payload.order = Number(payload.order) || 0;
    try {
      if (editing === "new") await api.post("/gallery", payload);
      else await api.put(`/gallery/${editing}`, payload);
      toast.success("Zapisano"); setEditing(null); load();
    } catch { toast.error("Błąd zapisu"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Usunąć zdjęcie?")) return;
    await api.delete(`/gallery/${id}`); toast.success("Usunięto"); load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sand/60 text-sm">{items.length} zdjęć w galerii</p>
        <button onClick={openNew} className="btn-gold rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2" data-testid="add-gallery-btn"><Plus size={16} /> Dodaj zdjęcie</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it._id} className="glass rounded-xl overflow-hidden group relative" data-testid={`gallery-row-${it._id}`}>
            <img src={it.url} alt={it.caption} className="w-full h-40 object-cover" />
            <div className="p-3">
              <div className="text-xs text-gold uppercase tracking-wide">{it.category}</div>
              <div className="text-sm text-cream truncate">{it.caption}</div>
            </div>
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(it)} className="w-8 h-8 rounded-full bg-navy/80 text-cream flex items-center justify-center hover:text-gold" data-testid={`edit-gallery-${it._id}`}><Pencil size={14} /></button>
              <button onClick={() => remove(it._id)} className="w-8 h-8 rounded-full bg-navy/80 text-cream flex items-center justify-center hover:text-red-400" data-testid={`delete-gallery-${it._id}`}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing === "new" ? "Nowe zdjęcie" : "Edytuj zdjęcie"}>
          <form onSubmit={save} className="space-y-3" data-testid="gallery-form">
            <input className={inputCls} placeholder="URL zdjęcia" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required data-testid="gallery-url" />
            {form.url && <img src={form.url} alt="podgląd" className="w-full h-40 object-cover rounded-lg" />}
            <input className={inputCls} placeholder="Podpis" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} data-testid="gallery-caption" />
            <div className="grid grid-cols-2 gap-3">
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATS_GALLERY.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" className={inputCls} placeholder="Kolejność" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            </div>
            <button type="submit" className="btn-gold rounded-full w-full py-3 text-sm font-semibold" data-testid="gallery-save">Zapisz</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("menu");

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
  }, [loading, user, navigate]);

  if (loading || !user) return <div className="min-h-screen bg-navy flex items-center justify-center text-sand/60">Ładowanie...</div>;

  return (
    <div className="min-h-screen bg-navy grain">
      <header className="glass border-b border-sand/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <div>
            <div className="font-serif text-2xl text-cream">Trio Molo · Panel</div>
            <div className="text-xs text-sand/50">{user.email}</div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-sand/70 hover:text-gold transition-colors">Podgląd strony</a>
            <button onClick={() => { logout(); navigate("/admin/login"); }} className="rounded-full px-4 py-2 text-sm border border-sand/25 text-cream hover:border-gold hover:text-gold transition-colors inline-flex items-center gap-2" data-testid="logout-btn">
              <LogOut size={15} /> Wyloguj
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex gap-3 mb-8">
          <button onClick={() => setTab("menu")} className={`rounded-full px-6 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors ${tab === "menu" ? "bg-gold text-navy" : "glass text-sand/70 hover:text-gold"}`} data-testid="tab-menu">
            <Coffee size={16} /> Menu
          </button>
          <button onClick={() => setTab("gallery")} className={`rounded-full px-6 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors ${tab === "gallery" ? "bg-gold text-navy" : "glass text-sand/70 hover:text-gold"}`} data-testid="tab-gallery">
            <ImageIcon size={16} /> Galeria
          </button>
        </div>

        {tab === "menu" ? <MenuManager /> : <GalleryManager />}
      </div>
    </div>
  );
}
