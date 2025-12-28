# Upload Presets Configuration

This folder contains the upload preset system for managing different image upload configurations in the Recipe App.

## Structure

```bash
upload-presets/
├── types.ts          # TypeScript type definitions
├── presets.ts        # Preset configurations
├── utils.ts          # Utility functions
├── index.ts          # Module exports
└── README.md         # This file
```

## Overview

Upload presets define a set of parameters to apply during image uploads. Define once, and easily use on any upload flow.

### Features

- **Multiple Presets**: Different configurations for recipes, profiles, galleries, etc.
- **Transformations**: Automatic image resizing, cropping, quality optimization
- **Validation**: File type and size validation per preset
- **Categories**: Organized by use case (recipe, profile, gallery, etc.)
- **Type Safety**: Full TypeScript support

## Available Presets

### Recipe Presets

- **recipe_main**: Main recipe image (800x600)
- **recipe_thumbnail**: Thumbnail for cards (312x231)
- **recipe_gallery**: Full-size gallery images (1200x800)
- **recipe_step**: Step-by-step images (600x400)
- **recipe_ingredient**: Ingredient photos (400x400)

### Profile Presets

- **profile_avatar**: User avatar (200x200, circular)
- **profile_cover**: Profile cover image (1200x400)

### Custom Presets

- **custom_high_quality**: High quality with no compression

## Usage

### Basic Usage

```typescript
import {
  getPresetById,
  presetToCloudinaryOptions,
} from "@/config/upload-presets";
import { uploadImage } from "@/api";

// Get a preset
const preset = getPresetById("recipe_main");

// Upload with preset
const result = await uploadImage(file, { presetId: "recipe_main" });
```

### With Validation

```typescript
import {
  validateFileAgainstPreset,
  getPresetById,
} from "@/config/upload-presets";

const preset = getPresetById("recipe_main");
const validation = validateFileAgainstPreset(file, preset);

if (!validation.valid) {
  console.error(validation.error);
  return;
}

// Proceed with upload
```

### Get Presets by Category

```typescript
import { getPresetsByCategory } from "@/config/upload-presets";

const recipePresets = getPresetsByCategory("recipe");
```

## Adding New Presets

1. Open `presets.ts`
2. Add a new preset object to the `UPLOAD_PRESETS` array:

```typescript
{
  id: "my_custom_preset",
  name: "My Custom Preset",
  description: "Description of what this preset does",
  category: "custom",
  mode: "unsigned",
  folder: "recipe-app/custom",
  allowedFormats: ["image/jpeg", "image/png", "image/webp"],
  maxFileSize: 5,
  transformations: {
    width: 800,
    height: 600,
    crop: "fill",
    quality: "auto",
    format: "auto",
  },
  overwrite: false,
  useFilename: true,
  uniqueFilename: true,
  tags: ["custom"],
}
```

## Preset Properties

- **id**: Unique identifier
- **name**: Display name
- **description**: Optional description
- **category**: Preset category
- **mode**: "unsigned" or "signed"
- **folder**: Cloudinary folder path
- **allowedFormats**: Array of MIME types
- **maxFileSize**: Maximum file size in MB
- **transformations**: Image transformation options
- **overwrite**: Whether to overwrite existing files
- **useFilename**: Use original filename
- **uniqueFilename**: Generate unique filename
- **tags**: Array of tags for organization

## API Integration

The upload API endpoint (`/api/upload`) accepts a `presetId` parameter:

```typescript
POST /api/upload
{
  "imageData": "base64...",
  "presetId": "recipe_main",
  "recipeId": 123  // Optional
}
```

The API will automatically apply the preset's transformations and settings.

## Best Practices

1. **Use Presets**: Always use presets instead of hardcoding upload options
2. **Validate First**: Always validate files against presets before upload
3. **Choose Appropriate Preset**: Select the preset that matches your use case
4. **Default Preset**: Use `getDefaultPreset()` for general uploads
5. **Categories**: Use categories to organize presets in UI

## Future Enhancements

- [ ] User-defined custom presets
- [ ] Preset management UI
- [ ] Preset templates
- [ ] Batch upload with presets
- [ ] Preset analytics
