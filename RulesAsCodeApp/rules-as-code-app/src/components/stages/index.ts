import React from "react";
import SegmentText from "./Analysis/SegmentText";
import ExtractRules from "./Analysis/ExtractRules";
import DetectConflicts from "./Analysis/DetectConflicts";
import CreateDataModel from "./Modeling/CreateDataModel";
import GenerateBusinessRules from "./Modeling/GenerateBusinessRules";
import GenerateGoRules from "./Modeling/GenerateGoRules";
import DownloadFile from "./Testing/DownloadFile";

// The maps keys MUST match the "stepName" (whitespace removed) from store.ts/methodology
// 1. Segment Text
// 2. Extract Rules
// 3. Detect Conflicts
// 4. Data Model
// 5. Business Rules
// 6. GoRules Format
// 7. Download File

export const stepComponentMap: Record<string, React.FC<any>> = {
  SegmentText,
  ExtractRules,
  DetectConflicts,
  DataModel: CreateDataModel,
  BusinessRules: GenerateBusinessRules,
  GoRulesFormat: GenerateGoRules,
  DownloadFile,
};
