import React from "react";
import PreparationSegmentText from "./Preparation/SegmentText";
import PreparationNormalizeTerminology from "./Preparation/NormalizeTerminology";
import PreparationKeySections from "./Preparation/KeySections";
import PreparationInconsistencyScan from "./Preparation/InconsistencyScan";
import PreparationInconsistencyCategorisation from "./Preparation/InconsistencyCategorisation";
// ... add more as needed

export const stepComponentMap: Record<string, React.FC<any>> = {
  PreparationSegmentText,
  PreparationNormalizeTerminology,
  PreparationKeySections,
  PreparationInconsistencyScan,
  PreparationInconsistencyCategorisation,
  // e.g., AnalysisExtractEntities: AnalysisExtractEntities,
};
