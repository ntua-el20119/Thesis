import React, { useState } from "react";
import { useWizardStore } from "@/lib/store";

interface ConfigurationModalProps {
  onSave: () => void;
}

export default function ConfigurationModal({ onSave }: ConfigurationModalProps) {
  const { setApiKey, setLlmModel } = useWizardStore();
  const [key, setKey] = useState("");
  const [model, setModel] = useState("");

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
          Please provide your OpenRouter API key and select an LLM model to continue.
          These values are not saved to disk for security.
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              LLM Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="provider/model"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
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
