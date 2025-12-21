/**
 * Unified Next.js API Route Handler
 * 
 * Consolidates ALL API endpoints into a single serverless function.
 * This allows unlimited endpoints on Vercel Hobby plan (counts as 1 function).
 * 
 * Handles all routes:
 * - /api (root)
 * - /api/recipes/search, autocomplete, favourite
 * - /api/recipes/[id]/information, similar, summary
 * - /api/collections/* (all collection routes)
 * - /api/food/wine/dishes, pairing
 * - /api/meal-plan
 * - /api/shopping-list
 * - /api/upload
 * - /api/recipes/images
 * - /api/recipes/notes
 * 
 * All original endpoints preserved - frontend URLs unchanged.
 * Production-ready with proper error handling, CORS, authentication, and type safety.
 */

import { NextRequest, NextResponse } from "next/server";
import { handleCorsPreflight, requireAuth, jsonResponse, getCorsHeaders } from "../../../lib/api-utils-nextjs";
import {
  searchRecipes,
  autocompleteRecipes,
  getRecipeInformation,
  getSimilarRecipes,
  getRecipeSummary,
  getFavouriteRecipesByIDs,
  getDishPairingForWine,
  getWinePairing,
} from "../../../lib/recipe-api";
import { prisma } from "../../../lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Type definitions
interface ShoppingListItem {
  name: string;
  quantity: string;
  unit?: string;
  category: string;
  recipeIds: number[];
  checked?: boolean;
}

/**
 * Helper: Parse search options from query params
 * Extracts all optional search parameters for recipe search
 */
function parseSearchOptions(searchParams: URLSearchParams): Parameters<typeof searchRecipes>[2] {
  const options: Parameters<typeof searchRecipes>[2] = {};
  
  // Boolean options
  if (searchParams.get("fillIngredients") === "true") options.fillIngredients = true;
  if (searchParams.get("addRecipeInformation") === "true") options.addRecipeInformation = true;
  if (searchParams.get("addRecipeInstructions") === "true") options.addRecipeInstructions = true;
  if (searchParams.get("addRecipeNutrition") === "true") options.addRecipeNutrition = true;
  if (searchParams.get("instructionsRequired") === "true") options.instructionsRequired = true;
  if (searchParams.get("ignorePantry") === "true") options.ignorePantry = true;
  
  // String options
  const stringOptions: (keyof typeof options)[] = [
    "cuisine", "excludeCuisine", "diet", "intolerances", "equipment",
    "includeIngredients", "excludeIngredients", "type", "sort",
    "author", "tags", "titleMatch"
  ];
  stringOptions.forEach(key => {
    const value = searchParams.get(key);
    if (value) options[key] = value;
  });
  
  // Sort direction
  const sortDir = searchParams.get("sortDirection");
  if (sortDir === "asc" || sortDir === "desc") {
    options.sortDirection = sortDir;
  }
  
  // Number options
  const numberOptions: (keyof typeof options)[] = [
    "maxReadyTime", "minServings", "maxServings", "minCalories", "maxCalories",
    "minProtein", "maxProtein", "minCarbs", "maxCarbs", "minFat", "maxFat",
    "minAlcohol", "maxAlcohol", "minCaffeine", "maxCaffeine", "minCopper", "maxCopper",
    "minCalcium", "maxCalcium", "minCholine", "maxCholine", "minCholesterol", "maxCholesterol",
    "minFluoride", "maxFluoride", "minSaturatedFat", "maxSaturatedFat",
    "minVitaminA", "maxVitaminA", "minVitaminC", "maxVitaminC", "minVitaminD", "maxVitaminD",
    "minVitaminE", "maxVitaminE", "minVitaminK", "maxVitaminK", "minVitaminB1", "maxVitaminB1",
    "minVitaminB2", "maxVitaminB2", "minVitaminB5", "maxVitaminB5", "minVitaminB3", "maxVitaminB3",
    "minVitaminB6", "maxVitaminB6", "minVitaminB12", "maxVitaminB12",
    "minFiber", "maxFiber", "minFolate", "maxFolate", "minFolicAcid", "maxFolicAcid",
    "minIodine", "maxIodine", "minIron", "maxIron", "minMagnesium", "maxMagnesium",
    "minManganese", "maxManganese", "minPhosphorus", "maxPhosphorus",
    "minPotassium", "maxPotassium", "minSelenium", "maxSelenium", "minSodium", "maxSodium",
    "minSugar", "maxSugar", "minZinc", "maxZinc", "recipeBoxId"
  ];
  numberOptions.forEach(key => {
    const value = searchParams.get(key);
    if (value) {
      const num = parseInt(value, 10);
      if (!isNaN(num)) options[key] = num;
    }
  });
  
  // Remove undefined values
  return Object.fromEntries(
    Object.entries(options).filter(([_, v]) => v !== undefined)
  ) as Parameters<typeof searchRecipes>[2];
}

/**
 * GET Handler - Handles all GET requests
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Performance tracking: Record start time
  const startTime = Date.now();
  
  // Handle CORS preflight
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) return corsResponse;

  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  const searchParams = request.nextUrl.searchParams;

  try {
    // Route: /api (root) - Health check and info
    if (path.length === 0) {
      const html = `
        <h2>Recipe App Backend is running! 🚀</h2>
        <p>Visit <a href="https://github.com/arnobt78/Recipe-Web-App--React-FullStack" target="_blank">GitHub Repo</a> for documentation.</p>
        <h3>Available Endpoints:</h3>
        <ul>
          <li>GET /api/recipes/search?searchTerm=&lt;term&gt;&amp;page=&lt;page&gt;</li>
          <li>GET /api/recipes/[recipeId]/summary</li>
          <li>POST /api/recipes/favourite</li>
          <li>GET /api/recipes/favourite</li>
          <li>DELETE /api/recipes/favourite</li>
        </ul>
      `;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html", ...getCorsHeaders() },
        status: 200,
      });
    }

    // ============================================
    // RECIPE ROUTES
    // ============================================
    
    // Route: /api/recipes/search
    if (path[0] === "recipes" && path[1] === "search") {
      const searchTerm = searchParams.get("searchTerm") || "";
      const page = parseInt(searchParams.get("page") || "0", 10);
      const searchOptions = parseSearchOptions(searchParams);
      
      const results = await searchRecipes(
        searchTerm,
        page,
        Object.keys(searchOptions).length > 0 ? searchOptions : undefined
      );
      
      // Add performance header
      const response = jsonResponse(results);
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // Route: /api/recipes/autocomplete
    if (path[0] === "recipes" && path[1] === "autocomplete") {
      const query = searchParams.get("query");
      const number = parseInt(searchParams.get("number") || "10", 10);

      if (!query || query.trim().length < 2) {
        return jsonResponse({ error: "Query must be at least 2 characters" }, 400);
      }

      if (isNaN(number) || number < 1 || number > 25) {
        return jsonResponse({ error: "Number must be between 1 and 25" }, 400);
      }

      const results = await autocompleteRecipes(query.trim(), number);
      const response = jsonResponse(results);
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // Route: /api/recipes/favourite (GET)
    if (path[0] === "recipes" && path[1] === "favourite") {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const recipes = await prisma.favouriteRecipes.findMany({
        where: { userId: auth.userId! },
        select: { recipeId: true },
      });

      const recipeIds = recipes.map((r) => r.recipeId.toString());
      if (recipeIds.length === 0) {
        return jsonResponse({ results: [] });
      }

      try {
        const favourites = await getFavouriteRecipesByIDs(recipeIds);
        return jsonResponse(favourites);
      } catch (apiError: unknown) {
        const error = apiError as { code?: number; message?: string };
        const isApiLimitError =
          error?.code === 402 ||
          error?.message?.includes("points limit") ||
          error?.message?.includes("daily limit");

        if (isApiLimitError) {
          return jsonResponse({
            results: recipeIds.map((id) => ({
              id: parseInt(id),
              title: `Recipe #${id} (Details unavailable - API limit reached)`,
              image: null,
              _apiUnavailable: true,
            })),
            _message:
              "Your favourites are saved, but recipe details are temporarily unavailable due to API daily limit.",
          });
        }
        throw apiError;
      }
    }

    // Route: /api/recipes/[id]/information
    if (path[0] === "recipes" && path[1] && /^\d+$/.test(path[1]) && path[2] === "information") {
      const recipeId = path[1];
      
      // Validate recipe ID is a positive integer
      const recipeIdNum = parseInt(recipeId, 10);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0) {
        return jsonResponse({ error: "Invalid recipe ID" }, 400);
      }
      
      const options = {
        includeNutrition: searchParams.get("includeNutrition") === "true",
        addWinePairing: searchParams.get("addWinePairing") === "true",
        addTasteData: searchParams.get("addTasteData") === "true",
      };

      const results = await getRecipeInformation(recipeId, options);
      const response = jsonResponse(results);
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // Route: /api/recipes/[id]/similar
    if (path[0] === "recipes" && path[1] && /^\d+$/.test(path[1]) && path[2] === "similar") {
      const recipeId = path[1];
      
      // Validate recipe ID
      const recipeIdNum = parseInt(recipeId, 10);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0) {
        return jsonResponse({ error: "Invalid recipe ID" }, 400);
      }
      
      const number = parseInt(searchParams.get("number") || "10", 10);

      if (isNaN(number) || number < 1 || number > 100) {
        return jsonResponse({ error: "Number must be between 1 and 100" }, 400);
      }

      const results = await getSimilarRecipes(recipeId, number);
      const response = jsonResponse(results);
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // Route: /api/recipes/[id]/summary
    if (path[0] === "recipes" && path[1] && /^\d+$/.test(path[1]) && path[2] === "summary") {
      const recipeId = path[1];
      
      // Validate recipe ID
      const recipeIdNum = parseInt(recipeId, 10);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0) {
        return jsonResponse({ error: "Invalid recipe ID" }, 400);
      }
      
      const results = await getRecipeSummary(recipeId);
      const response = jsonResponse(results);
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // Route: /api/recipes/images (GET)
    if (path[0] === "recipes" && path[1] === "images") {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const recipeId = searchParams.get("recipeId");
      if (!recipeId) {
        return jsonResponse({ error: "Recipe ID is required" }, 400);
      }

      // Validate recipe ID
      const recipeIdNum = parseInt(recipeId, 10);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      const images = await prisma.recipeImage.findMany({
        where: {
          userId: auth.userId!,
          recipeId: recipeIdNum,
        },
        orderBy: [{ imageType: "asc" }, { order: "asc" }],
      });

      const response = jsonResponse(
        images.map((img) => ({
          ...img,
          createdAt: img.createdAt.toISOString(),
          updatedAt: img.updatedAt.toISOString(),
        }))
      );
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // Route: /api/recipes/notes (GET)
    if (path[0] === "recipes" && path[1] === "notes") {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const recipeId = searchParams.get("recipeId");
      if (!recipeId) {
        return jsonResponse({ error: "Recipe ID is required" }, 400);
      }

      // Validate recipe ID
      const recipeIdNum = parseInt(recipeId, 10);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      const note = await prisma.recipeNote.findUnique({
        where: {
          userId_recipeId: {
            userId: auth.userId!,
            recipeId: recipeIdNum,
          },
        },
      });

      if (!note) {
        return jsonResponse({ error: "Note not found" }, 404);
      }

      return jsonResponse({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      });
    }

    // ============================================
    // COLLECTIONS ROUTES
    // ============================================
    
    // Route: /api/collections (GET - list all)
    if (path[0] === "collections" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const collections = await prisma.recipeCollection.findMany({
        where: { userId: auth.userId! },
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const response = jsonResponse(
        collections.map((collection) => ({
          ...collection,
          itemCount: collection._count.items,
          createdAt: collection.createdAt.toISOString(),
          updatedAt: collection.updatedAt.toISOString(),
        }))
      );
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // Route: /api/collections/[id] (GET - collection detail)
    if (path[0] === "collections" && path[1] && path.length === 2) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const collectionId = path[1];
      
      // Validate collection ID format (UUID or string)
      if (!collectionId || collectionId.trim().length === 0) {
        return jsonResponse({ error: "Invalid collection ID" }, 400);
      }
      
      const collection = await prisma.recipeCollection.findFirst({
        where: {
          id: collectionId.trim(),
          userId: auth.userId!,
        },
        include: {
          items: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { items: true },
          },
        },
      });

      if (!collection) {
        return jsonResponse({ error: "Collection not found" }, 404);
      }

      const response = jsonResponse({
        ...collection,
        itemCount: collection._count.items,
        createdAt: collection.createdAt.toISOString(),
        updatedAt: collection.updatedAt.toISOString(),
        items: collection.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      });
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // Route: /api/collections/[id]/items (GET - collection items)
    if (path[0] === "collections" && path[1] && path[2] === "items" && path.length === 3) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const collectionId = path[1];
      
      // Validate collection ID
      if (!collectionId || collectionId.trim().length === 0) {
        return jsonResponse({ error: "Invalid collection ID" }, 400);
      }
      
      const collection = await prisma.recipeCollection.findFirst({
        where: { id: collectionId.trim(), userId: auth.userId! },
      });

      if (!collection) {
        return jsonResponse({ error: "Collection not found" }, 404);
      }

      const items = await prisma.collectionItem.findMany({
        where: { collectionId },
        orderBy: { order: "asc" },
      });

      const response = jsonResponse(
        items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))
      );
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // ============================================
    // FOOD/WINE ROUTES
    // ============================================
    
    // Route: /api/food/wine/dishes
    if (path[0] === "food" && path[1] === "wine" && path[2] === "dishes") {
      const wine = searchParams.get("wine");
      if (!wine || wine.trim().length === 0) {
        return jsonResponse({ error: "Wine type is required" }, 400);
      }
      const results = await getDishPairingForWine(wine);
      return jsonResponse(results);
    }

    // Route: /api/food/wine/pairing
    if (path[0] === "food" && path[1] === "wine" && path[2] === "pairing") {
      const food = searchParams.get("food");
      const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;

      if (!food || food.trim().length === 0) {
        return jsonResponse({ error: "Food name is required" }, 400);
      }

      // Validate food parameter length
      if (food.trim().length > 100) {
        return jsonResponse({ error: "Food name must be less than 100 characters" }, 400);
      }

      if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) {
        return jsonResponse({ error: "maxPrice must be a positive number" }, 400);
      }

      const results = await getWinePairing(food.trim(), maxPrice);
      const response = jsonResponse(results);
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // ============================================
    // MEAL PLAN ROUTES
    // ============================================
    
    // Route: /api/meal-plan (GET)
    if (path[0] === "meal-plan" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const weekStart = searchParams.get("weekStart");
      if (!weekStart) {
        return jsonResponse({ error: "Week start date is required" }, 400);
      }

      // Validate date format
      const weekStartDate = new Date(weekStart);
      if (isNaN(weekStartDate.getTime())) {
        return jsonResponse({ error: "Invalid week start date format. Use ISO 8601 format (YYYY-MM-DD)" }, 400);
      }

      const mealPlan = await prisma.mealPlan.findUnique({
        where: {
          userId_weekStart: {
            userId: auth.userId!,
            weekStart: weekStartDate,
          },
        },
        include: {
          meals: {
            orderBy: [{ dayOfWeek: "asc" }, { mealType: "asc" }, { order: "asc" }],
          },
        },
      });

      if (!mealPlan) {
        return jsonResponse({ error: "Meal plan not found" }, 404);
      }

      const response = jsonResponse({
        ...mealPlan,
        weekStart: mealPlan.weekStart.toISOString(),
        createdAt: mealPlan.createdAt.toISOString(),
        updatedAt: mealPlan.updatedAt.toISOString(),
        meals: mealPlan.meals.map((meal) => ({
          ...meal,
          createdAt: meal.createdAt.toISOString(),
        })),
      });
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // ============================================
    // SHOPPING LIST ROUTES
    // ============================================
    
    // Route: /api/shopping-list (GET)
    if (path[0] === "shopping-list" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const shoppingLists = await prisma.shoppingList.findMany({
        where: { userId: auth.userId! },
        orderBy: { createdAt: "desc" },
      });

      const response = jsonResponse(
        shoppingLists.map((list) => ({
          ...list,
          items: typeof list.items === "string" ? JSON.parse(list.items) : list.items,
          createdAt: list.createdAt.toISOString(),
          updatedAt: list.updatedAt.toISOString(),
        }))
      );
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // Not found
    return jsonResponse({ error: "Not found" }, 404);
  } catch (error) {
    console.error("API GET Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("limit") || errorMessage.includes("402") ? 402 : 500;
    
    // Enhanced error response with request context for debugging
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: errorMessage,
        path: path.join("/"),
      },
      { 
        status: statusCode, 
        headers: {
          ...getCorsHeaders(),
          "Cache-Control": "no-store, no-cache, must-revalidate",
        }
      }
    );
  }
}

/**
 * POST Handler - Handles all POST requests
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) return corsResponse;

  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  
  // Parse request body with size limit protection
  let body: Record<string, unknown> = {};
  try {
    const bodyText = await request.text();
    // Limit request body size to 10MB
    if (bodyText.length > 10 * 1024 * 1024) {
      return new NextResponse(
        JSON.stringify({ error: "Request body too large. Maximum size is 10MB" }),
        { status: 413, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
      );
    }
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch (parseError) {
    if (request.headers.get("content-length") && request.headers.get("content-length") !== "0") {
      return jsonResponse({ error: "Invalid JSON in request body" }, 400);
    }
  }

  try {
    // Route: /api/recipes/favourite (POST)
    if (path[0] === "recipes" && path[1] === "favourite") {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { recipeId } = body;
      if (!recipeId) {
        return jsonResponse({ error: "Recipe ID is required" }, 400);
      }

      // Validate recipe ID
      const recipeIdNum = Number(recipeId);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0 || !Number.isInteger(recipeIdNum)) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      const existing = await prisma.favouriteRecipes.findFirst({
        where: { recipeId: recipeIdNum, userId: auth.userId! },
      });

      if (existing) {
        return jsonResponse({ error: "Recipe is already in favorites" }, 409);
      }

      try {
        const favouriteRecipe = await prisma.favouriteRecipes.create({
          data: { recipeId: recipeIdNum, userId: auth.userId! },
          select: { id: true, recipeId: true, userId: true },
        });
        return jsonResponse(favouriteRecipe, 201);
      } catch (createError: unknown) {
        const error = createError as Error;
        if (error.message.includes("createdAt") || error.message.includes("does not exist")) {
          return jsonResponse({
            error: "Database schema needs migration",
            message: "Please run: npx prisma migrate deploy or npx prisma db push",
            details: error.message,
          }, 500);
        }
        throw createError;
      }
    }

    // Route: /api/collections (POST - create)
    if (path[0] === "collections" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { name, description, color } = body;
      if (!name || !name.trim()) {
        return jsonResponse({ error: "Collection name is required" }, 400);
      }

      // Validate name length
      if (name.trim().length > 100) {
        return jsonResponse({ error: "Collection name must be less than 100 characters" }, 400);
      }

      // Validate description length if provided
      if (description && description.trim().length > 500) {
        return jsonResponse({ error: "Collection description must be less than 500 characters" }, 400);
      }

      const collection = await prisma.recipeCollection.create({
        data: {
          userId: auth.userId!,
          name: name.trim(),
          description: description?.trim() || null,
          color: color || null,
        },
      });

      return jsonResponse({
        ...collection,
        createdAt: collection.createdAt.toISOString(),
        updatedAt: collection.updatedAt.toISOString(),
      }, 201);
    }

    // Route: /api/collections/[id]/items (POST - add item)
    if (path[0] === "collections" && path[1] && path[2] === "items" && path.length === 3) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const collectionId = path[1];
      
      // Validate collection ID
      if (!collectionId || collectionId.trim().length === 0) {
        return jsonResponse({ error: "Invalid collection ID" }, 400);
      }
      
      const collection = await prisma.recipeCollection.findFirst({
        where: { id: collectionId.trim(), userId: auth.userId! },
      });

      if (!collection) {
        return jsonResponse({ error: "Collection not found" }, 404);
      }

      const { recipeId, recipeTitle, recipeImage, order } = body;
      if (!recipeId || !recipeTitle) {
        return jsonResponse({ error: "Recipe ID and title are required" }, 400);
      }

      // Validate recipe ID
      const recipeIdNum = Number(recipeId);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0 || !Number.isInteger(recipeIdNum)) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      // Validate order if provided
      if (order !== undefined && (isNaN(Number(order)) || Number(order) < 0)) {
        return jsonResponse({ error: "Order must be a non-negative number" }, 400);
      }

      const maxOrder = await prisma.collectionItem.findFirst({
        where: { collectionId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const item = await prisma.collectionItem.create({
        data: {
          collectionId,
          recipeId: recipeIdNum,
          recipeTitle: recipeTitle.trim(),
          recipeImage,
          order: order !== undefined ? Number(order) : (maxOrder?.order ?? 0) + 1,
        },
      });

      return jsonResponse({
        ...item,
        createdAt: item.createdAt.toISOString(),
      }, 201);
    }

    // Route: /api/meal-plan (POST)
    if (path[0] === "meal-plan" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { weekStart, recipeId, recipeTitle, recipeImage, dayOfWeek, mealType, servings } = body;

      if (!weekStart || recipeId === undefined || !recipeTitle || dayOfWeek === undefined || !mealType) {
        return jsonResponse({
          error: "Week start, recipe ID, recipe title, day of week, and meal type are required",
        }, 400);
      }

      // Validate recipe ID
      const recipeIdNum = Number(recipeId);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0 || !Number.isInteger(recipeIdNum)) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      // Validate day of week (0-6)
      const dayOfWeekNum = Number(dayOfWeek);
      if (isNaN(dayOfWeekNum) || dayOfWeekNum < 0 || dayOfWeekNum > 6 || !Number.isInteger(dayOfWeekNum)) {
        return jsonResponse({ error: "Day of week must be between 0 and 6" }, 400);
      }

      // Validate servings if provided
      if (servings !== undefined && (isNaN(Number(servings)) || Number(servings) <= 0)) {
        return jsonResponse({ error: "Servings must be a positive number" }, 400);
      }

      // Validate weekStart date
      const weekStartDate = new Date(weekStart);
      if (isNaN(weekStartDate.getTime())) {
        return jsonResponse({ error: "Invalid week start date format" }, 400);
      }

      const mealPlan = await prisma.mealPlan.upsert({
        where: {
          userId_weekStart: {
            userId: auth.userId!,
            weekStart: weekStartDate,
          },
        },
        create: {
          userId: auth.userId!,
          weekStart: weekStartDate,
        },
        update: {},
      });

      const maxOrder = await prisma.mealPlanItem.findFirst({
        where: {
          mealPlanId: mealPlan.id,
          dayOfWeek: dayOfWeekNum,
          mealType,
        },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const mealItem = await prisma.mealPlanItem.create({
        data: {
          mealPlanId: mealPlan.id,
          recipeId: recipeIdNum,
          recipeTitle: recipeTitle.trim(),
          recipeImage,
          dayOfWeek: dayOfWeekNum,
          mealType,
          servings: servings !== undefined ? Number(servings) : 1,
          order: (maxOrder?.order ?? 0) + 1,
        },
      });

      return jsonResponse({
        ...mealItem,
        createdAt: mealItem.createdAt.toISOString(),
      }, 201);
    }

    // Route: /api/shopping-list (POST)
    if (path[0] === "shopping-list" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { name, recipeIds, items } = body;
      if (!name || !recipeIds || !Array.isArray(recipeIds) || !items) {
        return jsonResponse({
          error: "Name, recipe IDs array, and items are required",
        }, 400);
      }

      const shoppingList = await prisma.shoppingList.create({
        data: {
          userId: auth.userId!,
          name: name.trim(),
          recipeIds: recipeIds.map((id: number) => Number(id)),
          items: items,
        },
      });

      return jsonResponse({
        ...shoppingList,
        items: typeof shoppingList.items === "string" ? JSON.parse(shoppingList.items) : shoppingList.items,
        createdAt: shoppingList.createdAt.toISOString(),
        updatedAt: shoppingList.updatedAt.toISOString(),
      }, 201);
    }

    // Route: /api/upload (POST)
    if (path[0] === "upload" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { imageData, folder } = body;
      if (!imageData) {
        return jsonResponse({ error: "Image data is required" }, 400);
      }

      // Validate image data format
      if (typeof imageData !== "string") {
        return jsonResponse({ error: "Image data must be a string" }, 400);
      }

      // Validate base64 data size (max 10MB)
      const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData;
      const imageSizeBytes = (base64Data.length * 3) / 4;
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB
      
      if (imageSizeBytes > maxSizeBytes) {
        return jsonResponse({ 
          error: `Image size exceeds maximum of 10MB. Current size: ${(imageSizeBytes / 1024 / 1024).toFixed(2)}MB` 
        }, 400);
      }

      // Validate folder name if provided
      if (folder && (typeof folder !== "string" || folder.length > 200)) {
        return jsonResponse({ error: "Folder name must be a string less than 200 characters" }, 400);
      }

      const uploadOptions: { folder?: string; [key: string]: unknown } = {
        folder: folder || `recipe-app/${auth.userId}`,
      };

      const uploadResult = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Data}`,
        uploadOptions
      );

      return jsonResponse({
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
      });
    }

    // Route: /api/recipes/images (POST)
    if (path[0] === "recipes" && path[1] === "images") {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { recipeId, imageUrl, imageType, order, caption } = body;
      if (!recipeId || !imageUrl || !imageType) {
        return jsonResponse({
          error: "Recipe ID, image URL, and image type are required",
        }, 400);
      }

      // Validate recipe ID
      const recipeIdNum = Number(recipeId);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0 || !Number.isInteger(recipeIdNum)) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      // Validate image URL format
      try {
        new URL(imageUrl);
      } catch {
        return jsonResponse({ error: "Invalid image URL format" }, 400);
      }

      // Validate image type
      const validImageTypes = ["main", "step", "ingredient", "other"];
      if (!validImageTypes.includes(imageType)) {
        return jsonResponse({ 
          error: `Invalid image type. Must be one of: ${validImageTypes.join(", ")}` 
        }, 400);
      }

      // Validate order if provided
      if (order !== undefined && (isNaN(Number(order)) || Number(order) < 0)) {
        return jsonResponse({ error: "Order must be a non-negative number" }, 400);
      }

      const maxOrder = await prisma.recipeImage.findFirst({
        where: {
          userId: auth.userId!,
          recipeId: recipeIdNum,
          imageType,
        },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const image = await prisma.recipeImage.create({
        data: {
          userId: auth.userId!,
          recipeId: recipeIdNum,
          imageUrl,
          imageType,
          order: order !== undefined ? Number(order) : (maxOrder?.order ?? 0) + 1,
          caption: caption?.trim(),
        },
      });

      return jsonResponse({
        ...image,
        createdAt: image.createdAt.toISOString(),
        updatedAt: image.updatedAt.toISOString(),
      }, 201);
    }

    // Route: /api/recipes/notes (POST)
    if (path[0] === "recipes" && path[1] === "notes") {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { recipeId, title, content, rating, tags } = body;
      if (!recipeId) {
        return jsonResponse({ error: "Recipe ID is required" }, 400);
      }

      // Validate recipe ID
      const recipeIdNum = Number(recipeId);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0 || !Number.isInteger(recipeIdNum)) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      if (!content || !content.trim()) {
        return jsonResponse({ error: "Note content is required" }, 400);
      }

      // Validate content length
      if (content.trim().length > 10000) {
        return jsonResponse({ error: "Note content must be less than 10,000 characters" }, 400);
      }

      // Validate title length if provided
      if (title && title.trim().length > 200) {
        return jsonResponse({ error: "Note title must be less than 200 characters" }, 400);
      }

      // Validate rating
      if (rating !== undefined) {
        const ratingNum = Number(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5 || !Number.isInteger(ratingNum)) {
          return jsonResponse({ error: "Rating must be an integer between 1 and 5" }, 400);
        }
      }

      // Validate tags if provided
      if (tags !== undefined && (!Array.isArray(tags) || tags.length > 20)) {
        return jsonResponse({ error: "Tags must be an array with maximum 20 items" }, 400);
      }

      const note = await prisma.recipeNote.upsert({
        where: {
          userId_recipeId: {
            userId: auth.userId!,
            recipeId: recipeIdNum,
          },
        },
        update: {
          title: title?.trim(),
          content: content.trim(),
          rating: rating !== undefined ? Number(rating) : undefined,
          tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
        },
        create: {
          userId: auth.userId!,
          recipeId: recipeIdNum,
          title: title?.trim(),
          content: content.trim(),
          rating: rating !== undefined ? Number(rating) : undefined,
          tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
        },
      });

      return jsonResponse({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      });
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (error) {
    console.error("API POST Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
        path: path.join("/"),
      },
      {
        status: 500,
        headers: {
          ...getCorsHeaders(),
          "Cache-Control": "no-store, no-cache, must-revalidate",
        }
      }
    );
  }
}

/**
 * PUT Handler - Handles all PUT requests
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) return corsResponse;

  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  
  // Parse request body with size limit protection
  let body: Record<string, unknown> = {};
  try {
    const bodyText = await request.text();
    // Limit request body size to 10MB
    if (bodyText.length > 10 * 1024 * 1024) {
      return new NextResponse(
        JSON.stringify({ error: "Request body too large. Maximum size is 10MB" }),
        { status: 413, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
      );
    }
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch (parseError) {
    if (request.headers.get("content-length") && request.headers.get("content-length") !== "0") {
      return jsonResponse({ error: "Invalid JSON in request body" }, 400);
    }
  }

  try {
    // Route: /api/collections/[id] (PUT - update collection)
    if (path[0] === "collections" && path[1] && path.length === 2) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const collectionId = path[1];
      const { name, description, color } = body;

      const collection = await prisma.recipeCollection.updateMany({
        where: {
          id: collectionId,
          userId: auth.userId!,
        },
        data: {
          ...(name && { name: name.trim() }),
          ...(description !== undefined && { description: description?.trim() }),
          ...(color !== undefined && { color }),
        },
      });

      if (collection.count === 0) {
        return jsonResponse({ error: "Collection not found" }, 404);
      }

      const updated = await prisma.recipeCollection.findUnique({
        where: { id: collectionId },
      });

      return jsonResponse({
        ...updated,
        createdAt: updated!.createdAt.toISOString(),
        updatedAt: updated!.updatedAt.toISOString(),
      });
    }

    // Route: /api/shopping-list (PUT - update)
    if (path[0] === "shopping-list" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { id, name, items, isCompleted } = body;
      if (!id) {
        return jsonResponse({ error: "Shopping list ID is required" }, 400);
      }

      // Validate shopping list ID
      if (typeof id !== "string" && typeof id !== "number") {
        return jsonResponse({ error: "Invalid shopping list ID format" }, 400);
      }

      const existing = await prisma.shoppingList.findFirst({
        where: { id: String(id), userId: auth.userId! },
      });

      if (!existing) {
        return jsonResponse({ error: "Shopping list not found" }, 404);
      }

      const updates: {
        name?: string;
        items?: ShoppingListItem[];
        isCompleted?: boolean;
      } = {};
      
      if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0) {
          return jsonResponse({ error: "Name must be a non-empty string" }, 400);
        }
        if (name.trim().length > 200) {
          return jsonResponse({ error: "Name must be less than 200 characters" }, 400);
        }
        updates.name = name.trim();
      }
      
      if (items !== undefined) {
        if (!Array.isArray(items)) {
          return jsonResponse({ error: "Items must be an array" }, 400);
        }
        updates.items = items;
      }
      
      if (isCompleted !== undefined) {
        if (typeof isCompleted !== "boolean") {
          return jsonResponse({ error: "isCompleted must be a boolean" }, 400);
        }
        updates.isCompleted = isCompleted;
      }

      const updated = await prisma.shoppingList.update({
        where: { id: String(id) },
        data: updates,
      });

      return jsonResponse({
        ...updated,
        items: typeof updated.items === "string" ? JSON.parse(updated.items) : updated.items,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (error) {
    console.error("API PUT Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
        path: path.join("/"),
      },
      {
        status: 500,
        headers: {
          ...getCorsHeaders(),
          "Cache-Control": "no-store, no-cache, must-revalidate",
        }
      }
    );
  }
}

/**
 * DELETE Handler - Handles all DELETE requests
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) return corsResponse;

  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  
  // Parse request body with size limit protection
  let body: Record<string, unknown> = {};
  try {
    const bodyText = await request.text();
    // Limit request body size to 10MB
    if (bodyText.length > 10 * 1024 * 1024) {
      return new NextResponse(
        JSON.stringify({ error: "Request body too large. Maximum size is 10MB" }),
        { status: 413, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
      );
    }
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch (parseError) {
    if (request.headers.get("content-length") && request.headers.get("content-length") !== "0") {
      return jsonResponse({ error: "Invalid JSON in request body" }, 400);
    }
  }

  try {
    // Route: /api/recipes/favourite (DELETE)
    if (path[0] === "recipes" && path[1] === "favourite") {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { recipeId } = body;
      if (!recipeId) {
        return jsonResponse({ error: "Recipe ID is required" }, 400);
      }

      // Validate recipe ID
      const recipeIdNum = Number(recipeId);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0 || !Number.isInteger(recipeIdNum)) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      const existing = await prisma.favouriteRecipes.findFirst({
        where: { recipeId: recipeIdNum, userId: auth.userId! },
      });

      if (existing) {
        await prisma.favouriteRecipes.delete({ where: { id: existing.id } });
      }

      return new NextResponse(null, { status: 204, headers: getCorsHeaders() });
    }

    // Route: /api/collections/[id] (DELETE)
    if (path[0] === "collections" && path[1] && path.length === 2) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const collectionId = path[1];
      const deleted = await prisma.recipeCollection.deleteMany({
        where: {
          id: collectionId,
          userId: auth.userId!,
        },
      });

      if (deleted.count === 0) {
        return jsonResponse({ error: "Collection not found" }, 404);
      }

      return new NextResponse(null, { status: 204, headers: getCorsHeaders() });
    }

    // Route: /api/collections/[id]/items (DELETE)
    if (path[0] === "collections" && path[1] && path[2] === "items" && path.length === 3) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const collectionId = path[1];
      
      // Validate collection ID
      if (!collectionId || collectionId.trim().length === 0) {
        return jsonResponse({ error: "Invalid collection ID" }, 400);
      }
      
      const collection = await prisma.recipeCollection.findFirst({
        where: { id: collectionId.trim(), userId: auth.userId! },
      });

      if (!collection) {
        return jsonResponse({ error: "Collection not found" }, 404);
      }

      const { recipeId } = body;
      if (!recipeId) {
        return jsonResponse({ error: "Recipe ID is required" }, 400);
      }

      const deleted = await prisma.collectionItem.deleteMany({
        where: {
          collectionId,
          recipeId: Number(recipeId),
        },
      });

      if (deleted.count === 0) {
        return jsonResponse({ error: "Item not found in collection" }, 404);
      }

      return new NextResponse(null, { status: 204, headers: getCorsHeaders() });
    }

    // Route: /api/meal-plan (DELETE)
    if (path[0] === "meal-plan" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { itemId } = body;
      if (!itemId) {
        return jsonResponse({ error: "Item ID is required" }, 400);
      }

      const item = await prisma.mealPlanItem.findUnique({
        where: { id: itemId },
        include: { mealPlan: true },
      });

      if (!item || item.mealPlan.userId !== auth.userId!) {
        return jsonResponse({ error: "Meal plan item not found" }, 404);
      }

      await prisma.mealPlanItem.delete({
        where: { id: itemId },
      });

      return new NextResponse(null, { status: 204, headers: getCorsHeaders() });
    }

    // Route: /api/shopping-list (DELETE)
    if (path[0] === "shopping-list" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { id } = body;
      if (!id) {
        return jsonResponse({ error: "Shopping list ID is required" }, 400);
      }

      // Validate ID format
      if (typeof id !== "string" && typeof id !== "number") {
        return jsonResponse({ error: "Invalid shopping list ID format" }, 400);
      }

      const existing = await prisma.shoppingList.findFirst({
        where: { id: String(id), userId: auth.userId! },
      });

      if (!existing) {
        return jsonResponse({ error: "Shopping list not found" }, 404);
      }

      await prisma.shoppingList.delete({
        where: { id: String(id) },
      });

      return new NextResponse(null, { status: 204, headers: getCorsHeaders() });
    }

    // Route: /api/recipes/images (DELETE)
    if (path[0] === "recipes" && path[1] === "images") {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { id } = body;
      if (!id) {
        return jsonResponse({ error: "Image ID is required" }, 400);
      }

      // Validate ID format
      if (typeof id !== "string" && typeof id !== "number") {
        return jsonResponse({ error: "Invalid image ID format" }, 400);
      }

      const existing = await prisma.recipeImage.findFirst({
        where: { id: String(id), userId: auth.userId! },
      });

      if (!existing) {
        return jsonResponse({ error: "Image not found" }, 404);
      }

      await prisma.recipeImage.delete({
        where: { id: String(id) },
      });

      return new NextResponse(null, { status: 204, headers: getCorsHeaders() });
    }

    // Route: /api/recipes/notes (DELETE)
    if (path[0] === "recipes" && path[1] === "notes") {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { recipeId } = body;
      if (!recipeId) {
        return jsonResponse({ error: "Recipe ID is required" }, 400);
      }

      // Validate recipe ID
      const recipeIdNum = Number(recipeId);
      if (isNaN(recipeIdNum) || recipeIdNum <= 0 || !Number.isInteger(recipeIdNum)) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      const deleted = await prisma.recipeNote.deleteMany({
        where: {
          userId: auth.userId!,
          recipeId: recipeIdNum,
        },
      });

      if (deleted.count === 0) {
        return jsonResponse({ error: "Note not found" }, 404);
      }

      return new NextResponse(null, { status: 204, headers: getCorsHeaders() });
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (error) {
    console.error("API DELETE Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
        path: path.join("/"),
      },
      {
        status: 500,
        headers: {
          ...getCorsHeaders(),
          "Cache-Control": "no-store, no-cache, must-revalidate",
        }
      }
    );
  }
}

/**
 * OPTIONS Handler - Handles CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}
