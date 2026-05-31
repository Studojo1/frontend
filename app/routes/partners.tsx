import { Outlet } from "react-router";

/** Layout wrapper for /partners/* — child routes render inside this Outlet. */
export default function PartnersLayout() {
  return <Outlet />;
}
