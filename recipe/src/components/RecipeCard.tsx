/**
 * Recipe Card Component
 *
 * Reusable card component for displaying recipe information
 * Features:
 * - ShadCN Card component
 * - Gradient glow effects
 * - Favourite button (top left corner)
 * - Hover animations
 * - SVG icon integration
 * - Badges and additional info
 */

import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Recipe } from "../types";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { Trash2, Clock, Users, TrendingUp, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Props {
  recipe: Recipe;
  isFavourite: boolean;
  onFavouriteButtonClick: (recipe: Recipe) => void;
  showRemoveButton?: boolean;
  index?: number; // Add index prop for loading optimization
  onClick?: () => void; // Optional: Override default navigation behavior
}

/**
 * Recipe Card Component (Memoized for performance)
 *
 * Reusable card component for displaying recipe information
 * Features:
 * - ShadCN Card component
 * - Gradient glow effects
 * - Favourite button in top left corner
 * - Hover animations
 * - SVG icon integration
 * - Badges and additional info
 */
const RecipeCard = memo(
  ({
    recipe,
    onClick,
    onFavouriteButtonClick,
    isFavourite,
    showRemoveButton = false,
    index = 0,
  }: Props) => {
    const navigate = useNavigate();
    // Optimize loading: First 8 cards (visible on most screens) load eagerly
    // Rest load lazily for better initial page performance
    const shouldLoadEagerly = index < 8;

    // Extract basic info from summary if available
    // Also check for ingredient information from search results
    const cardInfo = useMemo(() => {
      const info: {
        time?: string;
        servings?: string;
        calories?: string;
        usedIngredients?: number;
        missedIngredients?: number;
        unusedIngredients?: number;
      } = {};

      if (recipe.summary) {
        const summary = recipe.summary.toLowerCase();

        // Extract time
        const timeMatch = summary.match(/(\d+)\s*minutes?/);
        if (timeMatch) info.time = `${timeMatch[1]} min`;

        // Extract servings
        const servingsMatch = summary.match(/serves?\s*(\d+)/);
        if (servingsMatch) info.servings = `${servingsMatch[1]} servings`;

        // Extract calories
        const caloriesMatch = summary.match(/(\d+)\s*calories?/);
        if (caloriesMatch) info.calories = `${caloriesMatch[1]} cal`;
      }

      // Get ingredient info from search results (when fillIngredients=true)
      if (recipe.usedIngredientCount !== undefined) {
        info.usedIngredients = recipe.usedIngredientCount;
      }
      if (recipe.missedIngredientCount !== undefined) {
        info.missedIngredients = recipe.missedIngredientCount;
      }
      // Also track unused ingredients count (for "what's in your fridge?" feature)
      if (recipe.unusedIngredients && recipe.unusedIngredients.length > 0) {
        info.unusedIngredients = recipe.unusedIngredients.length;
      }

      return Object.keys(info).length > 0 ? info : null;
    }, [
      recipe.summary,
      recipe.usedIngredientCount,
      recipe.missedIngredientCount,
      recipe.unusedIngredients,
    ]);

    // Handle card click: Use custom onClick if provided, otherwise navigate to recipe page
    const handleCardClick = () => {
      if (onClick) {
        onClick();
      } else {
        navigate(`/recipe/${recipe.id}`);
      }
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        className="cursor-pointer"
      >
        <Card className="glow-card group h-full flex flex-col overflow-hidden min-h-[320px]">
          {/* Recipe Image */}
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={recipe.image || "/hero-image.webp"}
              alt={recipe.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
              loading={shouldLoadEagerly ? "eager" : "lazy"}
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Favourite Button - Top Left Corner */}
            <div className="absolute top-2 left-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onFavouriteButtonClick(recipe);
                }}
                className={`p-6 rounded-full transition-all backdrop-blur-sm bg-black/30 hover:bg-black/50 ${
                  showRemoveButton
                    ? "hover:bg-red-500/40"
                    : isFavourite
                    ? "bg-red-500/40 hover:bg-red-500/60"
                    : "hover:bg-purple-500/40"
                }`}
                aria-label={
                  showRemoveButton
                    ? "Remove from collection"
                    : isFavourite
                    ? "Remove from favourites"
                    : "Add to favourites"
                }
              >
                {showRemoveButton ? (
                  <Trash2 className="h-5 w-5 text-red-400" />
                ) : isFavourite ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <AiFillHeart
                      size={24}
                      className="text-red-500 drop-shadow-lg"
                    />
                  </motion.div>
                ) : (
                  <AiOutlineHeart
                    size={24}
                    className="text-white drop-shadow-lg group-hover:text-purple-300 transition-colors"
                  />
                )}
              </Button>
            </div>

            {/* Decorative SVG Icon Overlay - Top Right (Bigger) */}
            <div className="absolute top-2 right-2 opacity-60 group-hover:opacity-100 transition-opacity z-10">
              <img
                src="/hamburger.svg"
                alt="Recipe"
                className="w-12 h-12 drop-shadow-2xl"
              />
            </div>

            {/* Badges Overlay - Bottom of Image */}
            {cardInfo && (
              <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 z-10">
                {cardInfo.time && (
                  <Badge className="bg-black/60 backdrop-blur-sm text-white border-purple-400/30 text-xs px-2 py-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {cardInfo.time}
                  </Badge>
                )}
                {cardInfo.servings && (
                  <Badge className="bg-black/60 backdrop-blur-sm text-white border-purple-400/30 text-xs px-2 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    {cardInfo.servings}
                  </Badge>
                )}
                {cardInfo.calories && (
                  <Badge className="bg-black/60 backdrop-blur-sm text-white border-purple-400/30 text-xs px-2 py-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {cardInfo.calories}
                  </Badge>
                )}
                {/* Show ingredient match info from search results (when fillIngredients=true) */}
                {cardInfo.usedIngredients !== undefined &&
                  cardInfo.usedIngredients > 0 && (
                    <Badge 
                      className="bg-black/60 backdrop-blur-sm text-white border-green-400/30 text-xs px-2 py-1"
                      title={recipe.usedIngredients && recipe.usedIngredients.length > 0 
                        ? `Used: ${recipe.usedIngredients.map(ing => ing.name).join(', ')}`
                        : `${cardInfo.usedIngredients} ingredients used`}
                    >
                      ✓ {cardInfo.usedIngredients}
                    </Badge>
                  )}
                {cardInfo.missedIngredients !== undefined &&
                  cardInfo.missedIngredients > 0 && (
                    <Badge 
                      className="bg-black/60 backdrop-blur-sm text-white border-orange-400/30 text-xs px-2 py-1"
                      title={recipe.missedIngredients && recipe.missedIngredients.length > 0 
                        ? `Missing: ${recipe.missedIngredients.map(ing => ing.name).join(', ')}`
                        : `${cardInfo.missedIngredients} ingredients missing`}
                    >
                      ⚠ {cardInfo.missedIngredients}
                    </Badge>
                  )}
                {/* Show unused ingredients count (for "what's in your fridge?" feature) */}
                {cardInfo.unusedIngredients !== undefined &&
                  cardInfo.unusedIngredients > 0 && (
                    <Badge 
                      className="bg-black/60 backdrop-blur-sm text-white border-blue-400/30 text-xs px-2 py-1"
                      title={recipe.unusedIngredients && recipe.unusedIngredients.length > 0 
                        ? `Unused: ${recipe.unusedIngredients.map(ing => ing.name).join(', ')}`
                        : `${cardInfo.unusedIngredients} unused ingredients`}
                    >
                      ℹ {cardInfo.unusedIngredients}
                    </Badge>
                  )}
              </div>
            )}
          </div>

          <CardContent className="p-4 flex-1 flex flex-col min-h-[100px]">
            {/* Recipe Title - Full Width with Fixed Min Height for Consistency */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white w-full line-clamp-2 group-hover:text-purple-200 transition-colors min-h-[3.5rem] flex items-start">
                {recipe.title}
              </h3>
              {/* Display likes count if available from search results */}
              {recipe.likes !== undefined && recipe.likes > 0 && (
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs flex-shrink-0"
                >
                  <Star className="h-3 w-3 mr-1 fill-purple-400" />
                  {recipe.likes}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

RecipeCard.displayName = "RecipeCard";

export default RecipeCard;
