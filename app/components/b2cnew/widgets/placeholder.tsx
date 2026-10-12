// A visible placeholder for tabs and sheets a group has not built yet.
// Shared file: owned by the foundation. Groups stop using it once built.
import type { ReactNode } from "react";
import { FiTool } from "react-icons/fi";
import { EmptyState } from "../ui";

export function Placeholder({ title, owner, children }: { title: string; owner: string; children?: ReactNode }) {
  return (
    <EmptyState
      icon={<FiTool />}
      title={title}
      body={
        <>
          Being built by {owner}. {children}
        </>
      }
    />
  );
}
