"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  LogOut, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  MapPin, 
  Download, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
  Image as ImageIcon,
  BookOpen,
  Sparkles
} from "lucide-react";
import BigScreenPresentation from "@/components/admin/BigScreenPresentation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { CagarBudayaItem, CagarBudayaStatus, FotoBangunan } from "@/lib/types";
import { 
  fetchAllBangunan, 
  saveBangunanItem, 
  deleteBangunanItem, 
  uploadBangunanFoto 
} from "@/lib/supabase/service";
import { INITIAL_CAGAR_BUDAYA } from "@/data/initialData";
import { getStatusBadgeClass, padNumber } from "@/lib/utils";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const STATUS_LIST: CagarBudayaStatus[] = ["Nasional", "Provinsi", "Kota", "Kabupaten"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<CagarBudayaItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bigScreenOpen, setBigScreenOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<CagarBudayaItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Form tab: 'info' | 'narasi' | 'location' | 'photos'
  const [activeTab, setActiveTab] = useState<"info" | "narasi" | "location" | "photos">("info");

  // Edit form state
  const [formData, setFormData] = useState<Partial<CagarBudayaItem>>({});
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [newFotoCaption, setNewFotoCaption] = useState("");

  // Check auth
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
    if (!isLoggedIn) {
      router.push("/admin/login");
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllBangunan();
      setItems(data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("admin_logged_in");
    router.push("/");
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const maxNo = items.reduce((max, b) => Math.max(max, b.no || 0), 0);
    const newItem: CagarBudayaItem = {
      id: "b" + (maxNo + 1),
      no: maxNo + 1,
      nama: "",
      didirikan: "",
      status: "Nasional",
      sk: "",
      tglSK: "",
      ket: "",
      alamat: "",
      narasi: "",
      lat: null,
      lng: null,
      fotos: [],
      mainIdx: 0,
      fit: "contain",
    };
    setActiveItem(newItem);
    setFormData(newItem);
    setIsNew(true);
    setActiveTab("info");
    setEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: CagarBudayaItem) => {
    setActiveItem(item);
    setFormData(JSON.parse(JSON.stringify(item)));
    setIsNew(false);
    setActiveTab("info");
    setEditModalOpen(true);
  };

  // Save changes
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) {
      showNotification("error", "Nama bangunan wajib diisi");
      return;
    }

    const itemToSave: CagarBudayaItem = {
      id: formData.id || "b" + (formData.no || 1),
      no: Number(formData.no) || 1,
      nama: formData.nama || "",
      didirikan: formData.didirikan || "",
      tahunDidirikan: formData.didirikan ? parseInt(formData.didirikan.replace(/\D/g, ""), 10) || null : null,
      status: (formData.status as CagarBudayaStatus) || "Nasional",
      sk: formData.sk || "",
      tglSK: formData.tglSK || "",
      ket: formData.ket || "",
      alamat: formData.alamat || "",
      narasi: formData.narasi || "",
      lat: formData.lat != null ? Number(formData.lat) : null,
      lng: formData.lng != null ? Number(formData.lng) : null,
      fotos: formData.fotos || [],
      mainIdx: formData.mainIdx || 0,
      fit: formData.fit || "contain",
    };

    const res = await saveBangunanItem(itemToSave);
    if (res.success) {
      showNotification("success", isNew ? "Bangunan berhasil ditambahkan!" : "Data bangunan berhasil diperbarui!");
      setEditModalOpen(false);
      loadData();
    } else {
      showNotification("error", res.error || "Gagal menyimpan data");
    }
  };

  // Delete Item
  const handleConfirmDelete = async () => {
    if (!activeItem) return;
    const res = await deleteBangunanItem(activeItem.id);
    if (res.success) {
      showNotification("success", "Bangunan berhasil dihapus");
      setDeleteModalOpen(false);
      loadData();
    } else {
      showNotification("error", res.error || "Gagal menghapus");
    }
  };

  // Photo Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.id) return;

    setUploadingFoto(true);
    try {
      const res = await uploadBangunanFoto(formData.id, file, newFotoCaption);
      if (res.success && res.foto) {
        const currentFotos = formData.fotos || [];
        const updatedFotos = [...currentFotos, res.foto];
        setFormData({ ...formData, fotos: updatedFotos });
        setNewFotoCaption("");
        showNotification("success", "Foto berhasil diunggah!");
      } else {
        showNotification("error", res.error || "Gagal mengunggah foto");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error upload";
      showNotification("error", msg);
    } finally {
      setUploadingFoto(false);
      e.target.value = "";
    }
  };

  // Geocode Nominatim
  const handleGeocode = async () => {
    const query = formData.alamat || formData.nama;
    if (!query) {
      showNotification("error", "Isi alamat atau nama gedung terlebih dahulu untuk mencari titik");
      return;
    }

    try {
      showNotification("success", "Mencari koordinat di OpenStreetMap...");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ", Indonesia"
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setFormData({ ...formData, lat, lng: lon });
        showNotification("success", `Titik ditemukan: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      } else {
        showNotification("error", "Titik tidak ditemukan otomatis. Anda dapat memasukkan koordinat manual.");
      }
    } catch (e) {
      showNotification("error", "Gagal menghubungi layanan geocoding");
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cagar_budaya_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Items
  const filtered = useMemo(() => {
    return items.filter((b) => {
      const matchStatus = selectedStatus === "Semua" || b.status === selectedStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        b.nama.toLowerCase().includes(q) ||
        b.alamat.toLowerCase().includes(q) ||
        String(b.no).includes(q);
      return matchStatus && matchSearch;
    });
  }, [items, selectedStatus, search]);

  return (
    <div className="min-h-screen bg-[#0f0e0c] text-[#f2eee6] flex flex-col font-sans">
      {/* Admin Top Navigation */}
      <header className="border-b border-[#2c2822] bg-[#141311]/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-[#1e1c18] hover:bg-[#2c2822] text-[#d1c7b7] hover:text-[#e6c875] border border-[#2c2822] transition-colors"
              title="Kembali ke Situs Publik"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#c8a24a]/20 border border-[#c8a24a]/50 flex items-center justify-center text-[#e6c875]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-[#f2eee6] flex items-center gap-2">
                  <span>Panel Kelola Cagar Budaya</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c8a24a]/20 text-[#e6c875] border border-[#c8a24a]/30">
                    ADMIN
                  </span>
                </h1>
                <p className="text-[10px] text-[#8c8273]">
                  {isSupabaseConfigured ? "Mode Terhubung Supabase Database & Storage" : "Mode Penyimpanan Lokal"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />

            <button
              onClick={() => setBigScreenOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#0b0a08] text-xs font-bold shadow-lg shadow-[#d4af37]/25 hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Buka Mode Presentasi Layar Lebar (Big Screen Showcase)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0b0a08]" />
              <span>⛶ Layar Lebar (Big Screen)</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg border border-[#2c2822] bg-[#1a1815] hover:border-[#c8a24a] text-xs font-mono text-[#d1c7b7] hover:text-[#e6c875] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Unduh Cadangan Seluruh Data sebagai JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cadangan JSON</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg border border-red-900/50 bg-red-950/20 hover:bg-red-950/40 text-xs font-mono text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center gap-3 transition-all ${
              notification.type === "success"
                ? "bg-[#52b788]/15 border-[#52b788]/40 text-[#82e0aa]"
                : "bg-red-900/20 border-red-800/40 text-red-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[#2c2822] bg-[#141311]">
            <div className="text-[10px] font-mono text-[#8c8273] uppercase">Total Terdata</div>
            <div className="text-2xl font-bold text-[#e6c875] mt-1">{items.length} Bangunan</div>
          </div>
          <div className="p-4 rounded-xl border border-[#2c2822] bg-[#141311]">
            <div className="text-[10px] font-mono text-[#8c8273] uppercase">Status Nasional</div>
            <div className="text-2xl font-bold text-[#c8a24a] mt-1">
              {items.filter((b) => b.status === "Nasional").length} Bangunan
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[#2c2822] bg-[#141311]">
            <div className="text-[10px] font-mono text-[#8c8273] uppercase">Titik Peta Terdaftar</div>
            <div className="text-2xl font-bold text-[#5a94d6] mt-1">
              {items.filter((b) => b.lat && b.lng).length} Titik
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[#2c2822] bg-[#141311]">
            <div className="text-[10px] font-mono text-[#8c8273] uppercase">Bangunan Berfoto</div>
            <div className="text-2xl font-bold text-[#52b788] mt-1">
              {items.filter((b) => b.fotos && b.fotos.length > 0).length} Bangunan
            </div>
          </div>
        </div>

        {/* Action Controls & Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7d7568]" />
                <input
                  type="text"
                  placeholder="Cari nomor, nama jemaat, atau alamat..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#161512] border border-[#2c2822] focus:border-[#c8a24a] rounded-xl pl-9 pr-3 py-2 text-xs text-[#f2eee6] focus:outline-none"
                />
              </div>

              {/* Status filter dropdown */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#161512] border border-[#2c2822] text-xs text-[#f2eee6] rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                {STATUS_LIST.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c8a24a] to-[#d4af37] text-[#11100e] text-xs font-semibold hover:brightness-110 shadow-lg shadow-[#c8a24a]/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Bangunan Baru</span>
            </button>
          </div>

          {/* Buildings Table */}
          <div className="w-full overflow-x-auto border border-[#2c2822] rounded-xl bg-[#141311] shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#1a1815] text-[#e6c875] border-b border-[#2c2822] font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-3">Nama Bangunan / Jemaat</th>
                  <th className="py-3 px-3">Didirikan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Alamat</th>
                  <th className="py-3 px-3">Koordinat</th>
                  <th className="py-3 px-3 text-center">Foto</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#221f1a]">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-[#1c1a16] transition-colors">
                    <td className="py-3 px-3 font-mono text-center text-[#c8a24a] font-bold">
                      {padNumber(b.no)}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#f2eee6]">
                      {b.nama}
                    </td>
                    <td className="py-3 px-3 text-[#a89f91] font-mono text-[11px]">
                      {b.didirikan || "—"}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusBadgeClass(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#a89f91] max-w-xs truncate text-[11px]">
                      {b.alamat || "—"}
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px]">
                      {b.lat && b.lng ? (
                        <span className="text-[#52b788]">
                          {b.lat.toFixed(3)}, {b.lng.toFixed(3)}
                        </span>
                      ) : (
                        <span className="text-[#786f61]">Belum disetel</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      {b.fotos && b.fotos.length > 0 ? (
                        <span className="text-[#e6c875] font-semibold">{b.fotos.length} foto</span>
                      ) : (
                        <span className="text-[#6d6455]">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 rounded-lg bg-[#25221d] hover:bg-[#c8a24a] hover:text-[#11100e] text-[#d1c7b7] transition-colors cursor-pointer"
                          title="Edit Bangunan & Foto"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveItem(b);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#25221d] hover:bg-red-800 text-[#d1c7b7] hover:text-white transition-colors cursor-pointer"
                          title="Hapus Bangunan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ================= EDIT / CREATE MODAL ================= */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#141311] border border-[#2c2822] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#2c2822] flex items-center justify-between bg-[#181714]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#c8a24a]">
                  {isNew ? "Tambah Cagar Budaya" : `Edit Inventaris #${padNumber(formData.no || 0)}`}
                </span>
                <h2 className="text-lg font-serif font-bold text-[#f2eee6]">
                  {isNew ? "Form Pendaftaran Bangunan Baru" : formData.nama}
                </h2>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#221f1a] text-[#a89f91] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-5 border-b border-[#221f1a] bg-[#12110f] flex items-center gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`py-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === "info"
                    ? "border-[#c8a24a] text-[#e6c875] font-semibold"
                    : "border-transparent text-[#8c8273] hover:text-[#d1c7b7]"
                }`}
              >
                1. Data Pokok
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("narasi")}
                className={`py-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === "narasi"
                    ? "border-[#c8a24a] text-[#e6c875] font-semibold"
                    : "border-transparent text-[#8c8273] hover:text-[#d1c7b7]"
                }`}
              >
                2. Narasi Sejarah
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("location")}
                className={`py-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === "location"
                    ? "border-[#c8a24a] text-[#e6c875] font-semibold"
                    : "border-transparent text-[#8c8273] hover:text-[#d1c7b7]"
                }`}
              >
                3. Lokasi & Peta
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("photos")}
                className={`py-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === "photos"
                    ? "border-[#c8a24a] text-[#e6c875] font-semibold"
                    : "border-transparent text-[#8c8273] hover:text-[#d1c7b7]"
                }`}
              >
                4. Galeri Foto ({formData.fotos?.length || 0})
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Tab 1: Info */}
              {activeTab === "info" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[11px] font-mono text-[#a89f91] uppercase">No. Urut</label>
                      <input
                        type="number"
                        required
                        value={formData.no || ""}
                        onChange={(e) => setFormData({ ...formData, no: parseInt(e.target.value) || 0 })}
                        className="w-full mt-1 bg-[#181714] border border-[#2c2822] rounded-xl px-3 py-2 text-xs text-[#f2eee6] focus:outline-none focus:border-[#c8a24a]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[11px] font-mono text-[#a89f91] uppercase">Nama Jemaat / Gereja</label>
                      <input
                        type="text"
                        required
                        value={formData.nama || ""}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Contoh: GPIB Immanuel, Jakarta"
                        className="w-full mt-1 bg-[#181714] border border-[#2c2822] rounded-xl px-3 py-2 text-xs text-[#f2eee6] focus:outline-none focus:border-[#c8a24a]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono text-[#a89f91] uppercase">Status Penetapan</label>
                      <select
                        value={formData.status || "Nasional"}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full mt-1 bg-[#181714] border border-[#2c2822] rounded-xl px-3 py-2 text-xs text-[#f2eee6] focus:outline-none focus:border-[#c8a24a] cursor-pointer"
                      >
                        {STATUS_LIST.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-[#a89f91] uppercase">Dibangun / Didirikan</label>
                      <input
                        type="text"
                        value={formData.didirikan || ""}
                        onChange={(e) => setFormData({ ...formData, didirikan: e.target.value })}
                        placeholder="Contoh: Tahun 1839 atau 23 Oktober 1695"
                        className="w-full mt-1 bg-[#181714] border border-[#2c2822] rounded-xl px-3 py-2 text-xs text-[#f2eee6] focus:outline-none focus:border-[#c8a24a]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono text-[#a89f91] uppercase">Surat Keputusan (SK)</label>
                      <input
                        type="text"
                        value={formData.sk || ""}
                        onChange={(e) => setFormData({ ...formData, sk: e.target.value })}
                        placeholder="Contoh: Kepmendikbud No:184/M/2017"
                        className="w-full mt-1 bg-[#181714] border border-[#2c2822] rounded-xl px-3 py-2 text-xs text-[#f2eee6] focus:outline-none focus:border-[#c8a24a]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-[#a89f91] uppercase">Tanggal SK</label>
                      <input
                        type="text"
                        value={formData.tglSK || ""}
                        onChange={(e) => setFormData({ ...formData, tglSK: e.target.value })}
                        placeholder="Contoh: 24 September 2018"
                        className="w-full mt-1 bg-[#181714] border border-[#2c2822] rounded-xl px-3 py-2 text-xs text-[#f2eee6] focus:outline-none focus:border-[#c8a24a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-[#a89f91] uppercase">Keterangan Tambahan</label>
                    <input
                      type="text"
                      value={formData.ket || ""}
                      onChange={(e) => setFormData({ ...formData, ket: e.target.value })}
                      placeholder="Catatan status penetapan atau pembaruan"
                      className="w-full mt-1 bg-[#181714] border border-[#2c2822] rounded-xl px-3 py-2 text-xs text-[#f2eee6] focus:outline-none focus:border-[#c8a24a]"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Narasi */}
              {activeTab === "narasi" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-[#a89f91] uppercase">
                      Narasi Sejarah Berdirinya & Arsitektur
                    </label>
                    <span className="text-[10px] text-[#6e6556]">
                      Ditampilkan di slide utama bangunan
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={formData.narasi || ""}
                    onChange={(e) => setFormData({ ...formData, narasi: e.target.value })}
                    placeholder="Tuliskan latar belakang sejarah, arsitek perancang, gaya arsitektur, dan peranan penting gedung gereja ini..."
                    className="w-full bg-[#181714] border border-[#2c2822] focus:border-[#c8a24a] rounded-xl p-3 text-xs text-[#f2eee6] focus:outline-none leading-relaxed font-light"
                  />
                </div>
              )}

              {/* Tab 3: Location */}
              {activeTab === "location" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono text-[#a89f91] uppercase">Alamat Lengkap</label>
                    <input
                      type="text"
                      value={formData.alamat || ""}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      placeholder="Jl. Medan Merdeka Timur No.10, Gambir, Jakarta Pusat"
                      className="w-full mt-1 bg-[#181714] border border-[#2c2822] rounded-xl px-3 py-2 text-xs text-[#f2eee6] focus:outline-none focus:border-[#c8a24a]"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-[#2c2822] bg-[#161512] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#f2eee6]">Titik Koordinat Geografis</span>
                      <button
                        type="button"
                        onClick={handleGeocode}
                        className="px-3 py-1.5 rounded-lg bg-[#c8a24a]/15 text-[#e6c875] border border-[#c8a24a]/30 hover:bg-[#c8a24a]/25 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>⌖ Cari Titik Otomatis (Nominatim)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono text-[#8c8273] uppercase">Latitude (Lintang)</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lat != null ? formData.lat : ""}
                          onChange={(e) => setFormData({ ...formData, lat: e.target.value ? parseFloat(e.target.value) : null })}
                          placeholder="-6.1753"
                          className="w-full mt-1 bg-[#100f0d] border border-[#2c2822] rounded-xl px-3 py-2 text-xs text-[#f2eee6] font-mono focus:outline-none focus:border-[#c8a24a]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-[#8c8273] uppercase">Longitude (Bujur)</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lng != null ? formData.lng : ""}
                          onChange={(e) => setFormData({ ...formData, lng: e.target.value ? parseFloat(e.target.value) : null })}
                          placeholder="106.8289"
                          className="w-full mt-1 bg-[#100f0d] border border-[#2c2822] rounded-xl px-3 py-2 text-xs text-[#f2eee6] font-mono focus:outline-none focus:border-[#c8a24a]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Photos */}
              {activeTab === "photos" && (
                <div className="space-y-5">
                  {/* Upload Section */}
                  <div className="p-4 rounded-xl border border-dashed border-[#3d372c] bg-[#161512] space-y-3">
                    <div className="text-xs font-semibold text-[#f2eee6] flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#c8a24a]" />
                      <span>Unggah Foto Baru ke Supabase Storage</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder="Keterangan foto (opsional)..."
                        value={newFotoCaption}
                        onChange={(e) => setNewFotoCaption(e.target.value)}
                        className="flex-1 bg-[#100f0d] border border-[#2c2822] rounded-xl px-3 py-1.5 text-xs text-[#f2eee6] focus:outline-none focus:border-[#c8a24a]"
                      />
                      <label className="px-4 py-2 rounded-xl bg-[#c8a24a] text-[#11100e] text-xs font-semibold hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingFoto ? "Mengunggah..." : "Pilih File Foto"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingFoto}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <p className="text-[10px] text-[#786f61]">
                      Mendukung format JPG, PNG, WEBP. Foto otomatis disimpan di cloud Supabase Storage bucket <code>cagar-budaya-photos</code>.
                    </p>
                  </div>

                  {/* Existing Photos List */}
                  <div>
                    <h3 className="text-xs font-mono uppercase text-[#a89f91] mb-2">
                      Daftar Foto Terunggah ({formData.fotos?.length || 0})
                    </h3>

                    {(!formData.fotos || formData.fotos.length === 0) ? (
                      <div className="p-8 text-center border border-[#24211a] rounded-xl bg-[#12110f] text-xs text-[#6e6556]">
                        Belum ada foto yang diunggah untuk bangunan ini.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.fotos.map((foto, fIdx) => (
                          <div
                            key={fIdx}
                            className="p-3 rounded-xl border border-[#2c2822] bg-[#161512] flex gap-3 items-start justify-between"
                          >
                            <img
                              src={foto.src}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover bg-black flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-mono text-[#c8a24a]">
                                Foto #{fIdx + 1}
                              </div>
                              <input
                                type="text"
                                value={foto.cap || ""}
                                placeholder="Tulis caption..."
                                onChange={(e) => {
                                  const updated = [...(formData.fotos || [])];
                                  updated[fIdx] = { ...updated[fIdx], cap: e.target.value };
                                  setFormData({ ...formData, fotos: updated });
                                }}
                                className="w-full mt-1 bg-[#100f0d] border border-[#24211a] rounded px-2 py-1 text-[11px] text-[#f2eee6]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.fotos?.filter((_, idx) => idx !== fIdx);
                                setFormData({ ...formData, fotos: updated });
                              }}
                              className="p-1 rounded bg-red-950/40 text-red-300 hover:bg-red-900 transition-colors"
                              title="Hapus foto ini"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#221f1a] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#2c2822] bg-[#181714] text-xs text-[#a89f91] hover:text-white cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c8a24a] to-[#d4af37] text-[#11100e] text-xs font-semibold hover:brightness-110 shadow-lg cursor-pointer transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {deleteModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#141311] border border-red-900/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 rounded-xl bg-red-950/50 border border-red-900/40">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#f2eee6]">
                Konfirmasi Hapus Bangunan
              </h3>
            </div>

            <p className="text-xs text-[#d1c7b7] leading-relaxed">
              Apakah Anda yakin ingin menghapus data inventaris{" "}
              <strong className="text-white font-semibold">#{padNumber(activeItem.no)} {activeItem.nama}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#2c2822] bg-[#181714] text-xs text-[#a89f91] hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= BIG SCREEN SHOWCASE SUITE ================= */}
      {bigScreenOpen && (
        <BigScreenPresentation
          items={items}
          onClose={() => setBigScreenOpen(false)}
          onEditItem={(item) => {
            handleOpenEdit(item);
          }}
        />
      )}
    </div>
  );
}
