import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSpCareAdminFeatured, useSpCareAdminMedia, useSpCareAdminMediaActions, useSpCareAdminOverview, useSpCareAdminServices, useSpCareAdminUpdateService } from "@/lib/spcareApi";
import { Building2, CheckCircle2, FileImage, FileText, ImagePlus, LayoutDashboard, Loader2, Pencil, Search, ShieldCheck, Sparkles, Trash2, UploadCloud, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type EditingService = { id: number; nameBn: string; phone: string; imageUrl: string };
type EditingMedia = { id: number; altTextBn: string };

const adminActions = [
  { label: "নতুন সেবা যোগ করুন", detail: "Directory content", icon: Building2, target: "services-inventory" },
  { label: "ছবি আপডেট করুন", detail: "Media library", icon: ImagePlus, target: "media-library" },
  { label: "নোটিশ লিখুন", detail: "Publish workflow", icon: FileText, target: "media-library" },
];

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("ফাইল পড়া যায়নি"));
    reader.readAsDataURL(file);
  });
}

export default function Admin() {
  const auth = useAuth();
  if (auth.loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-[#0A6E4B]" /></div>;
  if (!auth.user) return <DashboardLayout><div /></DashboardLayout>;
  if (auth.user.role !== "admin") return <DashboardLayout><Card className="border-red-200 bg-red-50"><CardContent className="p-6"><div className="flex items-start gap-3 text-red-800"><ShieldCheck className="mt-0.5" size={20} /><div><p className="font-semibold">Admin access প্রয়োজন</p><p className="mt-1 text-sm">আপনার account-এর admin permission না থাকায় এই control plane খোলা যাবে না।</p></div></div></CardContent></Card></DashboardLayout>;
  return <AdminWorkspace />;
}

function AdminWorkspace() {
  const [search, setSearch] = useState("");
  const [mediaSearch, setMediaSearch] = useState("");
  const [editing, setEditing] = useState<EditingService | null>(null);
  const [editingMedia, setEditingMedia] = useState<EditingMedia | null>(null);
  const [pickerMode, setPickerMode] = useState<"service" | "featured" | null>(null);
  const [selectedFeaturedId, setSelectedFeaturedId] = useState<number | null>(null);
  const [uploadAltText, setUploadAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overview = useSpCareAdminOverview();
  const services = useSpCareAdminServices(search || undefined);
  const media = useSpCareAdminMedia();
  const featured = useSpCareAdminFeatured();
  const updateService = useSpCareAdminUpdateService();
  const mediaActions = useSpCareAdminMediaActions();

  const filteredMedia = useMemo(() => {
    const term = mediaSearch.trim().toLowerCase();
    if (!term) return media.data ?? [];
    return (media.data ?? []).filter((asset) => `${asset.fileKey} ${asset.altTextBn ?? ""} ${asset.mimeType}`.toLowerCase().includes(term));
  }, [media.data, mediaSearch]);

  const saveEditing = () => {
    if (!editing) return;
    updateService.save({ id: editing.id, nameBn: editing.nameBn, phone: editing.phone || null, imageUrl: editing.imageUrl || null });
    toast.success("সেবার তথ্য আপডেট হয়েছে");
    setEditing(null);
  };

  const uploadSelectedFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("শুধু image ফাইল আপলোড করা যাবে");
    if (file.size > 5 * 1024 * 1024) return toast.error("ফাইলের সর্বোচ্চ সীমা ৫ MB");
    try {
      const base64 = await fileToBase64(file);
      mediaActions.upload.mutate({ filename: file.name, mimeType: file.type as "image/jpeg", bytes: file.size, base64, altTextBn: uploadAltText || null }, {
        onSuccess: () => { toast.success("মিডিয়া লাইব্রেরিতে ছবি যোগ হয়েছে"); setUploadAltText(""); if (fileInputRef.current) fileInputRef.current.value = ""; },
        onError: (error) => toast.error(error.message || "আপলোড ব্যর্থ হয়েছে"),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ফাইল পড়া যায়নি");
    }
  };

  const saveMediaMetadata = () => {
    if (!editingMedia) return;
    mediaActions.update.mutate(editingMedia, { onSuccess: () => { toast.success("মিডিয়া metadata আপডেট হয়েছে"); setEditingMedia(null); }, onError: (error) => toast.error(error.message) });
  };

  const selectMedia = (url: string) => {
    if (pickerMode === "service" && editing) {
      setEditing({ ...editing, imageUrl: url });
      toast.success("সেবার image URL নির্বাচিত হয়েছে");
    }
    if (pickerMode === "featured" && selectedFeaturedId) {
      mediaActions.saveFeaturedImage({ id: selectedFeaturedId, imageUrl: url });
      toast.success("Featured image আপডেটের জন্য সংরক্ষিত হয়েছে");
      setSelectedFeaturedId(null);
    }
    setPickerMode(null);
  };

  const archiveMedia = (id: number) => {
    if (!window.confirm("এই asset-টি library থেকে archive করবেন?")) return;
    mediaActions.archive.mutate({ id }, { onSuccess: () => toast.success("মিডিয়া archive হয়েছে"), onError: (error) => toast.error(error.message) });
  };

  const scrollTo = (target: string) => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return <DashboardLayout><div className="admin-shell space-y-6">
    <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#0A6E4B] via-[#0b8059] to-[#073e2d] p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100"><LayoutDashboard size={14} /> Control plane</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">SPCare Admin</h1><p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/85">সেবা, নোটিশ, featured content ও verified media একটি নিরাপদ workspace থেকে পরিচালনা করুন।</p></div><Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">/admin</Badge></div><div className="flex flex-wrap gap-2 text-xs text-emerald-100"><span className="rounded-full bg-white/10 px-3 py-1.5">Draft → Review → Publish</span><span className="rounded-full bg-white/10 px-3 py-1.5">S3 media ready</span><span className="rounded-full bg-white/10 px-3 py-1.5">Audit ready</span></div></header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[{ label: "মোট সেবা", value: overview.data?.services ?? 0, tone: "bg-emerald-500" }, { label: "ক্যাটাগরি", value: overview.data?.categories ?? 0, tone: "bg-amber-500" }, { label: "নোটিশ", value: overview.data?.notices ?? 0, tone: "bg-sky-500" }, { label: "Featured", value: overview.data?.featured ?? 0, tone: "bg-violet-500" }, { label: "মিডিয়া", value: overview.data?.media ?? 0, tone: "bg-pink-500" }].map((item) => <Card key={item.label} className="admin-stat-card"><CardContent className="p-5"><p className="text-sm text-slate-500">{item.label}</p><div className="mt-2 flex items-end justify-between"><strong className="text-3xl font-bold text-slate-900">{overview.isLoading ? <Loader2 className="animate-spin" size={24} /> : item.value}</strong><span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} /></div><p className="mt-2 text-xs text-slate-400">Content inventory</p></CardContent></Card>)}</section>

    <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]"><Card className="rounded-3xl border-slate-200/80 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Sparkles size={19} className="text-[#E6A817]" /> দ্রুত ব্যবস্থাপনা</CardTitle></CardHeader><CardContent className="grid gap-3">{adminActions.map((action) => <button key={action.label} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md" onClick={() => scrollTo(action.target)}><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#0A6E4B] transition group-hover:bg-[#0A6E4B] group-hover:text-white"><action.icon size={20} /></span><span className="min-w-0"><strong className="block text-sm text-slate-900">{action.label}</strong><small className="mt-1 block text-slate-500">{action.detail}</small></span><span className="ml-auto text-slate-300">→</span></button>)}</CardContent></Card>

      <Card id="services-inventory" className="rounded-3xl border-slate-200/80 shadow-sm"><CardHeader className="flex flex-row items-center justify-between gap-3"><div><CardTitle className="text-xl">সেবা inventory</CardTitle><p className="mt-1 text-sm text-slate-500">Public directory-এর বর্তমান content</p></div><Badge variant="secondary" className="bg-emerald-50 text-[#0A6E4B]">{services.data?.length ?? 0} entries</Badge></CardHeader><CardContent><div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="সেবা খুঁজুন..." className="h-11 rounded-xl pl-10" /></div>{editing && <div className="mb-4 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4"><div className="flex items-center justify-between"><strong className="text-sm text-emerald-950">সেবা তথ্য সম্পাদনা</strong><button onClick={() => setEditing(null)} aria-label="সম্পাদনা বন্ধ করুন"><X size={17} /></button></div><Input value={editing.nameBn} onChange={(event) => setEditing({ ...editing, nameBn: event.target.value })} placeholder="সেবার নাম" /><Input value={editing.phone} onChange={(event) => setEditing({ ...editing, phone: event.target.value })} placeholder="ফোন নম্বর" /><div className="flex gap-2"><Input value={editing.imageUrl} onChange={(event) => setEditing({ ...editing, imageUrl: event.target.value })} placeholder="Image URL" /><Button type="button" variant="outline" className="shrink-0 rounded-xl" onClick={() => setPickerMode("service")}>মিডিয়া বাছুন</Button></div><div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setEditing(null)}>বাতিল</Button><Button className="rounded-xl bg-[#0A6E4B] hover:bg-[#07583c]" disabled={updateService.isPending} onClick={saveEditing}>{updateService.isPending ? <Loader2 className="animate-spin" size={16} /> : "সংরক্ষণ করুন"}</Button></div></div>}<div className="space-y-2">{services.isLoading ? <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="animate-spin" size={17} /> সেবা লোড হচ্ছে...</div> : services.data?.map((service) => <div key={service.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Building2 size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{service.nameBn}</p><p className="mt-0.5 truncate text-xs text-slate-500">{service.categoryNameBn ?? "সেবা"} · {service.upazilaBn ?? service.districtBn}</p></div>{service.isVerified ? <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 size={12} /> Verified</Badge> : <Badge variant="outline" className="border-amber-200 text-amber-700">Review</Badge>}<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ id: service.id, nameBn: service.nameBn, phone: service.phone ?? "", imageUrl: service.imageUrl ?? "" })} aria-label={`${service.nameBn} সম্পাদনা`}><Pencil size={15} /></Button></div>)}{!services.isLoading && !services.data?.length ? <p className="py-8 text-center text-sm text-slate-500">কোনো সেবা পাওয়া যায়নি।</p> : null}</div><Button variant="outline" className="mt-4 w-full rounded-xl" onClick={() => toast("Full service create flow পরবর্তী milestone-এ আসছে")}>সব সেবা পরিচালনা করুন</Button></CardContent></Card>
    </section>

    <section className="scroll-mt-6"><Card className="rounded-3xl border-slate-200/80 shadow-sm"><CardHeader className="flex flex-row items-center justify-between gap-3"><div><CardTitle className="text-xl">Featured content media</CardTitle><p className="mt-1 text-sm text-slate-500">Carousel-এর image reference media library থেকে বাছুন</p></div><Badge variant="secondary" className="bg-violet-50 text-violet-700">{featured.data?.length ?? 0} items</Badge></CardHeader><CardContent className="grid gap-3">{featured.isLoading ? <div className="flex items-center gap-2 py-5 text-sm text-slate-500"><Loader2 className="animate-spin" size={17} /> Featured items লোড হচ্ছে...</div> : featured.data?.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"><img src={item.imageUrl} alt={item.titleBn} className="h-14 w-20 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{item.titleBn}</p><p className="mt-1 text-xs text-slate-500">{item.tagBn} · {item.locationBn}</p></div><Button variant="outline" size="sm" className="rounded-lg" onClick={() => { setSelectedFeaturedId(item.id); setPickerMode("featured"); }}>মিডিয়া বাছুন</Button></div>)}</CardContent></Card></section>

    <section id="media-library" className="scroll-mt-6"><Card className="rounded-3xl border-slate-200/80 shadow-sm"><CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="flex items-center gap-2 text-xl"><FileImage size={20} className="text-[#0A6E4B]" /> মিডিয়া লাইব্রেরি</CardTitle><p className="mt-1 text-sm text-slate-500">S3-backed image assets · সর্বোচ্চ ৫ MB · JPEG, PNG, WebP, GIF, AVIF</p></div><Badge variant="secondary" className="w-fit bg-emerald-50 text-[#0A6E4B]">{media.data?.length ?? 0} assets</Badge></CardHeader><CardContent><div className="grid gap-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4 sm:grid-cols-[1fr_auto] sm:items-end"><div><label className="mb-2 block text-sm font-semibold text-emerald-950" htmlFor="media-alt">Alt text (বাংলা)</label><Input id="media-alt" value={uploadAltText} onChange={(event) => setUploadAltText(event.target.value)} placeholder="যেমন: মধুটিলা ইকোপার্কের পাহাড়ি দৃশ্য" className="h-11 rounded-xl bg-white" /><p className="mt-2 text-xs text-emerald-800/70">Upload-এর সঙ্গে alt text সংরক্ষণ করলে accessibility ও SEO ভালো থাকে।</p></div><div><input ref={fileInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(event) => void uploadSelectedFile(event.target.files?.[0])} /><Button className="h-11 w-full rounded-xl bg-[#0A6E4B] px-5 hover:bg-[#07583c] sm:w-auto" disabled={mediaActions.upload.isPending} onClick={() => fileInputRef.current?.click()}>{mediaActions.upload.isPending ? <Loader2 className="mr-2 animate-spin" size={17} /> : <UploadCloud className="mr-2" size={17} />} ছবি আপলোড করুন</Button></div></div><div className="relative my-5"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><Input value={mediaSearch} onChange={(event) => setMediaSearch(event.target.value)} placeholder="মিডিয়া filename বা alt text খুঁজুন..." className="h-11 rounded-xl pl-10" /></div>{media.isLoading ? <div className="flex items-center gap-2 py-10 text-sm text-slate-500"><Loader2 className="animate-spin" size={18} /> মিডিয়া লোড হচ্ছে...</div> : media.isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">মিডিয়া লাইব্রেরি লোড করা যায়নি। আবার চেষ্টা করুন।</div> : filteredMedia.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">কোনো media asset পাওয়া যায়নি। প্রথম ছবি আপলোড করুন।</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredMedia.map((asset) => <article key={asset.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="aspect-[16/10] bg-slate-100"><img src={asset.publicUrl} alt={asset.altTextBn ?? "SPCare media asset"} className="h-full w-full object-cover" /></div><div className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{asset.altTextBn || "Alt text যোগ করা হয়নি"}</p><p className="mt-1 truncate text-xs text-slate-500">{asset.mimeType} · {Math.round((asset.bytes ?? 0) / 1024)} KB</p></div><Badge variant="outline" className="shrink-0 border-emerald-200 text-emerald-700">{asset.status}</Badge></div>{editingMedia?.id === asset.id ? <div className="space-y-2"><Input value={editingMedia.altTextBn} onChange={(event) => setEditingMedia({ ...editingMedia, altTextBn: event.target.value })} placeholder="বাংলা alt text" /><div className="flex gap-2"><Button size="sm" className="rounded-lg bg-[#0A6E4B] hover:bg-[#07583c]" disabled={mediaActions.update.isPending} onClick={saveMediaMetadata}>সংরক্ষণ</Button><Button size="sm" variant="ghost" onClick={() => setEditingMedia(null)}>বাতিল</Button></div></div> : <div className="flex items-center gap-2"><Button variant="outline" size="sm" className="rounded-lg" onClick={() => setEditingMedia({ id: asset.id, altTextBn: asset.altTextBn ?? "" })}><Pencil size={14} className="mr-1" /> Edit alt</Button>{pickerMode && <Button variant="outline" size="sm" className="rounded-lg border-emerald-200 text-emerald-700" onClick={() => selectMedia(asset.publicUrl)}>Use image</Button>}<Button variant="ghost" size="sm" className="ml-auto text-red-600 hover:bg-red-50 hover:text-red-700" disabled={mediaActions.archive.isPending} onClick={() => archiveMedia(asset.id)}><Trash2 size={14} className="mr-1" /> Archive</Button></div>}</div></article>)}</div>}</CardContent></Card></section>
  </div></DashboardLayout>;
}
