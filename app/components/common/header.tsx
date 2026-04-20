import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { SmoothLink } from "./smooth-link";

const NAV_LINKS = [
  { to: "/", label: "Home", active: true },
  { to: "/outreach", label: "Outreach" },
  { to: "#reviews", label: "Reviews" },
  { to: "/about", label: "About" },
] as const;

const RESOURCES_LINKS = [
  {
    to: "/blog",
    label: "Blog",
    desc: "Career tips, internship & job search guides, student insights",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
      </svg>
    ),
  },
  {
    to: "/reports",
    label: "Reports",
    desc: "Data-driven market analyses for students",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const USER_LINKS = [
  { to: "/profile", label: "My Profile" },
  { to: "/settings", label: "Settings" },
] as const;

export function Header() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { data: session, isPending } = authClient.useSession();

  // Listen for session update events and refetch session
  useEffect(() => {
    const handleSessionUpdate = async () => {
      // Refetch session when custom event is dispatched
      // This will update the session cache and trigger a re-render
      try {
        await authClient.getSession();
      } catch (err) {
        console.error("Error refreshing session in header:", err);
      }
    };

    window.addEventListener("session-updated", handleSessionUpdate);
    return () => {
      window.removeEventListener("session-updated", handleSessionUpdate);
    };
  }, []);

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate("/"),
      },
    });
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setResourcesOpen(false);
      }
    };

    if (userMenuOpen || resourcesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen, resourcesOpen]);

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-neutral-900 bg-white"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto flex h-16 max-w-[var(--section-max-width)] items-center justify-between px-4 pt-4 pb-px md:h-24 md:px-8 md:pt-0 md:pb-0">
        <Link
          to="/"
          className="font-['Satoshi'] text-2xl font-black leading-9 text-neutral-900 md:text-4xl md:leading-7"
        >
          studojo
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV_LINKS.filter((link) => {
            return !link.to.startsWith("#") || isHomePage;
          }).map((link) => {
            const LinkComponent = link.to.startsWith("#") ? SmoothLink : Link;
            return (
              <LinkComponent
                key={link.label}
                to={link.to}
                className={`font-['Satoshi'] text-base leading-6 ${
                  "active" in link && link.active
                    ? "font-black text-neutral-700"
                    : "font-normal text-neutral-700"
                }`}
              >
                {link.label}
              </LinkComponent>
            );
          })}

          {/* Resources dropdown */}
          <div className="relative" ref={resourcesRef}>
            <button
              type="button"
              onClick={() => setResourcesOpen((o) => !o)}
              className="flex items-center gap-1 font-['Satoshi'] text-base font-normal leading-6 text-neutral-700 hover:text-neutral-900"
            >
              Resources
              <svg
                className={`h-4 w-4 transition-transform ${resourcesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {resourcesOpen && (
              <div className="absolute left-0 top-full mt-3 w-72 rounded-2xl border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] z-50">
                <div className="p-2">
                  {RESOURCES_LINKS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setResourcesOpen(false)}
                      className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-neutral-50 group"
                    >
                      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-neutral-900 bg-violet-500 text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-['Satoshi'] text-sm font-semibold text-neutral-900">{item.label}</div>
                        <div className="font-['Satoshi'] text-xs text-neutral-500 leading-snug mt-0.5">{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-4">
          {!isPending &&
            (session ? (
              <>
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2"
                    aria-label="Open profile menu"
                  >
                    <div className="h-9 w-9 rounded-full bg-violet-500 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] flex items-center justify-center">
                      <span className="font-['Clash_Display'] text-sm font-bold text-white select-none">
                        {(session.user.name ?? session.user.email ?? "?")
                          .split(" ")
                          .map((w: string) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                    <svg
                      className={`h-4 w-4 text-neutral-700 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border-2 border-neutral-900 bg-white shadow-lg z-50">
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 font-['Satoshi'] text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/my-applications"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 font-['Satoshi'] text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>My Applications</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 font-['Satoshi'] text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>My Orders</span>
                        </Link>
                        <div className="my-1 border-t border-neutral-200"></div>
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 font-['Satoshi'] text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Settings</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleSignOut();
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 font-['Satoshi'] text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  to="/profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] sm:hidden"
                  aria-label="My Profile"
                >
                  <span className="font-['Clash_Display'] text-xs font-bold text-white select-none">
                    {(session.user.name ?? session.user.email ?? "?")
                      .split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth?mode=signin"
                  className="hidden font-['Satoshi'] text-base font-medium leading-6 text-neutral-700 sm:block"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className={`flex h-12 items-center justify-center rounded-2xl bg-neutral-900 font-['Satoshi'] text-sm font-medium leading-6 text-white transition-transform hover:translate-x-[2px] hover:translate-y-[2px] px-4 max-w-[120px] flex-shrink-0 md:w-32 md:text-base md:max-w-none ${
                    isHomePage ? "hidden md:flex" : ""
                  }`}
                >
                  Get Started
                </Link>
              </>
            ))}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-900 hover:bg-neutral-100 md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-neutral-200 bg-white px-8 py-4 md:hidden"
          aria-label="Mobile menu"
        >
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.filter((link) => {
              return !link.to.startsWith("#") || isHomePage;
            }).map(({ to, label }) => {
              const LinkComponent = to.startsWith("#") ? SmoothLink : Link;
              return (
                <li key={label}>
                  <LinkComponent
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg py-2 font-['Satoshi'] text-neutral-700 hover:bg-neutral-50"
                  >
                    {label}
                  </LinkComponent>
                </li>
              );
            })}
            <li>
              <Link
                to="/blog"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg py-2 font-['Satoshi'] text-neutral-700 hover:bg-neutral-50"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/reports"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg py-2 font-['Satoshi'] text-neutral-700 hover:bg-neutral-50"
              >
                Reports
              </Link>
            </li>
            {!isPending &&
              (session ? (
                <>
                  <li>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg py-2 font-['Satoshi'] text-neutral-700 hover:bg-neutral-50"
                    >
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/my-applications"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg py-2 font-['Satoshi'] text-neutral-700 hover:bg-neutral-50"
                    >
                      My Applications
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/assignments"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg py-2 font-['Satoshi'] text-neutral-700 hover:bg-neutral-50"
                    >
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg py-2 font-['Satoshi'] text-neutral-700 hover:bg-neutral-50"
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full rounded-lg py-2 text-left font-['Satoshi'] text-neutral-700 hover:bg-neutral-50"
                    >
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/auth?mode=signin"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg py-2 font-['Satoshi'] text-neutral-700 hover:bg-neutral-50"
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/auth?mode=signup"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg py-2 font-['Satoshi'] text-neutral-700 hover:bg-neutral-50"
                    >
                      Get Started
                    </Link>
                  </li>
                </>
              ))}
          </ul>
        </nav>
      )}
    </motion.header>
  );
}
