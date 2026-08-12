import React, { useState } from "react";
import { Share2, Sparkles, Layers, ArrowUpRight } from "lucide-react";
import SemanticSearchBar from "./SemanticSearchBar";

const KNOWLEDGE_NODES = [
  { id: "n-1", label: "WebGPU 3D Virtual Stage", type: "Event", similarity: 96, connections: ["WebGPU", "3D Graphics", "React"] },
  { id: "n-2", label: "ZKP Anonymous Feedback", type: "Workshop", similarity: 88, connections: ["Cryptography", "Privacy", "Zero Knowledge"] },
  { id: "n-3", label: "Paillier Encrypted Revenue", type: "Keynote", similarity: 82, connections: ["Privacy", "Homomorphic Encryption"] },
];

export default function EventKnowledgeGraph() {
  const [nodes, setNodes] = useState(KNOWLEDGE_NODES);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Natural Language Semantic Input */}
      <SemanticSearchBar />

      {/* RAG Knowledge Graph Container */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              RAG Vector Knowledge Graph Connections
            </h3>
          </div>

          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
            Cosine Similarity Cos(θ) Ranked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-2 hover:border-indigo-500 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {node.type}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {node.similarity}% Match
                </span>
              </div>

              <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                {node.label}
              </h4>

              <div className="flex flex-wrap gap-1 pt-1">
                {node.connections.map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[9px] font-semibold"
                  >
                    • {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
