import { useState, useEffect } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { Header, Footer } from "~/components";
import { FiDownload, FiCheck, FiCalendar, FiMessageSquare } from "react-icons/fi";
import type { Route } from "./+types/internships.$id";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Company Review Panel – Studojo" },
    {
      name: "description",
      content: "Review internship applications",
    },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { id } = params;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    throw new Response("Token required", { status: 401 });
  }

  const response = await fetch(
    `${new URL(request.url).origin}/api/company/internships/${id}?token=${token}`,
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Response("Invalid or expired token", { status: response.status });
    }
    throw new Response("Failed to load data", { status: 500 });
  }

  const data = await response.json();
  return { internship: data.internship, applications: data.applications, token };
}

interface Application {
  id: string;
  user_name: string;
  user_email: string;
  resume_name: string;
  resume_snapshot: any;
  status: string;
  created_at: string;
}

export default function CompanyReviewPanel({ data }: Route.ComponentProps) {
  const loaderData = useLoaderData() as {
    internship: any;
    applications: Application[];
    token: string;
  } | undefined;
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || loaderData?.token || "";

  const internship = loaderData?.internship;
  const applications = loaderData?.applications || [];

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!internship) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="mx-auto max-w-4xl">
          <p className="font-['Satoshi'] text-gray-600">Invalid token or internship not found</p>
        </div>
      </div>
    );
  }

  const handleAction = async (applicationId: string, action: string, notes?: string) => {
    setActionLoading(applicationId);
    try {
      const response = await fetch(`/api/company/applications/${applicationId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          notes,
          token,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to perform action");
      }

      // Reload page to show updated status
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Failed to perform action");
    } finally {
      setActionLoading(null);
    }
  };

  const downloadResume = (resumeSnapshot: any, resumeName: string) => {
    // Create a JSON blob and download it
    const blob = new Blob([JSON.stringify(resumeSnapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <header className="mb-8">
          <h1 className="mb-2 font-['Clash_Display'] text-4xl font-bold text-neutral-900">
            {internship.title}
          </h1>
          <p className="font-['Satoshi'] text-lg text-gray-600">
            {internship.company_name}
          </p>
        </header>

        <div className="mb-8 rounded-lg border-2 border-neutral-900 bg-violet-50 p-6">
          <h2 className="mb-4 font-['Clash_Display'] text-2xl font-bold text-neutral-900">
            Applications ({applications.length})
          </h2>

          {applications.length === 0 ? (
            <p className="font-['Satoshi'] text-gray-600">No applications to review.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-lg border-2 border-neutral-900 bg-white p-6"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 font-['Clash_Display'] text-xl font-bold text-neutral-900">
                        {app.user_name}
                      </h3>
                      <p className="font-['Satoshi'] text-gray-600">{app.user_email}</p>
                      <p className="mt-1 font-['Satoshi'] text-sm text-gray-500">
                        Applied: {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        app.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "interview_scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : app.status === "more_info_requested"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={() => downloadResume(app.resume_snapshot, app.resume_name)}
                      className="flex items-center gap-2 rounded-lg border-2 border-neutral-900 bg-white px-4 py-2 font-['Satoshi'] font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download Resume
                    </button>
                  </div>

                  <div className="border-t-2 border-neutral-900 pt-4">
                    <p className="mb-2 font-['Satoshi'] font-medium text-neutral-900">Actions:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAction(app.id, "accept")}
                        disabled={actionLoading === app.id || app.status === "accepted"}
                        className="flex items-center gap-2 rounded-lg border-2 border-neutral-900 bg-green-600 px-4 py-2 font-['Satoshi'] font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        <FiCheck className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          const date = prompt("Enter interview date and time:");
                          if (date) {
                            handleAction(app.id, "schedule_interview", date);
                          }
                        }}
                        disabled={actionLoading === app.id}
                        className="flex items-center gap-2 rounded-lg border-2 border-neutral-900 bg-blue-600 px-4 py-2 font-['Satoshi'] font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        <FiCalendar className="w-4 h-4" />
                        Schedule Interview
                      </button>
                      <button
                        onClick={() => {
                          const info = prompt("What information do you need?");
                          if (info) {
                            handleAction(app.id, "request_info", info);
                          }
                        }}
                        disabled={actionLoading === app.id}
                        className="flex items-center gap-2 rounded-lg border-2 border-neutral-900 bg-yellow-600 px-4 py-2 font-['Satoshi'] font-medium text-white transition-colors hover:bg-yellow-700 disabled:opacity-50"
                      >
                        <FiMessageSquare className="w-4 h-4" />
                        Request Info
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

