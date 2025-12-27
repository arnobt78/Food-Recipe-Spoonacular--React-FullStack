/**
 * Nutrition Analysis Component
 *
 * Reusable component for displaying AI-generated nutrition analysis
 * Features:
 * - Nutrition summary
 * - Strengths and concerns lists
 * - Uses ShadCN UI components
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo } from "react";
import { Card, CardContent } from "../ui/card";
import { Leaf, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

interface NutritionAnalysisProps {
  summary?: string;
  strengths?: string[];
  concerns?: string[];
  className?: string;
}

/**
 * Nutrition Analysis Component (Memoized for performance)
 *
 * Displays nutrition analysis with summary, strengths, and concerns
 */
const NutritionAnalysis = memo(
  ({ summary, strengths = [], concerns = [], className = "" }: NutritionAnalysisProps) => {
    if (!summary && strengths.length === 0 && concerns.length === 0) {
      return null;
    }

    return (
      <Card
        className={`bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/30 ${className}`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Leaf className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Nutrition Analysis</h3>
                <p className="text-sm text-gray-400">AI-powered nutritional insights</p>
              </div>
            </div>

            {/* Summary */}
            {summary && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
                </div>
              </div>
            )}

            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Nutritional Strengths</span>
                </div>
                <ul className="space-y-2">
                  {strengths.map((strength, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-300 pl-6"
                    >
                      <span className="text-green-400 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {concerns.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Areas for Improvement</span>
                </div>
                <ul className="space-y-2">
                  {concerns.map((concern, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-300 pl-6"
                    >
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

NutritionAnalysis.displayName = "NutritionAnalysis";

export default NutritionAnalysis;

