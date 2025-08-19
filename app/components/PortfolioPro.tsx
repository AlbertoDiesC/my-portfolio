"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, X, Play, Filter, Clock, Calendar, Tag } from "lucide-react";

const SORT_OPTIONS = ["Newest", "Oldest", "Shortest", "Longest"] as const;
type SortKey = typeof SORT_OPTIONS[number];

// ===== Tipos =====
type Video = {
  id: string;
  title: string;
  src: string;
  poster?: string;
  brand?: string;
  tags?: string[];
  year?: number;
  durationSec?: number;
  description?: string;
};

// ===== Datos (ajústalos a tus rutas reales en /public) =====
const VIDEOS: Video[] = [
  {
    id: "kia-sportage-1",
    title: "Kia Sportage 2025 — Interior POV",
    src: "/videos/kia-sportage-1.mp4",
    poster: "/thumbs/sportage-3.avif",
    brand: "KIA",
    tags: ["Automotive", "Cinematic", "POV"],
    year: 2025,
    durationSec: 8,
    description:
      "One-take POV revealing the interior through a dynamic window cross.",
  },
  {
    id: "kia-sportage-interior",
    title: "KIA Sportage 2025 — Interior Reveal",
    src: "/videos/kia-sportage-interior.mp4",
    poster: "/thumbs/sportage-interior.jpeg",
    brand: "KIA",
    tags: ["Design", "Luxury", "Product"],
    year: 2025,
    durationSec: 8,
    description: "Single scene showcasing KIA Sportage 2025 luxury interior.",
  },
  {
    id: "tesla-interior-reveal",
    title: "Tesla — Interior Reveal",
    src: "/videos/tesla-1.mp4",
    poster: "/thumbs/tesla-dashboard.jpg",
    brand: "TESLA",
    tags: ["Design", "Luxury", "Product"],
    year: 2025,
    durationSec: 8,
    description: "Tesla ad showing whole luxury interior.",
  },
];

// ===== Helper (tipado) =====
function deriveFacets(videos: Video[]): { tags: string[]; brands: string[] } {
  const tagSet = new Set<string>();
  const brandSet = new Set<string>();
  videos.forEach((v) => {
    v.tags?.forEach((t) => tagSet.add(t));
    if (v.brand) brandSet.add(v.brand);
  });
  return {
    tags: Array.from(tagSet).sort(),
    brands: Array.from(brandSet).sort(),
  };
}

// ===== Card =====
type VideoCardProps = { v: Video; onOpen: (v: Video) => void };
function VideoCard({ v, onOpen }: VideoCardProps) {
  return (
    <motion.button
      layout
      onClick={() => onOpen(v)}
      className="group relative w-full overflow-hidden rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/40"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      aria-label={`Open video ${v.title}`}
    >
      <div className="aspect-video w-full overflow-hidden relative">
        {v.poster ? (
          <Image
            src={v.poster}
            alt={v.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="h-full w-full bg-black" />
        )}
      </div>

      <div className="p-4 text-left">
        <div className="flex items-center gap-2 text-xs text-white/70">
          {v.brand && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5">
              <Tag size={14} />
              {v.brand}
            </span>
          )}
          {v.year && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5">
              <Calendar size={14} />
              {v.year}
            </span>
          )}
          {v.durationSec && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5">
              <Clock size={14} />
              {v.durationSec}s
            </span>
          )}
        </div>
        <h3 className="mt-2 text-base font-semibold leading-tight">{v.title}</h3>
        {v.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {v.tags.map((t) => (
              <span
                key={t}
                className="text-xs rounded-full bg-white/5 border border-white/10 px-2 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <Play className="pointer-events-none absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.button>
  );
}

// ===== Modal =====
type VideoModalProps = {
  open: boolean;
  onClose: () => void;
  video: Video | null;
};

function VideoModal({ open, onClose, video }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        if (!videoRef.current) return;
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
      }
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
  }, [open, video]);

  if (!open || !video) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Playing ${video.title}`}
      >
        <motion.div
          className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
          initial={{ scale: 0.98, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.98, y: 10, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-white/10 p-2 text-white/80 backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Close video"
          >
            <X size={18} />
          </button>

          <div className="aspect-video w-full bg-black">
            <video
              ref={videoRef}
              src={video.src}
              poster={video.poster}
              controls
              playsInline
              className="h-full w-full"
            />
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-4">
            <div className="sm:col-span-3">
              <h3 className="text-lg font-semibold">{video.title}</h3>
              {video.description && (
                <p className="mt-1 text-sm text-white/70">{video.description}</p>
              )}
            </div>
            <div className="flex flex-wrap items-start gap-2 sm:justify-end">
              {video.brand && (
                <span className="text-xs rounded-full border border-white/10 px-2 py-0.5">
                  {video.brand}
                </span>
              )}
              {video.year && (
                <span className="text-xs rounded-full border border-white/10 px-2 py-0.5">
                  {video.year}
                </span>
              )}
              {video.durationSec && (
                <span className="text-xs rounded-full border border-white/10 px-2 py-0.5">
                  {video.durationSec}s
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ===== Página principal =====
export default function PortfolioPro() {
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("Newest");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Video | null>(null);

  const facets = useMemo(() => deriveFacets(VIDEOS), []);

  const filtered = useMemo(() => {
    let out = [...VIDEOS];

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.brand?.toLowerCase().includes(q) ||
          v.tags?.some((t) => t.toLowerCase().includes(q)) ||
          v.description?.toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (brandFilter !== "All") out = out.filter((v) => v.brand === brandFilter);

    // Tag filter
    if (tagFilter !== "All") out = out.filter((v) => v.tags?.includes(tagFilter));

    // Sort
    out.sort((a, b) => {
      if (sortBy === "Newest") return (b.year ?? 0) - (a.year ?? 0);
      if (sortBy === "Oldest") return (a.year ?? 0) - (b.year ?? 0);
      if (sortBy === "Shortest") return (a.durationSec ?? 0) - (b.durationSec ?? 0);
      if (sortBy === "Longest") return (b.durationSec ?? 0) - (a.durationSec ?? 0);
      return 0;
    });

    return out;
  }, [query, brandFilter, tagFilter, sortBy]);

  function openVideo(v: Video) {
    setActive(v);
    setOpen(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-930 to-zinc-900 text-white">
      {/* Header */}
      <header className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:pb-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Alberto Dies — Video Portfolio
          </motion.h1>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <span>MP4 • Responsive • Modal Player</span>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-white/70">
          Selection of short-form ads and cinematic spots. Click any card to play. Use Space to pause/play, and Esc to close.
        </p>
      </header>

      {/* Controls */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-3 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <label className="sr-only" htmlFor="search">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={18} />
              <input
                id="search"
                type="text"
                placeholder="Search title, brand, tag…"
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/30"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:col-span-7 grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-white/50">
                <Filter size={14}/>Brand
              </label>
              <select
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus:ring-2 focus:ring-white/30"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                <option>All</option>
                {facets.brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-white/50">
                <Filter size={14}/>Tag
              </label>
              <select
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus:ring-2 focus:ring-white/30"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <option>All</option>
                {facets.tags.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-white/50">
                <Filter size={14}/>Sort
              </label>
              <select
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus:ring-2 focus:ring-white/30"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/60">
            No videos match your filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => (
              <VideoCard key={v.id} v={v} onOpen={openVideo} />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <VideoModal open={open} onClose={() => setOpen(false)} video={active} />

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 pb-12 pt-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Alberto Dies — All rights reserved.
      </footer>
    </div>
  );
}
