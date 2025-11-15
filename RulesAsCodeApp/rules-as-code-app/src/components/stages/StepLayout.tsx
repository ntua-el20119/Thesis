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
  /**
   * If true, render two columns (input + output).
   * If false, render only the input side (pre-LLM state).
   */
  showOutput: boolean;
  input: StepInputConfig;
  output?: StepOutputConfig;
}

/**
 * StepLayout
 * ----------
 * Shared layout + styling for wizard steps that follow the pattern:
 *
 *   - Left: free-form text input + "Process" button
 *   - Right: LLM-generated (or processed) output + "Approve" button
 *
 * This component is intentionally presentation-focused. It does not
 * know anything about phases, steps, or APIs; it simply renders
 * the standard two-pane RaC editing UI.
 */
export function StepLayout({ showOutput, input, output }: StepLayoutProps) {
  const twoColumn = showOutput && !!output;

  const inputTitle = input.title ?? "User Input";
  const outputTitle = output?.title ?? "LLM Response";

  const inputRows = input.rows ?? 25;
  const outputRows = output?.rows ?? 25;

  const approveLabel = output?.approveLabel ?? "Approve";

  return (
    <div
      className={
        twoColumn
          ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
          : "grid grid-cols-1 gap-6"
      }
    >
      {/* Left: input side */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm px-4 py-4 md:px-5 md:py-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base md:text-lg font-semibold text-slate-100">
            {inputTitle}
          </h3>
          {/* Optional small status badge if needed in the future */}
        </div>

        {input.description && (
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            {input.description}
          </p>
        )}

        <textarea
          value={input.value}
          onChange={(e) => input.onChange(e.target.value)}
          rows={inputRows}
          className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs md:text-sm text-slate-100 font-mono
                     placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     resize-y min-h-[10rem]"
        />

        <div className="flex items-center justify-between pt-1">
          {input.disabled || input.isProcessing ? (
            <p className="text-[11px] text-slate-500">
              {input.disabled && !input.isProcessing
                ? "Provide input to enable processing."
                : input.isProcessing
                ? "Processing your text…"
                : null}
            </p>
          ) : (
            <span className="text-[11px] text-slate-500">
              {twoColumn
                ? "Update the text and re-run the segmentation."
                : "Once ready, run the first transformation step."}
            </span>
          )}

          <button
            onClick={input.onProcess}
            disabled={input.disabled || input.isProcessing}
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs md:text-sm font-medium
                        transition-colors shadow-md shadow-emerald-500/20
                        ${
                          input.disabled || input.isProcessing
                            ? "bg-emerald-900/50 text-emerald-200/60 cursor-not-allowed border border-emerald-700/60"
                            : "bg-emerald-500 hover:bg-emerald-600 text-slate-900 border border-emerald-400"
                        }`}
          >
            {input.isProcessing ? "Processing…" : input.processLabel}
          </button>
        </div>
      </div>

      {/* Right: output side */}
      {twoColumn && output && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm px-4 py-4 md:px-5 md:py-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base md:text-lg font-semibold text-slate-100">
              {outputTitle}
            </h3>
          </div>

          {output.description && (
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              {output.description}
            </p>
          )}

          <textarea
            value={output.value}
            onChange={
              output.onChange
                ? (e) => output.onChange?.(e.target.value)
                : undefined
            }
            rows={outputRows}
            className={`w-full rounded-xl border border-slate-700 px-3 py-2 text-xs md:text-sm font-mono resize-y min-h-[10rem]
                        ${
                          output.onChange
                            ? "bg-slate-950/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            : "bg-slate-900 text-slate-300"
                        }`}
            readOnly={!output.onChange}
          />

          {output.onApprove && (
            <div className="flex items-center justify-end pt-1">
              <button
                onClick={output.onApprove}
                disabled={output.disabled || output.isApproving}
                className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs md:text-sm font-medium
                            transition-colors shadow-md shadow-emerald-500/20
                            ${
                              output.disabled || output.isApproving
                                ? "bg-emerald-900/50 text-emerald-200/60 cursor-not-allowed border border-emerald-700/60"
                                : "bg-emerald-500 hover:bg-emerald-600 text-slate-900 border border-emerald-400"
                            }`}
              >
                {output.isApproving ? "Approving…" : approveLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StepLayout;
