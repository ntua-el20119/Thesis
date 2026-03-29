"use client";

import React, { useState, useEffect, useRef } from "react";
import { useWizardStore } from "@/store/wizardStore";

interface ModelItem {
  id: string;
  name: string;
  costPrompt?: string;
  costCompletion?: string;
}

export default function ModelSwitcher() {
  const { llmModel, setLlmModel } = useWizardStore();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(llmModel ?? "");
  const [activeTab, setActiveTab] = useState<"free" | "paid">("free");
  const [freeModels, setFreeModels] = useState<ModelItem[]>([]);
  const [paidModels, setPaidModels] = useState<ModelItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep local input in sync if store changes externally
  useEffect(() => {
    setValue(llmModel ?? "");
  }, [llmModel]);

  // Fetch models on mount so we can determine if active model is paid
  useEffect(() => {
    if (freeModels.length > 0 || paidModels.length > 0) return;

    const fetchModels = async () => {
      setIsFetching(true);
      try {
        const res = await fetch("https://openrouter.ai/api/v1/models");
        if (!res.ok) return;
        const json = await res.json();
        
        const free: ModelItem[] = [];
        const paid: ModelItem[] = [];

        json.data.forEach((m: any) => {
          const item: ModelItem = {
            id: m.id,
            name: m.name,
            costPrompt: m.pricing?.prompt,
            costCompletion: m.pricing?.completion,
          };
          if (m.pricing?.prompt === "0" && m.pricing?.completion === "0") {
            free.push(item);
          } else {
            paid.push(item);
          }
        });

        const sortFn = (a: ModelItem, b: ModelItem) => a.name.localeCompare(b.name);
        setFreeModels(free.sort(sortFn));
        setPaidModels(paid.sort(sortFn));
      } catch (err) {
        console.error("Failed to fetch OpenRouter models:", err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchModels();
  }, [freeModels.length, paidModels.length]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleApply = () => {
    if (value.trim()) {
      setLlmModel(value.trim());
    }
    setOpen(false);
  };

  const currentList = activeTab === "free" ? freeModels : paidModels;
  const filtered = currentList.filter(
    (m) =>
      m.name.toLowerCase().includes(value.toLowerCase()) ||
      m.id.toLowerCase().includes(value.toLowerCase())
  );

  const formatCost = (costStr?: string) => {
    if (!costStr) return "0.00";
    const num = parseFloat(costStr) * 1000000;
    return num.toFixed(2);
  };

  const isLoaded = freeModels.length > 0 || paidModels.length > 0;
  const isPaidModel = isLoaded && paidModels.some((m) => m.id === llmModel);

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      {/* Active model badge */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-500 font-mono">MODEL</span>
        <span className="text-xs text-slate-300 font-mono bg-slate-800 border border-slate-700 rounded-md px-2 py-1 whitespace-nowrap" title={llmModel ?? ""}>
          {llmModel ? llmModel : <span className="text-slate-500 italic">not set</span>}
        </span>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-600 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
        title="Change model"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Change
      </button>

      {/* Paid Warning */}
      {isPaidModel && (
        <span className="flex items-center gap-1 ml-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider" title="This model incurs costs on OpenRouter">
          You are using a Paid Model, be careful with your usage!
        </span>
      )}

      {/* Popover */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Change Active Model</p>

          {/* Tabs */}
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("free")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "free" ? "bg-slate-700 text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Free Models ({freeModels.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("paid")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "paid" ? "bg-slate-700 text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Paid Models ({paidModels.length || 0})
            </button>
          </div>

          {/* Input */}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Search ${activeTab} models...`}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            autoFocus
          />

          {/* Models list */}
          <div>
            <p className="text-xs text-slate-500 mb-1.5">
              {isFetching ? "Loading models…" : `${activeTab === "free" ? "Free" : "Paid"} models (${filtered.length})`}
            </p>
            <ul className="max-h-64 overflow-y-auto custom-scrollbar space-y-0.5 rounded-lg border border-slate-800 bg-slate-950/50">
              {!isFetching && filtered.length === 0 && (
                <li className="px-3 py-2 text-xs text-slate-500 italic text-center">
                  {value ? `No models match "${value}"` : "No models found."}
                </li>
              )}
              {filtered.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setValue(m.id);
                      setLlmModel(m.id);
                      setOpen(false);
                    }}
                    className={`flex flex-col w-full text-left px-3 py-2 text-xs transition-colors hover:bg-slate-800 ${
                      llmModel === m.id ? "bg-emerald-500/10 text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    <div className="font-medium text-[13px]">{m.name}</div>
                    <div className="text-slate-500 font-mono mt-0.5">{m.id}</div>
                    {activeTab === "paid" && (
                      <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-3">
                        <span title="Prompt Cost per 1M tokens" className="flex items-center gap-1">
                          <span className="text-slate-500">In:</span> ${formatCost(m.costPrompt)}/1M
                        </span>
                        <span title="Completion Cost per 1M tokens" className="flex items-center gap-1">
                          <span className="text-slate-500">Out:</span> ${formatCost(m.costCompletion)}/1M
                        </span>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
