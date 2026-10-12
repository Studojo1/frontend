// PageTab: the evidence-backed page that travels in follow-ups, and who
// opened it. Status and instant Unpublish first, then Senpai's headline
// proposal if one is waiting, the preview beside the claims, then
// visibility and opens. Group 4.
import { PageClaims } from "./page-claims";
import { PagePreview } from "./page-preview";
import { PageOpens, PageVisibility } from "./page-reach";
import { HeadlineDiff, StatusCard } from "./page-status";

export function PageTab() {
  return (
    <div className="@container space-y-6">
      <StatusCard />
      <HeadlineDiff />
      <div className="grid grid-cols-1 gap-6 @2xl:grid-cols-2 @2xl:items-start">
        <div className="min-w-0 @2xl:sticky @2xl:top-4">
          <PagePreview />
        </div>
        <PageClaims />
      </div>
      <div className="grid grid-cols-1 gap-6 @2xl:grid-cols-2 @2xl:items-start">
        <PageVisibility />
        <PageOpens />
      </div>
    </div>
  );
}
