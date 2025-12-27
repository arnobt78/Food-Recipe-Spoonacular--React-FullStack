/**
 * Recipe Recommendations Component
 *
 * Reusable component for displaying AI-powered recipe recommendations
 * Features:
 * - Uses existing RecipeGrid component for consistency
 * - Displays AI explanation for recommendations
 * - Handles loading and error states
 * - Supports various recommendation types (ingredients, dietary, cuisine, etc.)
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo } from "react";
import { Recipe } from "../../types";
import RecipeGrid from "../recipes/RecipeGrid";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Sparkles } from "lucide-react";
import SkeletonRecipeGrid from "../skeletons/SkeletonRecipeGrid";
import EmptyState from "../common/EmptyState";

interface RecipeRecommendationsProps {
  recipes: Recipe[];
  reason?: string;
  isLoading?: boolean;
  error?: Error | null;
  title?: string;
  className?: string;
  favouriteRecipes?: Recipe[];
  onFavouriteToggle?: (recipe: Recipe, isFavourite: boolean) => void;
}

/**
 * Recipe Recommendations Component (Memoized for performance)
 *
 * Displays AI-generated recipe recommendations with explanation
 */
const RecipeRecommendations = memo(
  ({
    recipes,
    reason,
    isLoading = false,
    error = null,
    title = "Recommended Recipes",
    className = "",
    favouriteRecipes = [],
    onFavouriteToggle,
  }: RecipeRecommendationsProps) => {
    // Show loading skeleton
    if (isLoading) {
      return <SkeletonRecipeGrid count={6} />;
    }

    // Show error state
    if (error) {
      return (
        <Card className={`bg-slate-800/50 border-red-500/30 p-4 ${className}`}>
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-2">Failed to load recommendations</p>
            <p className="text-sm text-gray-400">
              {error.message || "Please try again later"}
            </p>
          </CardContent>
        </Card>
      );
    }

    // Show empty state if no recipes
    if (!recipes || recipes.length === 0) {
      return (
        <EmptyState
          message="No recommendations available"
          subtitle="Try adjusting your search criteria or preferences"
        />
      );
    }

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Recommendations Header */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-semibold text-white">
                    {title}
                  </CardTitle>
                  {reason && (
                    <p className="text-sm text-gray-400 mt-1">{reason}</p>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300 text-xs flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                AI Powered
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Recommendations Grid */}
        <RecipeGrid
          recipes={recipes}
          favouriteRecipes={favouriteRecipes}
          onFavouriteToggle={onFavouriteToggle ?? (() => {})}
        />
      </div>
    );
  }
);

RecipeRecommendations.displayName = "RecipeRecommendations";

export default RecipeRecommendations;
