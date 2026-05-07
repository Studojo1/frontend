import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { Header, Footer } from "~/components";
import { FiMapPin, FiClock, FiCalendar, FiArrowLeft, FiMail, FiFileText, FiSearch } from "react-icons/fi";
import { authClient } from "~/lib/auth-client";
import type { Route } from "./+types/internships.$slug";
import { ApplicationFlow } from "~/components/internship/application-flow";

interface Internship {
  id: string;
  title: string;
  company_name: string;
  description: string;
  requirements: string;
  location: string;
  duration: string;
  stipend: string;
  application_deadline: string | null;
  slug: string;
  view_count: number;
  application_count: number;
  hasApplied?: boolean;
  applicationId?: string;
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.internship) {
    return [{ title: "Internship Not Found | Studojo" }];
  }

  const internship = data.internship;
  return [
    {
      title: `${internship.title} at ${internship.company_name} | Studojo`,
    },
    {
      name: "description",
      content: internship.description.substring(0, 160),
    },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const { slug } = params;
    const response = await fetch(
      `${new URL(request.url).origin}/api/internships/${slug}`,
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Response("Internship not found", { status: 404 });
      }
      throw new Response("Failed to load internship", { status: 500 });
    }

    const data = await response.json();
    return { internship: data.internship };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error(`[internships.$slug] Loader error:`, error);
    throw new Response("Internal server error", { status: 500 });
  }
}

export default function InternshipDetail({ data }: Route.ComponentProps) {
  const loaderData = useLoaderData() as { internship: Internship } | undefined;
  const internship = (loaderData?.internship || data?.internship) as Internship | undefined;
  const navigate = useNavigate();
  const [showApplicationFlow, setShowApplicationFlow] = useState(false);
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  if (!internship) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="mx-auto max-w-4xl">
          <p className="font-['Satoshi'] text-gray-600">Internship not found</p>
        </div>
      </div>
    );
  }

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      navigate(`/auth?redirect=${encodeURIComponent(`/internships/${internship.slug}`)}`);
      return;
    }
    if (internship.hasApplied) {
      return; // Don't open application flow if already applied
    }
    setShowApplicationFlow(true);
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isDeadlinePassed = internship.application_deadline
    ? new Date(internship.application_deadline) < new Date()
    : false;
  
  const hasApplied = internship.hasApplied || false;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <article className="mx-auto max-w-4xl px-4 py-12 md:px-8">
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={() => navigate("/dojos/internships")}
              className="flex items-center gap-2 rounded-lg border-2 border-neutral-900 bg-white px-4 py-2 font-['Satoshi'] text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Internships
            </button>
            <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-['Satoshi'] font-medium text-violet-700">
              {internship.company_name}
            </span>
          </div>

          <h1 className="mb-6 font-['Clash_Display'] text-4xl font-bold text-neutral-900 md:text-5xl leading-tight">
            {internship.title}
          </h1>

          <div className="mb-6 flex flex-wrap items-center gap-6 text-sm font-['Satoshi'] text-gray-500">
            <span className="flex items-center gap-2">
              <FiMapPin className="w-4 h-4" />
              {internship.location}
            </span>
            <span className="flex items-center gap-2">
              <FiClock className="w-4 h-4" />
              {internship.duration}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-lg">₹</span>
              {internship.stipend}
            </span>
            {formatDeadline(internship.application_deadline) && (
              <span className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                Deadline: {formatDeadline(internship.application_deadline)}
              </span>
            )}
          </div>
        </header>

        <div className="mb-8 rounded-lg border-2 border-neutral-900 bg-violet-50 p-6">
          <div className="mb-4">
            <h2 className="mb-2 font-['Clash_Display'] text-2xl font-bold text-neutral-900">
              About the Role
            </h2>
            <div
              className="font-['Satoshi'] text-gray-700 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: internship.description }}
            />
          </div>

          <div>
            <h2 className="mb-2 font-['Clash_Display'] text-2xl font-bold text-neutral-900">
              Requirements
            </h2>
            <div
              className="font-['Satoshi'] text-gray-700 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: internship.requirements }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {hasApplied ? (
            <div className="flex-1 rounded-lg border-2 border-neutral-900 bg-green-50 px-6 py-3 text-center">
              <p className="font-['Satoshi'] font-bold text-green-700">
                Already Applied
              </p>
              <p className="mt-1 text-sm font-['Satoshi'] text-green-600">
                Your application has been submitted successfully
              </p>
            </div>
          ) : (
            <button
              onClick={handleApplyClick}
              disabled={isDeadlinePassed}
              className="flex-1 rounded-lg border-2 border-neutral-900 bg-violet-600 px-6 py-3 font-['Satoshi'] font-bold text-white transition-colors hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeadlinePassed ? "Application Deadline Passed" : "Apply Now"}
            </button>
          )}
        </div>

        {/* Outreach CTAs */}
        <div className="mt-8 space-y-4">
          {/* Primary CTA — cold email, full width, high contrast */}
          <a
            href={`/outreach?company=${encodeURIComponent(internship.company_name)}&role=${encodeURIComponent(internship.title)}`}
            className="flex w-full items-center justify-between rounded-lg border-2 border-neutral-900 bg-violet-600 px-6 py-5 text-white transition-colors hover:bg-violet-700"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <FiMail className="h-5 w-5" />
              </div>
              <div>
                <div className="font-['Clash_Display'] text-lg font-bold leading-tight">
                  Email the hiring team directly
                </div>
                <div className="font-['Satoshi'] text-sm opacity-85">
                  Most applicants only fill the form. One cold email puts you in a different pile.
                </div>
              </div>
            </div>
            <div className="ml-4 shrink-0 rounded-md border-2 border-white/40 bg-white/10 px-4 py-2 font-['Satoshi'] text-sm font-bold whitespace-nowrap">
              Write it free →
            </div>
          </a>

          {/* Secondary CTAs — side by side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href="/dojos/careers"
              className="flex items-center gap-4 rounded-lg border-2 border-neutral-900 bg-amber-50 px-5 py-4 transition-colors hover:bg-amber-100"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-amber-400">
                <FiFileText className="h-5 w-5 text-neutral-900" />
              </div>
              <div>
                <div className="font-['Clash_Display'] text-base font-bold text-neutral-900 leading-tight">
                  Your resume won't clear the ATS
                </div>
                <div className="font-['Satoshi'] text-xs text-gray-600">
                  Fix it in 5 minutes. Free, no sign-up needed.
                </div>
              </div>
            </a>

            <a
              href={`/dojos/internships`}
              className="flex items-center gap-4 rounded-lg border-2 border-neutral-900 bg-neutral-50 px-5 py-4 transition-colors hover:bg-neutral-100"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-white">
                <FiSearch className="h-5 w-5 text-neutral-900" />
              </div>
              <div>
                <div className="font-['Clash_Display'] text-base font-bold text-neutral-900 leading-tight">
                  Don't put all your eggs in one role
                </div>
                <div className="font-['Satoshi'] text-xs text-gray-600">
                  Browse 29 more internships worth applying to.
                </div>
              </div>
            </a>
          </div>
        </div>

        {showApplicationFlow && !hasApplied && (
          <ApplicationFlow
            internshipId={internship.id}
            internshipSlug={internship.slug}
            onClose={() => setShowApplicationFlow(false)}
            onSuccess={() => {
              setShowApplicationFlow(false);
              // Show success message or redirect
              navigate(`/internships/${internship.slug}?applied=true`);
            }}
          />
        )}
      </article>
      <Footer />
    </div>
  );
}

