import React from "react";
import PreparationSegmentText from "./Preparation/SegmentText";
import PreparationNormalizeTerminology from "./Preparation/NormalizeTerminology";
import PreparationKeySections from "./Preparation/KeySections";
// ... add more as needed

export const stepComponentMap: Record<string, React.FC<any>> = {
  PreparationSegmentText,
  PreparationNormalizeTerminology,
  PreparationKeySections
  // e.g., AnalysisExtractEntities: AnalysisExtractEntities,
};
