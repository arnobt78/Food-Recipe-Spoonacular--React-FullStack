/**
 * Search Results Metadata Component
 * 
 * Displays search results metadata from SearchRecipesResponse
 * Shows: totalResults, offset, number, and current results count
 * 
 * @see https://spoonacular.com/food-api/docs#Search-Recipes
 */

import { memo } from "react";
import { Badge } from "../ui/badge";
import { SearchRecipesResponse } from "../../types";
import { Info, Sparkles } from "lucide-react";

interface SearchResultsMetadataProps {
  searchResponse: SearchRecipesResponse | undefined;
  currentResultsCount: number;
  searchTerm: string;
  className?: string;
}

/**
 * Search Results Metadata Component (Memoized for performance)
 * 
 * Displays:
 * - Total results available
 * - Current results shown
 * - Offset and number from API response
 * - AI optimization indicator if AI search was used
 */
const SearchResultsMetadata = memo(({ 
  searchResponse, 
  currentResultsCount,
  searchTerm,
  className = ""
}: SearchResultsMetadataProps) => {
  // Only show if we have search results and metadata
  if (!searchResponse || !searchTerm || currentResultsCount === 0) {
    return null;
  }

  const { totalResults, offset = 0, number = 0, aiOptimized } = searchResponse;

  // Don't show if we don't have totalResults
  if (totalResults === undefined || totalResults === null) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 text-sm text-gray-400 ${className}`}>
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-purple-400" />
        <span>
          Showing <span className="text-white font-semibold">{currentResultsCount}</span> of{" "}
          <span className="text-white font-semibold">{totalResults.toLocaleString()}</span> results
        </span>
      </div>
      
      {/* AI Optimization Badge */}
      {aiOptimized && (
        <Badge variant="outline" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300 text-xs flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI Optimized
        </Badge>
      )}
      
      {/* Show offset and number if available (for debugging/advanced users) - Only for non-AI searches */}
      {!aiOptimized && (offset !== undefined || number !== undefined) && (
        <Badge variant="outline" className="bg-slate-800/50 border-slate-600 text-gray-300 text-xs">
          Page: {Math.floor(offset / (number || 10)) + 1} • Per page: {number || 10}
        </Badge>
      )}
    </div>
  );
});

SearchResultsMetadata.displayName = "SearchResultsMetadata";

export default SearchResultsMetadata;

