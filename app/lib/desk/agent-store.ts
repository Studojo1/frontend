// Contract seam (section 10): the agent store. The implementation lives with
// the panel in app/components/desk/agent; this file is the stable import path
// for the shell and the workspace screens.
export { askAbout, askAgent, attachToAgent, detachFromAgent, useAgent } from "~/components/desk/agent/use-agent";
export type { AgentHandle, SelectedItem } from "~/components/desk/agent/use-agent";
