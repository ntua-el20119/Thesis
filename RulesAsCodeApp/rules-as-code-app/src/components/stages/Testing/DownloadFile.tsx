"use client";

import { StepEditorProps } from "@/lib/types";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";
import { useEffect, useState } from "react";
import { useWizardStore } from "@/lib/store";

export default function DownloadFile({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  if (!step) return null;

  // Fetch data from Step 6 (Generate GoRules Format) - "2-6"
  const io = useStepDataLoader(step, "2-6");
  const { projectId } = io;
  // Access step 6 directly from store to get its approved output
  const steps = useWizardStore((s) => s.steps);
  const projectName = useWizardStore((s) => s.projectName);
  const step6 = steps["2-6"];

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Prepare the file content
  useEffect(() => {
    if (!step6) return;
    
    // Get efficient output from Step 6
    const content = step6.humanModified && step6.humanOutput 
      ? step6.humanOutput 
      : step6.llmOutput;
      
    // Unwrap if it's in a result object or text wrapper
    const validContent = content?.result ?? content?.text ?? content;
    const jsonString = typeof validContent === 'string' 
      ? validContent 
      : JSON.stringify(validContent, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [step6]);


  if (!step6 || !step6.approved) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-16 h-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Step Locked</h2>
        <p>Please complete and approve <strong>Step 6: GoRules Format</strong> to proceed to download.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-300">
      <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 text-emerald-400">
           <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
         </svg>
      </div>
      
      <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Project Ready</h2>
      <p className="text-slate-400 max-w-lg text-center text-lg mb-10 leading-relaxed">
        Your Rules-as-Code project has been successfully modeled. You can now download the final GoRules decision graph.
      </p>

      {downloadUrl && (
        <a
          href={downloadUrl}
          download={`gorules-${projectName || 'project'}.json`}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-emerald-600 font-lg rounded-full hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
        >
          <span className="mr-3 text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 9.75V15m0 0 3-3m-3 3-3-3m0-6h6a2.25 2.25 0 0 1 2.25 2.25v3" />
            </svg>
          </span>
          Download .json
        </a>
      )}
      
      <div className="mt-12 p-6 bg-slate-900/50 rounded-xl border border-slate-800 max-w-2xl w-full text-left">
          <h3 className="text-slate-300 font-semibold mb-2">Instructions</h3>
          <ol className="list-decimal list-inside text-slate-400 space-y-2 text-sm">
              <li>Click the button above to save the JSON file.</li>
              <li>Navigate to the <a href="https://gorules.io" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">GoRules Engine</a>.</li>
              <li>Import the file to visualize, test, and deploy your rules.</li>
          </ol>
      </div>
    </div>
  );
}
