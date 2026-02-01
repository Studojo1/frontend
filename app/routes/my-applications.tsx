import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { redirect, Link } from "react-router";
import { FiBriefcase, FiCalendar, FiCheckCircle, FiClock, FiXCircle, FiArrowRight } from "react-icons/fi";
import { Footer, Header } from "~/components";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import { toast } from "sonner";
import type { Route } from "./+types/my-applications";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  
  // Check if onboarding is complete (both phone and profile)
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (!onboardingStatus.complete) {
    throw redirect("/onboarding");
  }
  
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Applications – Studojo" },
    {
      name: "description",
      content: "Track your internship applications and their status.",
    },
  ];
}

interface Application {
  id: string;
  internshipId: string;
  status: string;
  createdAt: string;
  internship: {
    title: string;
    companyName: string;
    slug: string;
  };
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  pending: {
    label: "Pending",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: FiClock,
  },
  shortlisted: {
    label: "Shortlisted",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: FiCheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: FiXCircle,
  },
  forwarded: {
    label: "Forwarded",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: FiArrowRight,
  },
  accepted: {
    label: "Accepted",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: FiCheckCircle,
  },
  interview_scheduled: {
    label: "Interview Scheduled",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
    icon: FiCalendar,
  },
  more_info_requested: {
    label: "More Info Requested",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: FiClock,
  },
};

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/internships/applications");
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/auth";
          return;
        }
        throw new Error("Failed to load applications");
      }
      const data = await res.json();
      let filteredApplications = data.applications || [];
      
      if (statusFilter !== "all") {
        filteredApplications = filteredApplications.filter(
          (app: Application) => app.status === statusFilter
        );
      }
      
      setApplications(filteredApplications);
    } catch (error) {
      toast.error("Failed to load applications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="mb-2 font-['Clash_Display'] text-4xl font-bold text-neutral-900">
                My Applications
              </h1>
              <p className="font-['Satoshi'] text-gray-600">
                Track the status of your internship applications
              </p>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="font-['Satoshi'] text-sm font-medium text-gray-700">
                  Filter by status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] focus:outline-none focus:ring-2 focus:ring-violet-600"
                >
                  <option value="all">All Applications</option>
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="forwarded">Forwarded</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="more_info_requested">More Info Requested</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="font-['Satoshi'] text-gray-600">Loading applications...</div>
              </div>
            ) : applications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border-2 border-neutral-900 bg-violet-50 p-12 text-center"
              >
                <FiBriefcase className="mx-auto mb-4 h-16 w-16 text-violet-600" />
                <h2 className="mb-2 font-['Clash_Display'] text-2xl font-bold text-neutral-900">
                  {statusFilter === "all" ? "No Applications Yet" : "No Applications Found"}
                </h2>
                <p className="mb-6 font-['Satoshi'] text-gray-600">
                  {statusFilter === "all"
                    ? "You haven't applied to any internships yet. Start exploring opportunities!"
                    : `No applications with status "${getStatusConfig(statusFilter).label}"`}
                </p>
                {statusFilter === "all" && (
                  <Link
                    to="/dojos/internships"
                    className="inline-block rounded-lg border-2 border-neutral-900 bg-violet-600 px-6 py-3 font-['Satoshi'] font-medium text-white transition-colors hover:bg-violet-700"
                  >
                    Browse Internships
                  </Link>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const status = getStatusConfig(app.status);
                  const StatusIcon = status.icon;
                  
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border-2 border-neutral-900 bg-white p-6 transition-shadow hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="font-['Clash_Display'] text-xl font-bold text-neutral-900">
                              {app.internship.title}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.bgColor} ${status.color}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status.label}
                            </span>
                          </div>
                          <p className="mb-3 font-['Satoshi'] text-gray-600">
                            {app.internship.companyName}
                          </p>
                          <p className="font-['Satoshi'] text-sm text-gray-500">
                            Applied on {new Date(app.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <Link
                          to={`/internships/${app.internship.slug}`}
                          className="ml-4 flex items-center gap-2 rounded-lg border-2 border-neutral-900 bg-white px-4 py-2 font-['Satoshi'] text-sm font-medium text-neutral-900 transition-colors hover:bg-gray-50"
                        >
                          View Details
                          <FiArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

