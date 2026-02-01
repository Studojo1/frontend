import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Header, Footer } from "~/components";
import { BlogCard } from "~/components/blog/blog-card";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  author_name: string;
  published_at: string;
  reading_time: number;
  view_count: number;
  categories?: string[];
}

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    loadPosts();
  }, [page, search]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/blog?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load posts");
      }

      const data = await response.json();
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
      setSearchParams({ page: page.toString(), ...(search && { search }) });
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <header className="mb-12 text-center">
          <h1 className="mb-4 font-['Clash_Display'] text-5xl font-bold text-neutral-900 md:text-6xl">
            Blog
          </h1>
          <p className="mx-auto max-w-2xl font-['Satoshi'] text-lg text-gray-600">
            Discover insights, tips, and stories to help you succeed in your career
          </p>
        </header>

        <form onSubmit={handleSearch} className="mb-12">
          <div className="mx-auto flex max-w-md gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
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
            <p className="font-['Satoshi'] text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-['Satoshi'] text-gray-600">No posts found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
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

