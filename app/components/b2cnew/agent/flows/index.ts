// FLOWS: every scripted flow Group 1 registers (F2 to F14 and the day
// events). The engine (core/engine.ts) runs these plus the foundation's F1
// (core/flows-core.ts, the reference). Owned by Group 1.
//
// Rule: files in agent/flows/ import only from core/flow-types, core/derive,
// core/seed, config, data and types (and each other). Never from core/engine
// or core/store (that would make an import cycle).
import type { FlowSpec } from "../../core/flow-types";
import { F11, F12 } from "./f-coach";
import { F7, F8, F9 } from "./f-edits";
import { F2, F3, F4 } from "./f-mail";
import { F13, F14 } from "./f-mission";
import { F10, F5, F6 } from "./f-people";
import { EVENTS } from "./events";
import { FCANT } from "./f-cant";

export const FLOWS: FlowSpec[] = [F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12, F13, F14, FCANT, ...EVENTS];
