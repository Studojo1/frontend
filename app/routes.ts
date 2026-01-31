import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth", "routes/auth.tsx"),
  route("auth/2fa", "routes/auth.2fa.tsx"),
  route("api/auth/*", "routes/api.auth.$.tsx"),
  route("api/onboarding/status", "routes/api.onboarding.status.tsx"),
  route("api/onboarding", "routes/api.onboarding.tsx"),
  route("api/resumes/parse", "routes/api.resumes.parse.tsx"),
  route("api/resumes/:id", "routes/api.resumes.$id.tsx"),
  route("api/resumes", "routes/api.resumes.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
  route("settings", "routes/settings.tsx"),
  route("resumes", "routes/resumes.tsx"),
  route("assignments", "routes/assignments.tsx"),
  route("dojos/assignment", "routes/dojos.assignment.tsx"),
  route("dojos/careers", "routes/dojos.careers.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("terms", "routes/terms.tsx"),
  route("refund-policy", "routes/refund-policy.tsx"),
  route(".well-known/*", "routes/well-known.$.tsx"),
] satisfies RouteConfig;
