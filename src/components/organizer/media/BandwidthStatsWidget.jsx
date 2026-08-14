import React from 'react';
import { TrendingDown, Database, Upload, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '../../../../utils/media/webpCompressor';

/**
 * BandwidthStatsWidget - Displays bandwidth savings statistics for image compression
 *
 * @param {Object} props - Component props
 * @param {number} props.originalSize - Original file size in bytes
 * @param {number} props.compressedSize - Compressed file size in bytes
 * @param {number} props.savingsPercentage - Percentage of bandwidth saved
 * @param {string} [props.title='Bandwidth Savings'] - Widget title
 * @param {boolean} [props.showDetails=true] - Whether to show detailed breakdown
 * @returns {JSX.Element} - Bandwidth stats widget component
 */
const BandwidthStatsWidget = ({
  originalSize = 0,
  compressedSize = 0,
  savingsPercentage = 0,
  title = 'Bandwidth Savings',
  showDetails = true,
}) => {
  const savings = originalSize - compressedSize;

  // Calculate potential cost savings (assuming $0.05/GB storage + $0.10/GB bandwidth)
  const costPerGB = 0.15; // Combined storage and bandwidth cost
  const originalCost = (originalSize / (1024 * 1024 * 1024)) * costPerGB;
  const compressedCost = (compressedSize / (1024 * 1024 * 1024)) * costPerGB;
  const costSavings = originalCost - compressedCost;

  // Performance metrics
  const loadTimeImprovement = savingsPercentage * 0.8; // Approximate load time reduction

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
      {/* Widget Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
          <TrendingDown className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            WebP compression benefits
          </p>
        </div>
      </div>

      {/* Main Savings Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bandwidth Savings */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
              Upload Savings
            </span>
          </div>
          <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {savingsPercentage}%
          </h4>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
            {formatFileSize(savings)} less per upload
          </p>
        </div>

        {/* Storage Savings */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
              Storage Savings
            </span>
          </div>
          <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatFileSize(savings)}
          </h4>
          <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80">
            per image stored
          </p>
        </div>

        {/* Cost Savings */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
              Cost Reduction
            </span>
          </div>
          <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400">
            ${costSavings.toFixed(4)}
          </h4>
          <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
            per image uploaded
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Original Size:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatFileSize(originalSize)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Compressed Size:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatFileSize(compressedSize)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Size Reduction:
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                -{formatFileSize(savings)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Load Time Improvement:
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                ~{loadTimeImprovement.toFixed(1)}% faster
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {originalSize > 0 && (
            <div className="pt-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Original</span>
                <span>Compressed</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  style={{
                    width: `${100 - savingsPercentage}%`,
                  }}
                />
              </div>
              <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                {savingsPercentage}% smaller
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          WebP format reduces file size while maintaining visual quality, 
          saving bandwidth and storage costs for event banners.
        </p>
      </div>
    </div>
  );
};

export default BandwidthStatsWidget;
