import React from "react";
import PreparationSegmentText from "./Preparation/SegmentText";
import PreparationNormalizeTerminology from "./Preparation/NormalizeTerminology";
// ... add more as needed

export const stepComponentMap: Record<string, React.FC<any>> = {
  PreparationSegmentText,
  PreparationNormalizeTerminology,
  // e.g., AnalysisExtractEntities: AnalysisExtractEntities,
};
