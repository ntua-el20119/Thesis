import React, { useState, useEffect, useRef } from "react";
import { useWizardStore } from "@/store/wizardStore";

interface ConfigurationModalProps {
  onSave: () => void;
}

interface ModelItem {
  id: string;
  name: string;
  costPrompt?: string;
  costCompletion?: string;
}

export default function ConfigurationModal({ onSave }: ConfigurationModalProps) {
  const { setApiKey, setLlmModel, apiKey, llmModel } = useWizardStore();
  const [key, setKey] = useState(apiKey || "");
  const [model, setModel] = useState(llmModel || "");

  const [activeTab, setActiveTab] = useState<"free" | "paid">("free");
  const [freeModels, setFreeModels] = useState<ModelItem[]>([]);
  const [paidModels, setPaidModels] = useState<ModelItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!key.trim()) {
      alert("Please enter an API Key.");
      return;
    }
    if (!model.trim()) {
      alert("Please enter a Model.");
      return;
    }

    setApiKey(key.trim());
    setLlmModel(model.trim());
    onSave();
  };

  const formatCost = (costStr?: string) => {
    if (!costStr) return "0.00";
    const num = parseFloat(costStr) * 1000000;
    return num.toFixed(2);
  };

  const currentList = activeTab === "free" ? freeModels : paidModels;
  const filteredModels = currentList.filter(
    (m) =>
      m.name.toLowerCase().includes(model.toLowerCase()) ||
      m.id.toLowerCase().includes(model.toLowerCase())
  );

  const isLoaded = freeModels.length > 0 || paidModels.length > 0;
  const isPaidModel = isLoaded && paidModels.some((m) => m.id === model);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Configuration Required</h2>
        <p className="text-gray-400 text-sm mb-6">
          Please provide your OpenRouter API key and select an LLM model to continue with the project.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-or-..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center justify-between">
              <span>LLM Model</span>
              {isPaidModel && (
                <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20" title="This model incurs costs on OpenRouter">
                  Paid Model
                </span>
              )}
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder={`Search ${activeTab} models...`}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {isDropdownOpen && isLoaded && (
              <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden flex flex-col">
                <div className="flex bg-gray-900 border-b border-gray-700">
                  <button
                    type="button"
                    onClick={() => setActiveTab("free")}
                    className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                      activeTab === "free" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Free Models ({freeModels.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("paid")}
                    className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                      activeTab === "paid" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Paid Models ({paidModels.length || 0})
                  </button>
                </div>
                
                <ul className="max-h-60 overflow-y-auto custom-scrollbar bg-gray-800">
                  {isFetching && (
                    <li className="px-4 py-3 text-sm text-gray-500 italic text-center">Loading models...</li>
                  )}
                  {!isFetching && filteredModels.length === 0 && (
                    <li className="px-4 py-3 text-sm text-gray-500 italic text-center">No {activeTab} models match "{model}"</li>
                  )}
                  {filteredModels.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setModel(m.id);
                          setIsDropdownOpen(false);
                        }}
                        className="flex flex-col w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{m.id}</div>
                        {activeTab === "paid" && (
                          <div className="text-[10px] text-gray-400 mt-1 flex gap-3">
                            <span>In: ${formatCost(m.costPrompt)}/1M</span>
                            <span>Out: ${formatCost(m.costCompletion)}/1M</span>
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all mt-4"
          >
            Start Session
          </button>
        </form>
      </div>
    </div>
  );
}
