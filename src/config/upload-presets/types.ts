/**
 * Upload Preset Types
 * 
 * Defines types and interfaces for upload preset configurations
 * Following DEVELOPMENT_RULES.md: Centralized types, strict TypeScript
 */

/**
 * Upload mode - determines how images are processed
 */
export type UploadMode = "unsigned" | "signed";

/**
 * Image transformation options for Cloudinary
 */
export interface ImageTransformation {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb" | "limit" | "pad";
  quality?: number | "auto";
  format?: "jpg" | "png" | "webp" | "gif" | "auto";
  gravity?: "auto" | "face" | "center" | "north" | "south" | "east" | "west";
  radius?: number;
  effect?: string;
  overlay?: string;
  background?: string;
}

/**
 * Upload preset configuration
 */
export interface UploadPreset {
  id: string;
  name: string;
  description?: string;
  mode: UploadMode;
  folder: string;
  allowedFormats: string[];
  maxFileSize: number; // in MB
  transformations?: ImageTransformation;
  overwrite?: boolean;
  useFilename?: boolean;
  uniqueFilename?: boolean;
  useFilenameAsDisplayName?: boolean;
  useAssetFolderAsPublicIdPrefix?: boolean;
  tags?: string[];
  context?: Record<string, string>;
  eager?: ImageTransformation[]; // Generate multiple variants
  default?: boolean; // Is this the default preset?
  lastUpdated?: string;
}

/**
 * Upload preset category
 */
export type PresetCategory = 
  | "recipe" 
  | "profile" 
  | "gallery" 
  | "step-by-step" 
  | "ingredient" 
  | "custom";

/**
 * Preset with category
 */
export interface CategorizedPreset extends UploadPreset {
  category: PresetCategory;
}

/**
 * Upload result
 */
export interface UploadResult {
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  secureUrl: string;
  eager?: Array<{
    url: string;
    secureUrl: string;
    width: number;
    height: number;
  }>;
}

