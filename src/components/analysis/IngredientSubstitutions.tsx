/**
 * Ingredient Substitutions Component
 *
 * Reusable component for displaying AI-suggested ingredient substitutions
 * Features:
 * - Original ingredient and suggested substitute
 * - Reason for substitution
 * - Dietary benefits
 * - Uses ShadCN UI components
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { RefreshCw, Sparkles } from "lucide-react";

interface IngredientSubstitution {
  original: string;
  substitute: string;
  reason?: string;
  dietaryBenefit?: string;
}

interface IngredientSubstitutionsProps {
  substitutions?: IngredientSubstitution[];
  className?: string;
}

/**
 * Ingredient Substitutions Component (Memoized for performance)
 *
 * Displays AI-suggested ingredient substitutions
 */
const IngredientSubstitutions = memo(
  ({ substitutions = [], className = "" }: IngredientSubstitutionsProps) => {
    if (substitutions.length === 0) {
      return null;
    }

    return (
      <Card
        className={`bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 ${className}`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <RefreshCw className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ingredient Substitutions</h3>
                <p className="text-sm text-gray-400">AI-suggested alternatives</p>
              </div>
            </div>

            {/* Substitutions List */}
            <div className="space-y-3">
              {substitutions.map((sub, index) => (
                <div
                  key={index}
                  className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                >
                  <div className="space-y-2">
                    {/* Original → Substitute */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-300 font-medium">{sub.original}</span>
                      <span className="text-purple-400">→</span>
                      <span className="text-green-300 font-medium">{sub.substitute}</span>
                    </div>

                    {/* Reason */}
                    {sub.reason && (
                      <div className="flex items-start gap-2 text-sm text-gray-400">
                        <Sparkles className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>{sub.reason}</span>
                      </div>
                    )}

                    {/* Dietary Benefit */}
                    {sub.dietaryBenefit && (
                      <div>
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 border-green-500/30 text-green-300 text-xs"
                        >
                          {sub.dietaryBenefit}
                        </Badge>
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

IngredientSubstitutions.displayName = "IngredientSubstitutions";

export default IngredientSubstitutions;

