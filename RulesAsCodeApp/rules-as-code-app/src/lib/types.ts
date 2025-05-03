
// This file contains the type definitions for the application.


// src/lib/types.ts
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type Step = {
  phase: string;
  stepName: string;
  content: any; // Use JsonValue instead of unknown
  approved: boolean;
};