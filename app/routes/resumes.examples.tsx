import { Header } from "~/components";
import { JobTypeExamples } from "~/components/resumes/job-type-examples";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { redirect } from "react-router";
import type { Route } from "./+types/resumes.examples";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Examples – Studojo" },
    {
      name: "description",
      content: "Browse example resumes by job type and template. Use them as starting points for your own resume.",
    },
  ];
}

export default function ResumeExamplesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-['Clash_Display'] text-3xl font-medium leading-tight tracking-tight text-neutral-950 md:text-4xl">
              Resume Examples
            </h1>
            <p className="mt-2 font-['Satoshi'] text-sm font-normal leading-6 text-gray-600">
              Browse example resumes by job type and template. Click "Use This Example" to create your own resume based on these examples.
            </p>
          </div>

          {/* Examples */}
          <JobTypeExamples showFilters={true} />
        </div>
      </main>
    </>
  );
}


