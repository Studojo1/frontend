// Redirect legacy /outreach/campaign/templates → /outreach/campaign/compose
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function TemplatesRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/outreach/campaign/compose", { replace: true });
  }, []);
  return null;
}
