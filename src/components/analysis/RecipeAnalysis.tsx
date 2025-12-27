/**
 * Recipe Analysis Component
 *
 * Main component that combines all analysis sub-components
 * Features:
 * - Health Score display
 * - Nutrition Analysis
 * - Ingredient Substitutions
 * - Allergen Warnings
 * - Cooking Difficulty
 * - Time Validation
 * - Uses React Query hook for data fetching
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo } from "react";
import { useRecipeAnalysis } from "../../hooks/useRecipes";
import HealthScore from "./HealthScore";
import NutritionAnalysis from "./NutritionAnalysis";
import IngredientSubstitutions from "./IngredientSubstitutions";
import AllergenWarnings from "./AllergenWarnings";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { ChefHat, Clock } from "lucide-react";
import SkeletonRecipeAnalysis from "../skeletons/SkeletonRecipeAnalysis";
import EmptyState from "../common/EmptyState";

interface RecipeAnalysisProps {
  recipeId: number | string;
  className?: string;
}

/**
 * Recipe Analysis Component (Memoized for performance)
 *
 * Fetches and displays comprehensive AI-powered recipe analysis
 */
const RecipeAnalysis = memo(
  ({ recipeId, className = "" }: RecipeAnalysisProps) => {
    const {
      data: analysis,
      isLoading,
      error,
    } = useRecipeAnalysis(recipeId, !!recipeId);

    // Show loading skeleton
    if (isLoading) {
      return <SkeletonRecipeAnalysis />;
    }

    // Show error state
    if (error) {
      return (
        <Card className={`bg-slate-800/50 border-red-500/30 p-4 ${className}`}>
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-2">Failed to load analysis</p>
            <p className="text-sm text-gray-400">
              {error.message || "Please try again later"}
            </p>
          </CardContent>
        </Card>
      );
    }

    // Show empty state if no analysis data
    if (!analysis) {
      return (
        <EmptyState
          message="Analysis not available"
          subtitle="Unable to generate analysis for this recipe"
        />
      );
    }

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Health Score */}
        {analysis.healthScore && (
          <HealthScore
            score={analysis.healthScore.score}
            explanation={analysis.healthScore.explanation}
          />
        )}

        {/* Nutrition Analysis */}
        {analysis.nutritionAnalysis && (
          <NutritionAnalysis
            summary={analysis.nutritionAnalysis.summary}
            strengths={analysis.nutritionAnalysis.strengths}
            concerns={analysis.nutritionAnalysis.concerns}
          />
        )}

        {/* Ingredient Substitutions */}
        {analysis.ingredientSubstitutions &&
          analysis.ingredientSubstitutions.length > 0 && (
            <IngredientSubstitutions
              substitutions={analysis.ingredientSubstitutions}
            />
          )}

        {/* Allergen Warnings */}
        {analysis.allergens && analysis.allergens.length > 0 && (
          <AllergenWarnings allergens={analysis.allergens} />
        )}

        {/* Cooking Difficulty */}
        {analysis.cookingDifficulty && (
          <Card className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 border-orange-500/30">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <ChefHat className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Cooking Difficulty
                    </h3>
                    <p className="text-sm text-gray-400">
                      Estimated difficulty level
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Badge
                    variant="outline"
                    className="bg-orange-500/10 border-orange-500/30 text-orange-300 text-base px-4 py-2 capitalize"
                  >
                    {analysis.cookingDifficulty.level}
                  </Badge>
                  {analysis.cookingDifficulty.explanation && (
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {analysis.cookingDifficulty.explanation}
                    </p>
                  )}
                  {analysis.cookingDifficulty.tips &&
                    analysis.cookingDifficulty.tips.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-orange-300">
                          Cooking Tips:
                        </p>
                        <ul className="space-y-1">
                          {analysis.cookingDifficulty.tips.map((tip, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-300 pl-4"
                            >
                              <span className="text-orange-400 mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Validation */}
        {analysis.timeValidation && analysis.timeValidation.estimatedTime && (
          <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Time Validation
                    </h3>
                    <p className="text-sm text-gray-400">
                      AI-estimated cooking time
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 border-blue-500/30 text-blue-300"
                    >
                      Estimated: {analysis.timeValidation.estimatedTime} minutes
                    </Badge>
                  </div>
                  {analysis.timeValidation.discrepancy && (
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {analysis.timeValidation.discrepancy}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);

RecipeAnalysis.displayName = "RecipeAnalysis";

export default RecipeAnalysis;
