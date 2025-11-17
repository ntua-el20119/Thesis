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
  isApproving?: boolean;
  disabled?: boolean;
  rows?: number;
}

interface StepLayoutProps {
  showOutput: boolean;
  input: StepInputConfig;
  output?: StepOutputConfig;
}

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
}) => {
  const handleChange = onChange
    ? (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)
    : undefined;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-sm shadow-sm flex flex-col h-full">
      {/* Header — matches StageNavigator phase header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          {description && (
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </header>

      {/* Textarea — clean, dark, eye-friendly */}
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

export function StepLayout({ showOutput, input, output }: StepLayoutProps) {
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
            value={output.value}
            onChange={output.onChange}
            readOnly={!output.onChange}
            placeholder={output.onChange ? "You can edit this result…" : ""}
            footerLeft="Review and approve when ready"
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
    </>
  );
}

export default StepLayout;
