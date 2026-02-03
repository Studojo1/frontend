import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FiArrowLeft, FiBriefcase, FiMapPin, FiClock } from "react-icons/fi";
import { FiX } from "react-icons/fi";

interface Internship {
  id: string;
  title: string;
  company_name: string;
  location: string;
  duration: string;
  stipend: string;
  slug: string;
}

interface InternshipReturnCardProps {
  returnTo: string;
  onDismiss?: () => void;
}

export function InternshipReturnCard({ returnTo, onDismiss }: InternshipReturnCardProps) {
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract slug from returnTo URL (format: /internships/{slug})
    const match = returnTo.match(/\/internships\/([^/?]+)/);
    if (!match) {
      setLoading(false);
      return;
    }

    const slug = match[1];
    
    // Fetch internship details
    const fetchInternship = async () => {
      try {
        const response = await fetch(`/api/internships/${slug}`);
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const data = await response.json();
        setInternship(data.internship);
      } catch (error) {
        console.error("Failed to fetch internship:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, [returnTo]);

  if (loading) {
    return (
      <div className="mb-6 rounded-2xl border-2 border-violet-500 bg-violet-50 p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"></div>
          <p className="font-['Satoshi'] text-sm text-violet-700">Loading internship details...</p>
        </div>
      </div>
    );
  }

  if (!internship) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border-2 border-violet-500 bg-violet-50 p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 border-violet-500 bg-white">
              <FiBriefcase className="h-4 w-4 text-violet-600" />
            </div>
            <h3 className="font-['Clash_Display'] text-lg font-medium text-violet-900">
              Return to Application
            </h3>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-['Clash_Display'] text-base font-semibold text-violet-950">
              {internship.title}
            </h4>
            <p className="font-['Satoshi'] text-sm font-medium text-violet-700">
              {internship.company_name}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-['Satoshi'] text-violet-600">
              <span className="flex items-center gap-1">
                <FiMapPin className="h-3 w-3" />
                {internship.location}
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="h-3 w-3" />
                {internship.duration}
              </span>
              {internship.stipend && (
                <span className="flex items-center gap-1">
                  <span>₹</span>
                  {internship.stipend}
                </span>
              )}
            </div>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded-lg p-1.5 text-violet-400 hover:bg-violet-100 hover:text-violet-600 transition-colors"
            title="Dismiss"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4">
        <Link
          to={returnTo}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-violet-500 bg-violet-600 px-6 py-2.5 font-['Satoshi'] text-sm font-medium leading-5 text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
        >
          <FiArrowLeft className="h-4 w-4" />
          Continue Application
        </Link>
      </div>
    </div>
  );
}

