import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Header, Footer } from "~/components";
import { FiMapPin, FiClock, FiDollarSign, FiCalendar } from "react-icons/fi";
import type { Route } from "./+types/dojos.internships";

interface Internship {
  id: string;
  title: string;
  company_name: string;
  description: string;
  location: string;
  duration: string;
  stipend: string;
  application_deadline: string | null;
  slug: string;
  application_count: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Internship Dojo – Studojo" },
    {
      name: "description",
      content:
        "Discover internship opportunities. Apply with your saved resume and kickstart your career.",
    },
  ];
}

export default function InternshipsDojo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    loadInternships();
  }, [page, search]);

  const loadInternships = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        status: "published",
      });

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/internships?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load internships");
      }

      const data = await response.json();
      setInternships(data.internships || []);
      setTotalPages(data.totalPages || 1);
      setSearchParams({ page: page.toString(), ...(search && { search }) });
    } catch (error) {
      console.error("Error loading internships:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadInternships();
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "No deadline";
    const date = new Date(deadline);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <header className="mb-12 text-center">
          <h1 className="mb-4 font-['Clash_Display'] text-5xl font-bold text-neutral-900 md:text-6xl">
            Internship Dojo
          </h1>
          <p className="mx-auto max-w-2xl font-['Satoshi'] text-lg text-gray-600">
            Discover internship opportunities and apply with your saved resume
          </p>
        </header>

        <form onSubmit={handleSearch} className="mb-12">
          <div className="mx-auto flex max-w-md gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search internships..."
              className="flex-1 rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="submit"
              className="rounded-lg border-2 border-neutral-900 bg-violet-600 px-6 py-2 font-['Satoshi'] font-medium text-white transition-colors hover:bg-violet-700"
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="font-['Satoshi'] text-gray-600">Loading internships...</p>
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-['Satoshi'] text-gray-600">No internships found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {internships.map((internship) => (
                <Link
                  key={internship.id}
                  to={`/internships/${internship.slug}`}
                  className="group block rounded-lg border-2 border-neutral-900 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="mb-4">
                    <h3 className="mb-2 font-['Clash_Display'] text-xl font-bold text-neutral-900 group-hover:text-violet-600">
                      {internship.title}
                    </h3>
                    <p className="font-['Satoshi'] text-lg font-medium text-gray-700">
                      {internship.company_name}
                    </p>
                  </div>

                  <p className="mb-4 line-clamp-3 font-['Satoshi'] text-sm text-gray-600">
                    {internship.description}
                  </p>

                  <div className="space-y-2 border-t-2 border-neutral-900 pt-4">
                    <div className="flex items-center gap-2 font-['Satoshi'] text-sm text-gray-700">
                      <FiMapPin className="w-4 h-4" />
                      <span>{internship.location}</span>
                    </div>
                    <div className="flex items-center gap-2 font-['Satoshi'] text-sm text-gray-700">
                      <FiClock className="w-4 h-4" />
                      <span>{internship.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 font-['Satoshi'] text-sm text-gray-700">
                      <FiDollarSign className="w-4 h-4" />
                      <span>{internship.stipend}</span>
                    </div>
                    {internship.application_deadline && (
                      <div className="flex items-center gap-2 font-['Satoshi'] text-sm text-gray-700">
                        <FiCalendar className="w-4 h-4" />
                        <span>Deadline: {formatDeadline(internship.application_deadline)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-['Satoshi'] font-medium text-violet-700">
                      {internship.application_count} application{internship.application_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] font-medium text-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
                >
                  Previous
                </button>
                <span className="flex items-center px-4 font-['Satoshi'] text-neutral-900">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] font-medium text-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

