// Tab id to component. Shared file: owned by the foundation.
import type { ComponentType } from "react";
import { ApprovalsTab } from "./mail/approvals-tab";
import { RepliesTab } from "./mail/replies-tab";
import { PageTab } from "./page/page-tab";
import { PrepTab } from "./page/prep-tab";
import { PeopleTab } from "./pipeline/people-tab";
import { TodayTab } from "./pipeline/today-tab";
import type { TabId } from "./types";

export const TAB_COMPONENTS: Record<TabId, ComponentType> = {
  today: TodayTab,
  people: PeopleTab,
  approvals: ApprovalsTab,
  replies: RepliesTab,
  page: PageTab,
  prep: PrepTab,
};
