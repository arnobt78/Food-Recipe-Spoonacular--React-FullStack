/**
 * Health Score Component
 *
 * Reusable component for displaying recipe health score with visual indicator
 * Features:
 * - Visual health score display (0-100)
 * - Color-coded indicator (green/yellow/red)
 * - AI explanation of health score
 * - Uses ShadCN UI components
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { TrendingUp, Sparkles } from "lucide-react";

interface HealthScoreProps {
  score: number; // Health score (0-100)
  explanation?: string;
  className?: string;
}

/**
 * Health Score Component (Memoized for performance)
 *
 * Displays health score with color-coded visual indicator
 */
const HealthScore = memo(
  ({ score, explanation, className = "" }: HealthScoreProps) => {
    // Clamp score to 0-100 range
    const clampedScore = Math.max(0, Math.min(100, score));

    // Determine color based on score
    const getScoreColor = (scoreValue: number): string => {
      if (scoreValue >= 70) return "text-green-400";
      if (scoreValue >= 50) return "text-yellow-400";
      return "text-red-400";
    };

    const getProgressColor = (scoreValue: number): string => {
      if (scoreValue >= 70) return "bg-green-500";
      if (scoreValue >= 50) return "bg-yellow-500";
      return "bg-red-500";
    };

    const getLabel = (scoreValue: number): string => {
      if (scoreValue >= 70) return "Excellent";
      if (scoreValue >= 50) return "Good";
      return "Needs Improvement";
    };

    return (
      <Card
        className={`bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 ${className}`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Health Score</h3>
                  <p className="text-sm text-gray-400">Overall nutritional quality</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`${getScoreColor(clampedScore)} border-current text-lg font-bold px-3 py-1`}
              >
                {clampedScore}/100
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{getLabel(clampedScore)}</span>
                <span className={`font-semibold ${getScoreColor(clampedScore)}`}>
                  {clampedScore}%
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(clampedScore)}`}
                  style={{ width: `${clampedScore}%` }}
                />
              </div>
            </div>

            {/* AI Explanation */}
            {explanation && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300 leading-relaxed">{explanation}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

HealthScore.displayName = "HealthScore";

export default HealthScore;

