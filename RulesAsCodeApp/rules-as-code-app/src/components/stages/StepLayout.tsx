"use client";

import React from "react";

interface StepInputConfig {
  title?: string;
  description?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  processLabel: string;
  onProcess: () => void;
  isProcessing?: boolean;
  disabled?: boolean;
  rows?: number;
}

interface StepOutputConfig {
  title?: string;
  description?: React.ReactNode;
  value: string;
  onChange?: (value: string) => void;
  approveLabel?: string;
  onApprove?: () => void;
  onReset?: () => void; // New Reset Handler
  isApproving?: boolean;
  disabled?: boolean;
  rows?: number;
  confidence?: number | null;
}

interface StepLayoutProps {
  showOutput: boolean;
  input: StepInputConfig;
  output?: StepOutputConfig;
  reviewNotes?: {
    value: string;
    onChange: (value: string) => void;
    stepName: string;
  };
}

const ConfidenceWarningModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
      <div className="flex items-center gap-3 mb-4 text-amber-500">
        <svg
           xmlns="http://www.w3.org/2000/svg"
           fill="none"
           viewBox="0 0 24 24"
           strokeWidth={2}
           stroke="currentColor"
           className="w-8 h-8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <h3 className="text-xl font-bold text-white">Human Review Required</h3>
      </div>
      
      <p className="text-slate-300 mb-6 leading-relaxed">
        The AI has generated content with a <strong>low confidence score</strong> (&lt; 80%). 
        Please carefully review the output and make necessary corrections before approving.
      </p>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
        >
          I Understand
        </button>
      </div>
    </div>
  </div>
);

const Panel = ({
  title,
  description,
  value,
  onChange,
  readOnly,
  placeholder,
  footerLeft,
  footerRight,
  rows = 26,
  confidence,
}: {
  title: string;
  description?: React.ReactNode;
  value: string;
  onChange?: (value: string) => void;
  readOnly: boolean;
  placeholder?: string;
  footerLeft: React.ReactNode;
  footerRight: React.ReactNode;
  rows?: number;
  confidence?: number | null;
}) => {
  const handleChange = onChange
    ? (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)
    : undefined;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-sm shadow-sm flex flex-col h-full">
      {/* Header — matches StageNavigator phase header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-base font-semibold text-slate-100">{title}</h3>
            {description && (
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {confidence !== undefined && confidence !== null && (
            <div
              title={`Confidence Score: ${confidence}`}
              className={`ml-3 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                confidence >= 0.8
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : confidence >= 0.5
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {(confidence * 100).toFixed(0)}% CONFIDENCE SCORE
            </div>
          )}
        </div>
      </header>

      {/* Textarea */}
      <div className="flex-1 p-4">
        <textarea
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          rows={rows}
          placeholder={placeholder}
          className="scrollbar-minimal w-full h-full min-h-0 resize-none rounded-xl bg-slate-900/90 border border-slate-700/50 px-5 py-4 text-[15px] leading-relaxed text-slate-100 font-light outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-slate-600 caret-emerald-400 selection:bg-emerald-500/20"
        />
      </div>

      {/* Footer — matches your navigator's spacing */}
      <footer className="flex items-center justify-between px-4 py-3 border-t border-slate-800/80">
        <div className="text-xs text-slate-500">{footerLeft}</div>
        <div>{footerRight}</div>
      </footer>
    </section>
  );
};

export function StepLayout({ showOutput, input, output, reviewNotes }: StepLayoutProps) {
  const twoColumn = showOutput && !!output;

  return (
    <>
      {/* Minimal scrollbar — matches your StageNavigator aesthetic */}
      <style jsx global>{`
        .scrollbar-minimal {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.25) transparent;
        }
        .scrollbar-minimal::-webkit-scrollbar {
          width: 5px;
        }
        .scrollbar-minimal::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-minimal::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.25);
          border-radius: 3px;
        }
        .scrollbar-minimal:hover::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
        }
        .scrollbar-minimal:focus::-webkit-scrollbar-thumb {
          background: rgba(52, 211, 153, 0.6);
        }
      `}</style>
      
      {output?.confidence !== undefined && output?.confidence !== null && output.confidence < 0.8 && (
         <React.Fragment>
            {/* We can use a state to control visibility to show it only once per mount/update? 
                Actually, usually "when user opens the specific step". 
                Since this component mounts when the step opens, a simple state defaulting to true works.
            */}
            <ConfidenceCheck confidence={output.confidence} />
         </React.Fragment>
      )}

      <div
        className={
          twoColumn
            ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
            : "grid grid-cols-1 gap-6"
        }
      >
        {/* LEFT: Input */}
        <Panel
          title={input.title ?? "User Input"}
          description={input.description}
          value={input.value}
          onChange={input.onChange}
          readOnly={false}
          placeholder="Start typing your content here..."
          footerLeft={
            input.isProcessing
              ? "Processing your input..."
              : input.disabled
              ? "Enter text to enable processing"
              : "Ready to process"
          }
          footerRight={
            <button
              onClick={input.onProcess}
              disabled={input.disabled || input.isProcessing}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all shadow-md
                ${
                  input.disabled || input.isProcessing
                    ? "bg-emerald-900/40 text-emerald-300/60 cursor-not-allowed border border-emerald-800/50"
                    : "bg-emerald-500 hover:bg-emerald-450 text-slate-950 shadow-emerald-500/30"
                }`}
            >
              {input.isProcessing ? "Processing…" : input.processLabel}
            </button>
          }
        />

        {/* RIGHT: Output — now perfectly matched */}
        {twoColumn && output && (
          <Panel
            title={output.title ?? "Generated Output"}
            description={output.description}
            confidence={output.confidence}
            value={output.value}
            onChange={output.onChange}
            readOnly={false}
            placeholder="You can edit this result…"
            footerLeft={
              <div className="flex gap-2">
                <span>Review and approve when ready</span>
              </div>
            }
            footerRight={
              output.onApprove && (
                <button
                  onClick={output.onApprove}
                  disabled={output.disabled || output.isApproving}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all shadow-md
                    ${
                      output.disabled || output.isApproving
                        ? "bg-emerald-900/40 text-emerald-300/60 cursor-not-allowed border border-emerald-800/50"
                        : "bg-emerald-500 hover:bg-emerald-450 text-slate-950 shadow-emerald-500/30"
                    }`}
                >
                  {output.isApproving
                    ? "Approving…"
                    : output.approveLabel ?? "Approve & Continue"}
                </button>
              )
            }
          />
        )}
      </div>
      
      {/* Review Notes Section */}
      {reviewNotes && (
        <div className="mt-6">
          <Panel
            title="Review Notes"
            description=""
            value={reviewNotes.value}
            onChange={reviewNotes.onChange}
            readOnly={false}
            placeholder={`Here you can keep any notes for the ${reviewNotes.stepName} step of the rules as code methodology.`}
            rows={6}
            footerLeft="Notes are private and for internal review only."
            footerRight={<div />}
          />
        </div>
      )}
    </>
  );
}

// Helper component to handle local state for the modal
function ConfidenceCheck({ confidence }: { confidence: number }) {
  const [show, setShow] = React.useState(true);
  if (!show) return null;
  return <ConfidenceWarningModal onClose={() => setShow(false)} />;
}

export default StepLayout;
