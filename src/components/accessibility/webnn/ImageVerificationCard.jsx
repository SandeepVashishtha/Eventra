import React, { useState } from "react";
import { Sparkles, Eye, ShieldCheck } from "lucide-react";
import { runWebnnInference } from "../../../utils/ai/webnn/imageClassification";
import AltTagPreview from "./AltTagPreview";

export default function ImageVerificationCard({ imageUrl = "https://eventra.io/assets/conference.png" }) {
  const [inferredTags, setInferredTags] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const startLocalAIEvaluation = async () => {
    setAnalyzing(true);
    try {
      const tags = await runWebnnInference(imageUrl);
      setInferredTags(tags);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Image Alt-Text WebNN Assistant</span>
        </div>
        <button
          onClick={startLocalAIEvaluation}
          disabled={analyzing}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {analyzing ? "Running on-device WebNN..." : "Auto-Generate Alt Tag"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="aspect-video rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-150 dark:border-gray-800">
          <img src={imageUrl} alt="Evaluation preview" className="w-full h-full object-cover" />
        </div>

        {inferredTags.length > 0 && <AltTagPreview tags={inferredTags} />}
      </div>
    </div>
  );
}
