/**
 * Image Utility Functions
 *
 * Reusable functions for constructing image URLs from Spoonacular API
 * Following DEVELOPMENT_RULES.md: Centralized utilities, no code duplication
 */

/**
 * Construct recipe image URL from recipe ID and imageType
 * Per SPOONACULAR_API_DOCS.md: https://img.spoonacular.com/recipes/{id}-312x231.{imageType}
 *
 * @param recipeId - Recipe ID
 * @param imageType - Image type (jpg, png, etc.)
 * @returns Image URL string
 */
export function getRecipeImageUrl(recipeId: number, imageType: string): string {
  return `https://img.spoonacular.com/recipes/${recipeId}-312x231.${imageType}`;
}

/**
 * Get full-size recipe image URL (556x370)
 * Per SPOONACULAR_API_DOCS.md: https://img.spoonacular.com/recipes/{id}-556x370.{imageType}
 *
 * @param recipeId - Recipe ID
 * @param imageType - Image type (jpg, png, etc.)
 * @returns Image URL string
 */
export function getRecipeImageUrlFull(
  recipeId: number,
  imageType: string
): string {
  return `https://img.spoonacular.com/recipes/${recipeId}-556x370.${imageType}`;
}

/**
 * Get ingredient image URL
 * Handles multiple URL formats from Spoonacular API:
 * - Full URLs: normalizes domain and returns as-is
 * - Filenames: constructs URL using working format (without /cdn/)
 *
 * Based on old working implementation: https://img.spoonacular.com/ingredients_100x100/{image}
 *
 * @param imageName - Image filename or full URL from ingredient data
 * @returns Image URL string
 */
export function getIngredientImageUrl(imageName: string): string {
  if (!imageName) return "";

  // If already a full URL, normalize domain and return
  if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
    // Normalize spoonacular.com to img.spoonacular.com
    // Normalize /cdn/ paths to non-/cdn/ paths (matching old working format)
    return imageName
      .replace(/^https?:\/\/spoonacular\.com\//, "https://img.spoonacular.com/")
      .replace(/\/cdn\/ingredients_100x100\//, "/ingredients_100x100/");
  }

  // For filenames, use the format that worked in the old project (without /cdn/)
  return `https://img.spoonacular.com/ingredients_100x100/${imageName}`;
}

/**
 * Get equipment image URL
 * Handles multiple URL formats from Spoonacular API:
 * - Full URLs: normalizes domain and returns as-is
 * - Filenames: constructs URL using working format (without /cdn/)
 *
 * Based on old working implementation: https://img.spoonacular.com/equipment_100x100/{image}
 *
 * @param imageName - Image filename or full URL from equipment data
 * @returns Image URL string
 */
export function getEquipmentImageUrl(imageName: string): string {
  if (!imageName) return "";

  // If already a full URL, normalize domain and return
  if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
    // Normalize spoonacular.com to img.spoonacular.com
    // Normalize /cdn/ paths to non-/cdn/ paths (matching old working format)
    return imageName
      .replace(/^https?:\/\/spoonacular\.com\//, "https://img.spoonacular.com/")
      .replace(/\/cdn\/equipment_100x100\//, "/equipment_100x100/");
  }

  // For filenames, use the format that worked in the old project (without /cdn/)
  return `https://img.spoonacular.com/equipment_100x100/${imageName}`;
}
