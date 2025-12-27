/**
 * Allergen Warnings Component
 *
 * Reusable component for displaying allergen information
 * Features:
 * - Allergen name and severity
 * - Sources of allergens (ingredients)
 * - Color-coded severity indicators
 * - Uses ShadCN UI components
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { AlertTriangle, Sparkles } from "lucide-react";

interface Allergen {
  allergen: string;
  severity: "low" | "medium" | "high";
  sources?: string[];
}

interface AllergenWarningsProps {
  allergens?: Allergen[];
  className?: string;
}

/**
 * Allergen Warnings Component (Memoized for performance)
 *
 * Displays allergen information with severity indicators
 */
const AllergenWarnings = memo(
  ({ allergens = [], className = "" }: AllergenWarningsProps) => {
    if (allergens.length === 0) {
      return null;
    }

    const getSeverityColor = (severity: "low" | "medium" | "high"): string => {
      switch (severity) {
        case "high":
          return "text-red-400 border-red-500/30 bg-red-500/10";
        case "medium":
          return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
        case "low":
          return "text-blue-400 border-blue-500/30 bg-blue-500/10";
        default:
          return "text-gray-400 border-gray-500/30 bg-gray-500/10";
      }
    };

    const getSeverityLabel = (severity: "low" | "medium" | "high"): string => {
      switch (severity) {
        case "high":
          return "High Risk";
        case "medium":
          return "Moderate Risk";
        case "low":
          return "Low Risk";
        default:
          return "Unknown";
      }
    };

    return (
      <Card
        className={`bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30 ${className}`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Allergen Information</h3>
                <p className="text-sm text-gray-400">Detected allergens and sources</p>
              </div>
            </div>

            {/* Allergens List */}
            <div className="space-y-3">
              {allergens.map((allergen, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${getSeverityColor(allergen.severity)}`}
                >
                  <div className="space-y-2">
                    {/* Allergen Name and Severity */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-semibold capitalize">{allergen.allergen}</span>
                      <Badge
                        variant="outline"
                        className={`${getSeverityColor(allergen.severity)} border-current`}
                      >
                        {getSeverityLabel(allergen.severity)}
                      </Badge>
                    </div>

                    {/* Sources */}
                    {allergen.sources && allergen.sources.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Sparkles className="h-3 w-3" />
                          <span>Found in:</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-5">
                          {allergen.sources.map((source, sourceIndex) => (
                            <Badge
                              key={sourceIndex}
                              variant="outline"
                              className="bg-slate-700/50 border-slate-600 text-gray-300 text-xs"
                            >
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

AllergenWarnings.displayName = "AllergenWarnings";

export default AllergenWarnings;

