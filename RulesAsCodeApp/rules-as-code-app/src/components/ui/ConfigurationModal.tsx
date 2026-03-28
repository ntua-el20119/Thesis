import React, { useState, useEffect, useRef } from "react";
import { useWizardStore } from "@/store/wizardStore";

interface ConfigurationModalProps {
  onSave: () => void;
}

interface FreeModel {
  id: string;
  name: string;
}

export default function ConfigurationModal({ onSave }: ConfigurationModalProps) {
  const { setApiKey, setLlmModel, apiKey, llmModel } = useWizardStore();
  const [key, setKey] = useState(apiKey || "");
  const [model, setModel] = useState(llmModel || "");

  const [freeModels, setFreeModels] = useState<FreeModel[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/models");
        if (!res.ok) return;
        const json = await res.json();
        
        const free = json.data
          .filter((m: any) => m.pricing?.prompt === "0" && m.pricing?.completion === "0")
          .map((m: any) => ({ id: m.id, name: m.name }))
          .sort((a: FreeModel, b: FreeModel) => a.name.localeCompare(b.name));
          
        setFreeModels(free);
      } catch (err) {
        console.error("Failed to fetch OpenRouter models:", err);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
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
            <label className="block text-sm font-medium text-gray-300 mb-1">
              LLM Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="LLM Model to use for the project"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {isDropdownOpen && freeModels.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                {freeModels
                  .filter((m) => m.name.toLowerCase().includes(model.toLowerCase()) || m.id.toLowerCase().includes(model.toLowerCase()))
                  .map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setModel(m.id);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-gray-500">{m.id}</div>
                      </button>
                    </li>
                  ))}
                  {freeModels.filter((m) => m.name.toLowerCase().includes(model.toLowerCase()) || m.id.toLowerCase().includes(model.toLowerCase())).length === 0 && (
                    <li className="px-4 py-3 text-sm text-gray-500 italic text-center">No free models match "{model}"</li>
                  )}
              </ul>
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
