// Step registry for /jernew: StepId -> component. Shared file: owned by the
// foundation. Builders edit only their own step files, never this map.
import type { ComponentType } from "react";
import type { StepId } from "../types";
import { Intro } from "./Intro";
import { Upload } from "./Upload";
import { Quiz } from "./Quiz";
import { Profile } from "./Profile";
import { Visibility } from "./Visibility";
import { Matches } from "./Matches";
import { Email } from "./Email";
import { Pack } from "./Pack";
import { Connect } from "./Connect";
import { Launch } from "./Launch";
import { Mission } from "./Mission";

export const STEP_COMPONENTS: Record<StepId, ComponentType> = {
  intro: Intro,
  upload: Upload,
  quiz: Quiz,
  profile: Profile,
  visibility: Visibility,
  matches: Matches,
  email: Email,
  pack: Pack,
  connect: Connect,
  launch: Launch,
  mission: Mission,
};
