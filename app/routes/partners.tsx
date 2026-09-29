import { Outlet } from "react-router";

/** Layout wrapper for /partners/*. Child routes render inside this Outlet. */
export default function PartnersLayout() {
  return <Outlet />;
}
