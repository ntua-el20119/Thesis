"use client";

import { StepEditorProps } from "@/lib/types";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";
import { useEffect, useState } from "react";
import { useWizardStore } from "@/store/wizardStore";

// Small helper — resolves the effective content of a step
function effectiveContent(step: any) {
  if (!step) return null;
  return step.humanModified && step.humanOutput ? step.humanOutput : step.llmOutput;
}

export default function DownloadFile({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  if (!step) return null;

  const io = useStepDataLoader(step, "2-6");
  const { projectId } = io;

  const steps = useWizardStore((s) => s.steps);
  const projectName = useWizardStore((s) => s.projectName);

  const step5 = steps["2-5"]; // Business Rules
  const step6 = steps["2-6"]; // GoRules Format

  // ---------- Download URLs ----------
  const [goRulesUrl, setGoRulesUrl]           = useState<string | null>(null);
  const [businessRulesUrl, setBusinessRulesUrl] = useState<string | null>(null);
  const [testsUrl, setTestsUrl]               = useState<string | null>(null);

  // GoRules (Step 6)
  useEffect(() => {
    if (!step6) return;
    const content = effectiveContent(step6);
    const raw = content?.result ?? content?.text ?? content;
    const str = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
    const blob = new Blob([str], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    setGoRulesUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [step6]);

  // Business Rules — always from llmOutput.result (humanOutput is plain text only)
  useEffect(() => {
    if (!step5) return;
    const rules = step5.llmOutput?.result?.businessRules ?? step5.llmOutput?.businessRules;
    if (!rules) return;
    const str  = typeof rules === "string" ? rules : JSON.stringify(rules, null, 2);
    const blob = new Blob([str], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    setBusinessRulesUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [step5]);

  // Tests — always from llmOutput.result (same reason)
  useEffect(() => {
    if (!step5) return;
    const tests = step5.llmOutput?.result?.testScenarios ?? step5.llmOutput?.testScenarios;
    if (!tests) return;
    const str  = typeof tests === "string" ? tests : JSON.stringify(tests, null, 2);
    const blob = new Blob([str], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    setTestsUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [step5]);

  // ---------- Guard ----------
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

  const slug = projectName || "project";

  // ---------- Download card definition ----------
  const downloads = [
    {
      key: "gorules",
      url: goRulesUrl,
      filename: `gorules-${slug}.json`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
        </svg>
      ),
      label: "GoRules Decision Graph",
      description: "The executable decision graph for the GoRules engine.",
      accent: "emerald",
    },
    {
      key: "rules",
      url: businessRulesUrl,
      filename: `business-rules-${slug}.json`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
      ),
      label: "Business Rules",
      description: "The structured business rules extracted in Step 5.",
      accent: "blue",
    },
    {
      key: "tests",
      url: testsUrl,
      filename: `test-scenarios-${slug}.json`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 1-.659 1.591L9.75 14.5m4.5-11.396c.251.023.501.05.75.082M19.5 11.25a8.998 8.998 0 0 1-1.5 5.016m0 0-2.472 2.064M18 16.266l-2.472 2.064M7.5 16.266l-2.472 2.064M6 11.25a8.998 8.998 0 0 1 1.5 5.016" />
        </svg>
      ),
      label: "Test Scenarios",
      description: "Validation test cases generated alongside the business rules.",
      accent: "violet",
    },
  ] as const;

  const accentClasses: Record<string, { ring: string; bg: string; text: string; btn: string; btnHover: string }> = {
    emerald: { ring: "border-emerald-500/30", bg: "bg-emerald-500/10",  text: "text-emerald-400",  btn: "bg-emerald-600",   btnHover: "hover:bg-emerald-500"  },
    blue:    { ring: "border-blue-500/30",    bg: "bg-blue-500/10",     text: "text-blue-400",     btn: "bg-blue-600",      btnHover: "hover:bg-blue-500"     },
    violet:  { ring: "border-violet-500/30",  bg: "bg-violet-500/10",   text: "text-violet-400",   btn: "bg-violet-600",    btnHover: "hover:bg-violet-500"   },
  };

  return (
    <div className="flex flex-col items-center py-16 animate-in fade-in zoom-in duration-300 px-4">
      {/* Header */}
      <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 text-emerald-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>

      <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Project Ready</h2>
      <p className="text-slate-400 max-w-lg text-center text-lg mb-12 leading-relaxed">
        Your Rules-as-Code project has been successfully modeled. Download the artefacts below.
      </p>

      {/* Download cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl mb-14">
        {downloads.map(({ key, url, filename, icon, label, description, accent }) => {
          const c = accentClasses[accent];
          return (
            <div
              key={key}
              className={`flex flex-col items-center text-center p-6 rounded-2xl border bg-slate-900/60 backdrop-blur-sm gap-4 ${c.ring}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${c.bg} ${c.text}`}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100 mb-1">{label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              </div>
              {url ? (
                <a
                  href={url}
                  download={filename}
                  className={`inline-flex items-center gap-2 mt-auto px-5 py-2 rounded-full text-xs font-bold text-white transition-all ${c.btn} ${c.btnHover} shadow-md`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 3v13m0 0 3.75-3.75M12 16l-3.75-3.75" />
                  </svg>
                  Download .json
                </a>
              ) : (
                <span className="mt-auto text-xs text-slate-600 italic">Not available</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 max-w-2xl w-full text-left">
        <h3 className="text-slate-300 font-semibold mb-2">Instructions</h3>
        <ol className="list-decimal list-inside text-slate-400 space-y-2 text-sm">
          <li>Download the <strong className="text-slate-300">GoRules Decision Graph</strong> and import it into the <a href="https://gorules.io" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">GoRules Engine</a>.</li>
          <li>Use the <strong className="text-slate-300">Business Rules</strong> file as a human-readable reference.</li>
          <li>Run the <strong className="text-slate-300">Test Scenarios</strong> against the engine to validate your rule logic.</li>
        </ol>
      </div>
    </div>
  );
}
