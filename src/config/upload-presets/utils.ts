/**
 * Upload Preset Utilities
 * 
 * Helper functions for working with upload presets
 * Following DEVELOPMENT_RULES.md: Centralized utilities
 */

import { UploadPreset } from "./types";
import { getPresetById } from "./presets";

/**
 * Convert preset transformations to Cloudinary upload options
 */
export function presetToCloudinaryOptions(
  preset: UploadPreset,
  userId?: string
): Record<string, unknown> {
  const options: Record<string, unknown> = {
    folder: preset.folder,
    overwrite: preset.overwrite ?? false,
    use_filename: preset.useFilename ?? false,
    unique_filename: preset.uniqueFilename ?? true,
    use_filename_as_display_name: preset.useFilenameAsDisplayName ?? false,
    use_asset_folder_as_public_id_prefix:
      preset.useAssetFolderAsPublicIdPrefix ?? false,
  };

  // Add transformations if provided
  if (preset.transformations) {
    const transform = preset.transformations;
    if (transform.width) options.width = transform.width;
    if (transform.height) options.height = transform.height;
    if (transform.crop) options.crop = transform.crop;
    if (transform.quality) options.quality = transform.quality;
    if (transform.format) options.format = transform.format;
    if (transform.gravity) options.gravity = transform.gravity;
    if (transform.radius) options.radius = transform.radius;
    if (transform.effect) options.effect = transform.effect;
    if (transform.overlay) options.overlay = transform.overlay;
    if (transform.background) options.background = transform.background;
  }

  // Add eager transformations if provided
  if (preset.eager && preset.eager.length > 0) {
    options.eager = preset.eager.map((t) => {
      const eagerOpts: Record<string, unknown> = {};
      if (t.width) eagerOpts.width = t.width;
      if (t.height) eagerOpts.height = t.height;
      if (t.crop) eagerOpts.crop = t.crop;
      if (t.quality) eagerOpts.quality = t.quality;
      if (t.format) eagerOpts.format = t.format;
      return eagerOpts;
    });
  }

  // Add tags if provided
  if (preset.tags && preset.tags.length > 0) {
    options.tags = preset.tags.join(",");
  }

  // Add context if provided
  if (preset.context) {
    options.context = Object.entries(preset.context)
      .map(([key, value]) => `${key}=${value}`)
      .join("|");
  }

  // Add user ID to folder if provided
  if (userId && preset.folder) {
    options.folder = `${preset.folder}/${userId}`;
  }

  return options;
}

/**
 * Validate file against preset requirements
 */
export function validateFileAgainstPreset(
  file: File,
  preset: UploadPreset
): { valid: boolean; error?: string } {
  // Check file type
  if (!preset.allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${preset.allowedFormats.join(", ")}`,
    };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > preset.maxFileSize) {
    return {
      valid: false,
      error: `File size ${fileSizeMB.toFixed(2)}MB exceeds maximum ${preset.maxFileSize}MB`,
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get preset display name
 */
export function getPresetDisplayName(presetId: string): string {
  const preset = getPresetById(presetId);
  return preset?.name || presetId;
}

/**
 * Check if preset requires signed upload
 */
export function isSignedPreset(preset: UploadPreset): boolean {
  return preset.mode === "signed";
}

/**
 * Generate upload folder path with user ID
 */
export function generateUploadFolder(
  preset: UploadPreset,
  userId?: string,
  recipeId?: number
): string {
  let folder = preset.folder;
  
  if (userId) {
    folder = `${folder}/${userId}`;
  }
  
  if (recipeId) {
    folder = `${folder}/${recipeId}`;
  }
  
  return folder;
}

