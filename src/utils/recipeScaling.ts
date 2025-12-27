/**
 * Recipe Scaling Utility
 *
 * Utilities for scaling recipes (servings adjustment, unit conversion)
 * Pure math-based functions - no AI required
 *
 * Following DEVELOPMENT_RULES.md: Centralized utilities, reusable functions
 */

import { RecipeInformation } from "../types";

/**
 * Scaled ingredient interface
 */
export interface ScaledIngredient {
  original: string;
  scaled: string;
  originalAmount: number;
  scaledAmount: number;
  unit: string;
  unitLong: string;
  unitShort: string;
}

/**
 * Scale recipe ingredients based on servings multiplier
 *
 * @param recipeInfo - Recipe information with extendedIngredients
 * @param targetServings - Target number of servings
 * @param originalServings - Original number of servings (defaults to recipeInfo.servings)
 * @returns Array of scaled ingredients
 */
export function scaleRecipeIngredients(
  recipeInfo: RecipeInformation,
  targetServings: number,
  originalServings?: number
): ScaledIngredient[] {
  if (!recipeInfo.extendedIngredients) {
    return [];
  }

  const original = originalServings || recipeInfo.servings || 1;
  if (original <= 0 || targetServings <= 0) {
    return recipeInfo.extendedIngredients.map((ing) => ({
      original: ing.original,
      scaled: ing.original,
      originalAmount: ing.amount,
      scaledAmount: ing.amount,
      unit: ing.unit || "",
      unitLong: ing.measures?.metric?.unitLong || ing.unit || "",
      unitShort: ing.measures?.metric?.unitShort || ing.unit || "",
    }));
  }

  const multiplier = targetServings / original;

  return recipeInfo.extendedIngredients.map((ing) => {
    const scaledAmount = ing.amount * multiplier;
    const scaledOriginal = ing.original.replace(
      /\d+(\.\d+)?/g,
      scaledAmount.toFixed(2)
    );

    return {
      original: ing.original,
      scaled: scaledOriginal,
      originalAmount: ing.amount,
      scaledAmount,
      unit: ing.unit || "",
      unitLong: ing.measures?.metric?.unitLong || ing.unit || "",
      unitShort: ing.measures?.metric?.unitShort || ing.unit || "",
    };
  });
}

/**
 * Convert ingredient measurements between metric and US units
 *
 * @param amount - Amount to convert
 * @param fromUnit - Source unit system ("metric" or "us")
 * @param toUnit - Target unit system ("metric" or "us")
 * @param ingredient - Ingredient object with measures
 * @returns Converted amount and unit
 */
export function convertUnits(
  amount: number,
  fromUnit: "metric" | "us",
  toUnit: "metric" | "us",
  ingredient?: {
    measures?: {
      metric?: { amount: number; unitLong: string; unitShort: string };
      us?: { amount: number; unitLong: string; unitShort: string };
    };
  }
): { amount: number; unit: string; unitLong: string } {
  if (fromUnit === toUnit || !ingredient?.measures) {
    return {
      amount,
      unit: ingredient?.measures?.[fromUnit]?.unitShort || "",
      unitLong: ingredient?.measures?.[fromUnit]?.unitLong || "",
    };
  }

  // Use the other system's measure if available
  const targetMeasure = ingredient.measures[toUnit];
  if (targetMeasure) {
    const conversionFactor = targetMeasure.amount / (ingredient.measures[fromUnit]?.amount || 1);
    return {
      amount: amount * conversionFactor,
      unit: targetMeasure.unitShort,
      unitLong: targetMeasure.unitLong,
    };
  }

  // Fallback: return original
  return {
    amount,
    unit: ingredient.measures[fromUnit]?.unitShort || "",
    unitLong: ingredient.measures[fromUnit]?.unitLong || "",
  };
}

