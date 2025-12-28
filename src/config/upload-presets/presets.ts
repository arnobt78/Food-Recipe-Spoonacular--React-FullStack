/**
 * Upload Preset Configurations
 * 
 * Predefined upload presets for different use cases
 * Following DEVELOPMENT_RULES.md: Centralized configuration
 */

import { CategorizedPreset } from "./types";

/**
 * Default upload presets for Recipe App
 */
export const UPLOAD_PRESETS: CategorizedPreset[] = [
  // Recipe Image Presets
  {
    id: "recipe_main",
    name: "Recipe Main Image",
    description: "Main recipe image for cards and headers",
    category: "recipe",
    mode: "unsigned",
    folder: "recipe-app/recipes/main",
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 5,
    transformations: {
      width: 800,
      height: 600,
      crop: "fill",
      quality: "auto",
      gravity: "auto",
    },
    overwrite: false,
    useFilename: true,
    uniqueFilename: true,
    useFilenameAsDisplayName: true,
    useAssetFolderAsPublicIdPrefix: false,
    tags: ["recipe", "main"],
    default: true,
  },
  {
    id: "recipe_thumbnail",
    name: "Recipe Thumbnail",
    description: "Small thumbnail for recipe cards",
    category: "recipe",
    mode: "unsigned",
    folder: "recipe-app/recipes/thumbnails",
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 2,
    transformations: {
      width: 312,
      height: 231,
      crop: "fill",
      quality: 80,
      gravity: "auto",
    },
    overwrite: false,
    useFilename: true,
    uniqueFilename: true,
    tags: ["recipe", "thumbnail"],
  },
  {
    id: "recipe_gallery",
    name: "Recipe Gallery Image",
    description: "Full-size gallery images for recipe detail pages",
    category: "gallery",
    mode: "unsigned",
    folder: "recipe-app/recipes/gallery",
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 10,
    transformations: {
      width: 1200,
      height: 800,
      crop: "limit",
      quality: "auto",
    },
    overwrite: false,
    useFilename: true,
    uniqueFilename: true,
    tags: ["recipe", "gallery"],
  },
  {
    id: "recipe_step",
    name: "Recipe Step Image",
    description: "Step-by-step cooking instruction images",
    category: "step-by-step",
    mode: "unsigned",
    folder: "recipe-app/recipes/steps",
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 5,
    transformations: {
      width: 600,
      height: 400,
      crop: "fill",
      quality: 85,
      gravity: "auto",
    },
    overwrite: false,
    useFilename: true,
    uniqueFilename: true,
    tags: ["recipe", "step"],
  },
  {
    id: "recipe_ingredient",
    name: "Ingredient Image",
    description: "Custom ingredient photos",
    category: "ingredient",
    mode: "unsigned",
    folder: "recipe-app/ingredients",
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 3,
    transformations: {
      width: 400,
      height: 400,
      crop: "fill",
      quality: 85,
      gravity: "auto",
    },
    overwrite: false,
    useFilename: true,
    uniqueFilename: true,
    tags: ["ingredient"],
  },
  // Profile Image Presets
  {
    id: "profile_avatar",
    name: "Profile Avatar",
    description: "User profile picture",
    category: "profile",
    mode: "signed",
    folder: "recipe-app/profiles/avatars",
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 2,
    transformations: {
      width: 200,
      height: 200,
      crop: "fill",
      quality: 90,
      gravity: "face",
      radius: "max",
    },
    overwrite: true,
    useFilename: false,
    uniqueFilename: true,
    useFilenameAsDisplayName: false,
    tags: ["profile", "avatar"],
  },
  {
    id: "profile_cover",
    name: "Profile Cover",
    description: "User profile cover image",
    category: "profile",
    mode: "signed",
    folder: "recipe-app/profiles/covers",
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 5,
    transformations: {
      width: 1200,
      height: 400,
      crop: "fill",
      quality: "auto",
      gravity: "auto",
    },
    overwrite: true,
    useFilename: false,
    uniqueFilename: true,
    tags: ["profile", "cover"],
  },
  // Custom Presets
  {
    id: "custom_high_quality",
    name: "Custom High Quality",
    description: "High quality image with no compression",
    category: "custom",
    mode: "unsigned",
    folder: "recipe-app/custom",
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 20,
    transformations: {
      quality: 100,
    },
    overwrite: false,
    useFilename: true,
    uniqueFilename: true,
    tags: ["custom"],
  },
];

/**
 * Get preset by ID
 */
export function getPresetById(id: string): CategorizedPreset | undefined {
  return UPLOAD_PRESETS.find((preset) => preset.id === id);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(
  category: CategorizedPreset["category"]
): CategorizedPreset[] {
  return UPLOAD_PRESETS.filter((preset) => preset.category === category);
}

/**
 * Get default preset
 */
export function getDefaultPreset(): CategorizedPreset | undefined {
  return UPLOAD_PRESETS.find((preset) => preset.default === true);
}

/**
 * Get preset for recipe images
 */
export function getRecipePreset(): CategorizedPreset {
  return getPresetById("recipe_main") || UPLOAD_PRESETS[0];
}

/**
 * Get preset for profile images
 */
export function getProfilePreset(): CategorizedPreset {
  return getPresetById("profile_avatar") || UPLOAD_PRESETS[0];
}

