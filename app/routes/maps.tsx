import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router";
import { FiMapPin, FiFilter, FiX, FiBriefcase, FiExternalLink, FiSearch } from "react-icons/fi";

// Lazy-load maplibre so it's never imported server-side
let maplibre: typeof import("maplibre-gl") | null = null;

interface Internship {
  id: string;
  title: string;
  location: string;
  stipend: string;
  duration: string;
  slug: string;
  deadline: string | null;
}

interface Company {
  id: string;
  name: string;
  market: string;
  lat: number;
  lng: number;
  logo_url: string | null;
  niche_score: number;
  website: string | null;
  internship_count: number;
  internships: Internship[];
}

interface MapStats {
  total_companies: number;
  total_internships: number;
  markets: Record<string, number>;
}

const MARKETS = [
  { value: "all", label: "All Markets", flag: "🌍" },
  { value: "India", label: "India", flag: "🇮🇳" },
  { value: "US", label: "United States", flag: "🇺🇸" },
  { value: "UK", label: "United Kingdom", flag: "🇬🇧" },
  { value: "UAE", label: "UAE", flag: "🇦🇪" },
  { value: "Singapore", label: "Singapore", flag: "🇸🇬" },
];


const NICHE_COLORS: Record<number, string> = {
  5: "#22c55e",
  4: "#86efac",
  3: "#fbbf24",
  2: "#94a3b8",
  1: "#cbd5e1",
};

function getNicheColor(score: number): string {
  return NICHE_COLORS[score] || NICHE_COLORS[3];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}


function CompanyAvatar({ name, logoUrl, size = 36 }: { name: string; logoUrl: string | null; size?: number }) {
  const [imgError, setImgError] = useState(false);
  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0 font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {getInitials(name)}
    </div>
  );
}

export function links() {
  return [
    { rel: "stylesheet", href: "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" },
  ];
}

export function meta() {
  return [
    { title: "Internship Map – Studojo" },
    { name: "description", content: "Find internships globally on an interactive map. India, US, UK, UAE, Singapore — browse by location." },
  ];
}

export default function MapsPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const popupRef = useRef<any>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<MapStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [market, setMarket] = useState("all");
  const [search, setSearch] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load data
  useEffect(() => {
    loadData();
  }, [market]);

  async function loadData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (market !== "all") params.set("market", market);
      const res = await fetch(`/api/maps?${params}`);
      const data = await res.json();
      setCompanies(data.companies || []);
      setStats(data.stats || null);
    } finally {
      setLoading(false);
    }
  }

  // Initialise MapLibre
  useEffect(() => {
    let cancelled = false;
    async function initMap() {
      if (!mapContainerRef.current || mapRef.current) return;
      const ml = await import("maplibre-gl");
      if (cancelled) return;
      maplibre = ml;

      const map = new ml.Map({
        container: mapContainerRef.current,
        // CARTO Positron – free, no API key
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [20, 20],
        zoom: 2,
        minZoom: 1,
        maxZoom: 16,
        attributionControl: false,
      });

      map.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");
      map.addControl(
        new ml.AttributionControl({ compact: true }),
        "bottom-left"
      );

      map.on("load", () => {
        if (!cancelled) setMapReady(true);
      });

      mapRef.current = map;
    }

    initMap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-render markers whenever companies or map state changes
  const renderMarkers = useCallback(() => {
    if (!mapRef.current || !maplibre || !mapReady) return;
    const ml = maplibre;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }

    const filtered = companies.filter((co) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        co.name.toLowerCase().includes(q) ||
        co.city?.toLowerCase().includes(q) ||
        co.internships?.some((i) => i.title.toLowerCase().includes(q))
      );
    });

    filtered.forEach((company) => {
      if (!company.lat || !company.lng) return;
      const count = company.internship_count || 0;
      const color = getNicheColor(company.niche_score || 3);

      // Build marker element
      const el = document.createElement("div");
      el.className = "map-marker";
      el.style.cssText = `
        width: ${count > 3 ? 48 : 38}px;
        height: ${count > 3 ? 48 : 38}px;
        border-radius: 50%;
        border: 2.5px solid ${color};
        background: #1e1e2e;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: ${color};
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        box-shadow: 0 0 0 0 ${color}55;
        position: relative;
        overflow: visible;
      `;

      // Count badge
      if (count > 1) {
        const badge = document.createElement("div");
        badge.style.cssText = `
          position: absolute;
          top: -5px;
          right: -5px;
          background: ${color};
          color: #0a0a14;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 5px;
          min-width: 16px;
          text-align: center;
          line-height: 14px;
        `;
        badge.textContent = `${count}`;
        el.appendChild(badge);
      }

      // Avatar inside pin
      const avatar = document.createElement("div");
      avatar.style.cssText = `
        width: 24px; height: 24px;
        border-radius: 50%;
        background: linear-gradient(135deg, #7c3aed, #4f46e5);
        display: flex; align-items: center; justify-content: center;
        font-size: 8px; font-weight: 700; color: white;
        overflow: hidden;
      `;
      avatar.textContent = getInitials(company.name);
      el.appendChild(avatar);

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.2)";
        el.style.boxShadow = `0 0 0 6px ${color}33`;
        el.style.zIndex = "9999";
        setHoveredCompany(company.id);
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.boxShadow = "none";
        el.style.zIndex = "1";
        setHoveredCompany(null);
      });
      el.addEventListener("click", () => {
        setSelectedCompany(company);
        setSidebarOpen(true);
        // Fly to marker
        mapRef.current?.flyTo({ center: [company.lng, company.lat], zoom: Math.max(mapRef.current.getZoom(), 8), speed: 1.4 });
      });

      const marker = new ml.Marker({ element: el })
        .setLngLat([company.lng, company.lat])
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [companies, mapReady, search]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // Fly to market on filter change
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const marketCenters: Record<string, { center: [number, number]; zoom: number }> = {
      India: { center: [78.9629, 20.5937], zoom: 4 },
      US: { center: [-98.5, 39.5], zoom: 3 },
      UK: { center: [-1.5, 52.5], zoom: 5 },
      UAE: { center: [54.0, 24.5], zoom: 6 },
      Singapore: { center: [103.82, 1.35], zoom: 10 },
    };
    if (market !== "all" && marketCenters[market]) {
      mapRef.current.flyTo({ ...marketCenters[market], speed: 1.2 });
    } else {
      mapRef.current.flyTo({ center: [20, 20], zoom: 2, speed: 1 });
    }
  }, [market, mapReady]);

  const filteredCompanies = companies.filter((co) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      co.name.toLowerCase().includes(q) ||
      co.city?.toLowerCase().includes(q) ||
      co.internships?.some((i) => i.title.toLowerCase().includes(q))
    );
  });

  const totalVisible = filteredCompanies.reduce(
    (sum, co) => sum + (co.internship_count || 0),
    0
  );

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a14] overflow-hidden">
      {/* Top nav */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 z-20 bg-[#0a0a14]/95 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-white/70 hover:text-white transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-white font-semibold text-base tracking-tight">studojo</span>
            <span className="text-white/30 text-sm">/</span>
            <span className="text-white/60 text-sm">maps</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {stats && (
            <div className="hidden sm:flex items-center gap-3 text-xs text-white/50 mr-2">
              <span><span className="text-white font-medium">{stats.total_companies}</span> companies</span>
              <span><span className="text-white font-medium">{stats.total_internships}</span> internships</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all"
          >
            <FiFilter size={16} />
          </button>
          <Link
            to="/dojos/internships"
            className="hidden sm:flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Browse all <FiExternalLink size={12} />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Map */}
        <div ref={mapContainerRef} className="flex-1 h-full relative" />

        {/* Loading overlay */}
        {!mapReady && (
          <div className="absolute inset-0 bg-[#0a0a14] flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-white/40 text-sm">Loading map…</span>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <aside
          className={`absolute right-0 top-0 h-full z-10 flex flex-col bg-[#0e0e1a]/95 backdrop-blur border-l border-white/10 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "w-80 sm:w-96" : "w-0 overflow-hidden"
          }`}
        >
          <div className="flex flex-col h-full min-w-80 sm:min-w-96">
            {/* Filters */}
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              {/* Search */}
              <div className="relative mb-3">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search companies, roles, cities…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/25 pl-9 pr-4 py-2 outline-none focus:border-violet-500 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                    <FiX size={13} />
                  </button>
                )}
              </div>

              {/* Market filter */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {MARKETS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMarket(m.value)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                      market === m.value
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {m.flag} {m.value === "all" ? "All" : m.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Results count */}
            <div className="px-4 py-2 border-b border-white/5 flex-shrink-0">
              <p className="text-xs text-white/40">
                {loading ? "Loading…" : `${filteredCompanies.length} companies · ${totalVisible} open roles`}
              </p>
            </div>

            {/* Selected company detail */}
            {selectedCompany && (
              <div className="mx-3 my-2 bg-white/5 border border-violet-500/30 rounded-xl p-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <CompanyAvatar name={selectedCompany.name} logoUrl={selectedCompany.logo_url} size={32} />
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">{selectedCompany.name}</p>
                      <p className="text-xs text-white/40">
                        {selectedCompany.city}{selectedCompany.city && selectedCompany.country ? ", " : ""}{selectedCompany.country}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCompany(null)} className="text-white/30 hover:text-white mt-0.5">
                    <FiX size={14} />
                  </button>
                </div>
                {selectedCompany.stage && (
                  <span className="text-xs text-violet-300 bg-violet-900/30 border border-violet-800/40 px-2 py-0.5 rounded-full mr-1">{selectedCompany.stage}</span>
                )}
                {selectedCompany.sector && (
                  <span className="text-xs text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{selectedCompany.sector}</span>
                )}
                {selectedCompany.internships?.slice(0, 3).map((intern) => (
                  <Link key={intern.id} to={`/internships/${intern.slug}`} className="flex items-center justify-between gap-2 mt-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{intern.title}</p>
                      <p className="text-xs text-white/40 mt-0.5 truncate">{intern.stipend || intern.location}</p>
                    </div>
                    <FiExternalLink size={11} className="text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}

            {/* Company list */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center px-6">
                  <FiMapPin size={22} className="text-white/20 mb-2" />
                  <p className="text-sm text-white/40">No internships match your filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => {
                        setSelectedCompany(company);
                        if (company.lat && company.lng) {
                          mapRef.current?.flyTo({ center: [company.lng, company.lat], zoom: Math.max(mapRef.current?.getZoom() || 2, 8), speed: 1.4 });
                        }
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-3 ${
                        selectedCompany?.id === company.id ? "bg-violet-900/20" : ""
                      } ${hoveredCompany === company.id ? "bg-white/5" : ""}`}
                    >
                      <CompanyAvatar name={company.name} logoUrl={company.logo_url} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-medium text-white truncate">{company.name}</p>
                          <span
                            className="text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${getNicheColor(company.niche_score)}22`, color: getNicheColor(company.niche_score) }}
                          >
                            {company.internship_count} role{company.internship_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                          <FiMapPin size={10} />
                          {company.city || company.country || company.market || "—"}
                        </p>
                        {company.internships?.[0] && (
                          <p className="text-xs text-white/30 truncate mt-0.5">{company.internships[0].title}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="p-3 border-t border-white/10 flex-shrink-0">
              <Link
                to="/dojos/internships"
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                <FiBriefcase size={14} />
                Browse all internships
              </Link>
              <p className="text-center text-xs text-white/25 mt-2">
                Work on things that matter · studojo.com
              </p>
            </div>
          </div>
        </aside>

        {/* Legend (bottom-left, above attribution) */}
        {mapReady && (
          <div className="absolute bottom-8 left-4 z-10 bg-[#0e0e1a]/90 backdrop-blur border border-white/10 rounded-xl px-3 py-2 hidden sm:block">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 font-semibold">Niche score</p>
            <div className="flex flex-col gap-1">
              {[
                { score: 5, label: "Very niche" },
                { score: 4, label: "Niche" },
                { score: 3, label: "Solid" },
                { score: 2, label: "Standard" },
                { score: 1, label: "Generic" },
              ].map(({ score, label }) => (
                <div key={score} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: getNicheColor(score) }} />
                  <span className="text-xs text-white/50">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar toggle button (when closed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute right-4 top-4 z-10 bg-[#0e0e1a] border border-white/10 text-white/60 hover:text-white p-2 rounded-xl shadow-lg transition-all hover:border-violet-500"
          >
            <FiFilter size={16} />
          </button>
        )}
      </div>

      {/* MapLibre GL CSS */}
      <style>{`
        .maplibregl-canvas { outline: none; }
        .maplibregl-ctrl-bottom-right { bottom: 12px !important; right: 12px !important; }
        .maplibregl-ctrl-group { background: #1a1a2e !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; }
        .maplibregl-ctrl-group button { background: transparent !important; border: none !important; }
        .maplibregl-ctrl-group button:hover { background: rgba(255,255,255,0.08) !important; }
        .maplibregl-ctrl-zoom-in .maplibregl-ctrl-icon,
        .maplibregl-ctrl-zoom-out .maplibregl-ctrl-icon { filter: invert(1) opacity(0.6); }
        .maplibregl-ctrl-attrib { background: rgba(10,10,20,0.8) !important; color: rgba(255,255,255,0.3) !important; font-size: 10px !important; border-radius: 6px !important; }
        .maplibregl-ctrl-attrib a { color: rgba(139,92,246,0.7) !important; }
        .map-marker { z-index: 1; }
      `}</style>
    </div>
  );
}
