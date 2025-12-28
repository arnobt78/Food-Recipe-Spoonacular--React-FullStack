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
import {
  handleCorsPreflight,
  requireAuth,
  jsonResponse,
  getCorsHeaders,
} from "../../../lib/api-utils-nextjs";
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
import { Prisma } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import {
  getPresetById,
  presetToCloudinaryOptions,
} from "../../../src/config/upload-presets";

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Type definitions
// ShoppingListItem interface - kept for future reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface _ShoppingListItem {
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
function parseSearchOptions(
  searchParams: URLSearchParams
): Parameters<typeof searchRecipes>[2] {
  const options: Parameters<typeof searchRecipes>[2] = {};

  // Boolean options
  if (searchParams.get("fillIngredients") === "true")
    options.fillIngredients = true;
  if (searchParams.get("addRecipeInformation") === "true")
    options.addRecipeInformation = true;
  if (searchParams.get("addRecipeInstructions") === "true")
    options.addRecipeInstructions = true;
  if (searchParams.get("addRecipeNutrition") === "true")
    options.addRecipeNutrition = true;
  if (searchParams.get("instructionsRequired") === "true")
    options.instructionsRequired = true;
  if (searchParams.get("ignorePantry") === "true") options.ignorePantry = true;

  // String options
  const stringOptions = [
    "cuisine",
    "excludeCuisine",
    "diet",
    "intolerances",
    "equipment",
    "includeIngredients",
    "excludeIngredients",
    "type",
    "sort",
    "author",
    "tags",
    "titleMatch",
  ] as const;
  stringOptions.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      (options as Record<string, string>)[key] = value;
    }
  });

  // Sort direction
  const sortDir = searchParams.get("sortDirection");
  if (sortDir === "asc" || sortDir === "desc") {
    options.sortDirection = sortDir;
  }

  // Number options
  const numberOptions = [
    "maxReadyTime",
    "minServings",
    "maxServings",
    "minCalories",
    "maxCalories",
    "minProtein",
    "maxProtein",
    "minCarbs",
    "maxCarbs",
    "minFat",
    "maxFat",
    "minAlcohol",
    "maxAlcohol",
    "minCaffeine",
    "maxCaffeine",
    "minCopper",
    "maxCopper",
    "minCalcium",
    "maxCalcium",
    "minCholine",
    "maxCholine",
    "minCholesterol",
    "maxCholesterol",
    "minFluoride",
    "maxFluoride",
    "minSaturatedFat",
    "maxSaturatedFat",
    "minVitaminA",
    "maxVitaminA",
    "minVitaminC",
    "maxVitaminC",
    "minVitaminD",
    "maxVitaminD",
    "minVitaminE",
    "maxVitaminE",
    "minVitaminK",
    "maxVitaminK",
    "minVitaminB1",
    "maxVitaminB1",
    "minVitaminB2",
    "maxVitaminB2",
    "minVitaminB5",
    "maxVitaminB5",
    "minVitaminB3",
    "maxVitaminB3",
    "minVitaminB6",
    "maxVitaminB6",
    "minVitaminB12",
    "maxVitaminB12",
    "minFiber",
    "maxFiber",
    "minFolate",
    "maxFolate",
    "minFolicAcid",
    "maxFolicAcid",
    "minIodine",
    "maxIodine",
    "minIron",
    "maxIron",
    "minMagnesium",
    "maxMagnesium",
    "minManganese",
    "maxManganese",
    "minPhosphorus",
    "maxPhosphorus",
    "minPotassium",
    "maxPotassium",
    "minSelenium",
    "maxSelenium",
    "minSodium",
    "maxSodium",
    "minSugar",
    "maxSugar",
    "minZinc",
    "maxZinc",
    "recipeBoxId",
  ] as const;
  numberOptions.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        (options as Record<string, number>)[key] = num;
      }
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
        searchOptions && Object.keys(searchOptions).length > 0
          ? searchOptions
          : undefined
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
        return jsonResponse(
          { error: "Query must be at least 2 characters" },
          400
        );
      }

      if (isNaN(number) || number < 1 || number > 25) {
        return jsonResponse({ error: "Number must be between 1 and 25" }, 400);
      }

      const results = await autocompleteRecipes(query.trim(), number);
      const response = jsonResponse(results);
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
      return response;
    }

    // Route: /api/ai/search - AI-powered natural language recipe search
    if (path[0] === "ai" && path[1] === "search") {
      const query = searchParams.get("query");
      if (!query || query.trim().length < 3) {
        return jsonResponse(
          { error: "Query must be at least 3 characters" },
          400
        );
      }

      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
      const groqApiKey = process.env.GROQ_LLAMA_API_KEY;

      if (!openRouterApiKey && !geminiApiKey && !groqApiKey) {
        return jsonResponse(
          {
            error:
              "No AI API keys configured (OpenRouter, Gemini, or Groq required)",
          },
          500
        );
      }

      try {
        // System prompt for recipe search conversion
        const systemPrompt =
          "You are a recipe search assistant. Convert natural language queries into optimized recipe search terms for the Spoonacular API. Extract key information like: dish type, dietary requirements, ingredients, cooking time, cuisine type, meal type. Return ONLY a JSON object with these fields: { searchTerm: string, diet?: string, cuisine?: string, maxReadyTime?: number, type?: string, excludeIngredients?: string, includeIngredients?: string }";
        const userPrompt = `Convert this recipe search query into optimized search parameters: "${query.trim()}"`;

        let aiContent = "{}";
        let searchParams: Record<string, unknown> | null = null;

        // Fallback chain: OpenRouter (Claude) -> OpenRouter (GPT) -> Gemini -> Groq
        // Try OpenRouter with Claude first
        if (openRouterApiKey) {
          try {
            const aiResponse = await fetch(
              "https://openrouter.ai/api/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${openRouterApiKey}`,
                  "HTTP-Referer":
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
                  "X-Title": "Recipe Smart App",
                },
                body: JSON.stringify({
                  model: "anthropic/claude-3.5-sonnet",
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                  ],
                  temperature: 0.3,
                  max_tokens: 200,
                }),
              }
            );

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              aiContent = aiData.choices?.[0]?.message?.content || "{}";
              try {
                searchParams = JSON.parse(aiContent);
              } catch {
                // Try parsing with regex if direct parse fails
                const jsonMatch = aiContent.match(/{[\s\S]*}/);
                if (jsonMatch) searchParams = JSON.parse(jsonMatch[0]);
              }
            }
          } catch (openRouterError) {
            console.warn(
              "OpenRouter Claude failed, trying GPT fallback:",
              openRouterError
            );
          }

          // If Claude failed, try GPT-4o-mini on OpenRouter
          if (!searchParams && openRouterApiKey) {
            try {
              const fallbackResponse = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${openRouterApiKey}`,
                    "HTTP-Referer":
                      process.env.NEXT_PUBLIC_API_URL ||
                      "http://localhost:3000",
                    "X-Title": "Recipe Smart App",
                  },
                  body: JSON.stringify({
                    model: "openai/gpt-4o-mini",
                    messages: [
                      { role: "system", content: systemPrompt },
                      { role: "user", content: userPrompt },
                    ],
                    temperature: 0.3,
                    max_tokens: 200,
                  }),
                }
              );

              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                aiContent = fallbackData.choices?.[0]?.message?.content || "{}";
                try {
                  searchParams = JSON.parse(aiContent);
                } catch {
                  const jsonMatch = aiContent.match(/{[\s\S]*}/);
                  if (jsonMatch) searchParams = JSON.parse(jsonMatch[0]);
                }
              }
            } catch (gptError) {
              console.warn("OpenRouter GPT failed, trying Gemini:", gptError);
            }
          }
        }

        // Fallback to Gemini if OpenRouter failed
        if (!searchParams && geminiApiKey) {
          try {
            const geminiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                    },
                  ],
                  generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 200,
                  },
                }),
              }
            );

            if (geminiResponse.ok) {
              const geminiData = await geminiResponse.json();
              aiContent =
                geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
              try {
                const jsonMatch =
                  aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                  aiContent.match(/{[\s\S]*}/);
                searchParams = JSON.parse(
                  jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                );
              } catch {
                // Parse failed, will use fallback below
              }
            }
          } catch (geminiError) {
            console.warn("Gemini failed, trying Groq:", geminiError);
          }
        }

        // Final fallback to Groq
        if (!searchParams && groqApiKey) {
          try {
            const groqResponse = await fetch(
              "https://api.groq.com/openai/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${groqApiKey}`,
                },
                body: JSON.stringify({
                  model: "llama-3.1-70b-versatile",
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                  ],
                  temperature: 0.3,
                  max_tokens: 200,
                }),
              }
            );

            if (groqResponse.ok) {
              const groqData = await groqResponse.json();
              aiContent = groqData.choices?.[0]?.message?.content || "{}";
              try {
                const jsonMatch =
                  aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                  aiContent.match(/{[\s\S]*}/);
                searchParams = JSON.parse(
                  jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                );
              } catch {
                // Parse failed, will use fallback below
              }
            }
          } catch (groqError) {
            console.warn("Groq failed, using simple fallback:", groqError);
          }
        }

        // If all AI providers failed, use simple fallback
        if (!searchParams) {
          searchParams = { searchTerm: query.trim() };
        }

        // Perform search with AI-optimized parameters
        const searchOptions: Parameters<typeof searchRecipes>[2] = {};
        if (searchParams && typeof searchParams.diet === "string")
          searchOptions.diet = searchParams.diet;
        if (searchParams && typeof searchParams.cuisine === "string")
          searchOptions.cuisine = searchParams.cuisine;
        if (searchParams && typeof searchParams.maxReadyTime === "number")
          searchOptions.maxReadyTime = searchParams.maxReadyTime;
        if (searchParams && typeof searchParams.type === "string")
          searchOptions.type = searchParams.type;
        if (searchParams && typeof searchParams.excludeIngredients === "string")
          searchOptions.excludeIngredients = searchParams.excludeIngredients;
        if (searchParams && typeof searchParams.includeIngredients === "string")
          searchOptions.includeIngredients = searchParams.includeIngredients;

        const results = await searchRecipes(
          (searchParams && typeof searchParams.searchTerm === "string"
            ? searchParams.searchTerm
            : null) || query.trim(),
          1,
          Object.keys(searchOptions).length > 0 ? searchOptions : undefined
        );

        const response = jsonResponse({
          results: results.results || [],
          totalResults: results.totalResults || 0,
          offset: results.offset || 0,
          number: results.number || 0,
          aiOptimized: true,
          originalQuery: query.trim(),
          searchParams: searchParams,
        });
        response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
        return response;
      } catch (error) {
        console.error("AI search error:", error);
        return jsonResponse(
          {
            error: "AI search failed",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          500
        );
      }
    }

    // Route: /api/ai/recommendations - AI-powered recipe recommendations
    if (path[0] === "ai" && path[1] === "recommendations") {
      // Support both GET (query params) and POST (body) for flexibility
      let query = searchParams.get("query") || "";
      let ingredients = searchParams.get("ingredients");
      let diet = searchParams.get("diet");
      let cuisine = searchParams.get("cuisine");
      let maxTime = searchParams.get("maxTime");
      let excludeIngredients = searchParams.get("excludeIngredients");

      // If POST request, also check body for parameters (body takes precedence)
      if (request.method === "POST") {
        try {
          const body = await request.json().catch(() => ({}));
          if (body.query) query = body.query;
          if (body.ingredients) ingredients = body.ingredients;
          if (body.diet) diet = body.diet;
          if (body.cuisine) cuisine = body.cuisine;
          if (body.maxTime) maxTime = body.maxTime?.toString();
          if (body.excludeIngredients)
            excludeIngredients = body.excludeIngredients;
        } catch (_e) {
          // If body parsing fails, use query params only
        }
      }

      // At least query or ingredients must be provided
      if (!query.trim() && !ingredients?.trim()) {
        return jsonResponse(
          { error: "Either query or ingredients parameter is required" },
          400
        );
      }

      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
      const groqApiKey = process.env.GROQ_LLAMA_API_KEY;

      if (!openRouterApiKey && !geminiApiKey && !groqApiKey) {
        return jsonResponse(
          {
            error:
              "No AI API keys configured (OpenRouter, Gemini, or Groq required)",
          },
          500
        );
      }

      try {
        // Build context for AI recommendation
        let recommendationContext = "";
        if (query.trim()) {
          recommendationContext += `User request: "${query.trim()}"\n`;
        }
        if (ingredients?.trim()) {
          recommendationContext += `Available ingredients: ${ingredients.trim()}\n`;
        }
        if (diet?.trim()) {
          recommendationContext += `Dietary preference: ${diet.trim()}\n`;
        }
        if (cuisine?.trim()) {
          recommendationContext += `Cuisine preference: ${cuisine.trim()}\n`;
        }
        if (maxTime?.trim()) {
          recommendationContext += `Maximum cooking time: ${maxTime.trim()} minutes\n`;
        }
        if (excludeIngredients?.trim()) {
          recommendationContext += `Exclude ingredients: ${excludeIngredients.trim()}\n`;
        }

        const systemPrompt =
          "You are a recipe recommendation assistant. Based on the user's context, generate a JSON object with search parameters optimized for the Spoonacular recipe API. Return ONLY a JSON object with these fields: { searchTerm: string, diet?: string, cuisine?: string, maxReadyTime?: number, includeIngredients?: string, excludeIngredients?: string, type?: string, number?: number (default 10) }";
        const fullPrompt = recommendationContext + `\n${systemPrompt}`;

        // Fallback chain: OpenRouter (Claude) -> OpenRouter (GPT) -> Gemini -> Groq
        let aiResponseData: Record<string, unknown> | null = null;

        // Try OpenRouter with Claude first
        if (openRouterApiKey && !aiResponseData) {
          try {
            const openRouterResponse = await fetch(
              "https://openrouter.ai/api/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${openRouterApiKey}`,
                  "HTTP-Referer":
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
                  "X-Title": "Recipe Smart App",
                },
                body: JSON.stringify({
                  model: "anthropic/claude-3.5-sonnet",
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: recommendationContext },
                  ],
                  temperature: 0.7,
                  max_tokens: 200,
                }),
              }
            );

            if (openRouterResponse.ok) {
              const openRouterData = await openRouterResponse.json();
              const aiContent =
                openRouterData.choices?.[0]?.message?.content || "{}";
              try {
                const jsonMatch =
                  aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                  aiContent.match(/{[\s\S]*}/);
                aiResponseData = JSON.parse(
                  jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                );
              } catch {
                // Parse failed, will try next provider
              }
            }
          } catch (openRouterError) {
            console.warn(
              "OpenRouter Claude failed, trying GPT:",
              openRouterError
            );
          }

          // If Claude failed, try GPT-4o-mini on OpenRouter
          if (!aiResponseData && openRouterApiKey) {
            try {
              const gptResponse = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${openRouterApiKey}`,
                    "HTTP-Referer":
                      process.env.NEXT_PUBLIC_API_URL ||
                      "http://localhost:3000",
                    "X-Title": "Recipe Smart App",
                  },
                  body: JSON.stringify({
                    model: "openai/gpt-4o-mini",
                    messages: [
                      { role: "system", content: systemPrompt },
                      { role: "user", content: recommendationContext },
                    ],
                    temperature: 0.7,
                    max_tokens: 200,
                  }),
                }
              );

              if (gptResponse.ok) {
                const gptData = await gptResponse.json();
                const aiContent =
                  gptData.choices?.[0]?.message?.content || "{}";
                try {
                  const jsonMatch =
                    aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                    aiContent.match(/{[\s\S]*}/);
                  aiResponseData = JSON.parse(
                    jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                  );
                } catch {
                  // Parse failed, will try next provider
                }
              }
            } catch (gptError) {
              console.warn("OpenRouter GPT failed, trying Gemini:", gptError);
            }
          }
        }

        // Fallback to Gemini if OpenRouter failed
        if (!aiResponseData && geminiApiKey) {
          try {
            const geminiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [{ text: fullPrompt }],
                    },
                  ],
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                  },
                }),
              }
            );

            if (geminiResponse.ok) {
              const geminiData = await geminiResponse.json();
              const aiContent =
                geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
              try {
                const jsonMatch =
                  aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                  aiContent.match(/{[\s\S]*}/);
                aiResponseData = JSON.parse(
                  jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                );
              } catch {
                // Parse failed, will try next provider
              }
            }
          } catch (geminiError) {
            console.warn("Gemini failed, trying Groq:", geminiError);
          }
        }

        // Final fallback to Groq
        if (!aiResponseData && groqApiKey) {
          try {
            const groqResponse = await fetch(
              "https://api.groq.com/openai/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${groqApiKey}`,
                },
                body: JSON.stringify({
                  model: "llama-3.1-70b-versatile",
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: recommendationContext },
                  ],
                  temperature: 0.7,
                  max_tokens: 200,
                }),
              }
            );

            if (groqResponse.ok) {
              const groqData = await groqResponse.json();
              const aiContent = groqData.choices?.[0]?.message?.content || "{}";
              try {
                const jsonMatch =
                  aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                  aiContent.match(/{[\s\S]*}/);
                aiResponseData = JSON.parse(
                  jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                );
              } catch {
                // Parse failed, will use fallback below
              }
            }
          } catch (groqError) {
            console.warn("Groq failed, using simple fallback:", groqError);
          }
        }

        // If all AI providers failed, use simple fallback
        if (!aiResponseData) {
          aiResponseData = {
            searchTerm: query.trim() || ingredients?.trim() || "recipes",
            number: 10,
          };
          if (diet) aiResponseData.diet = diet;
          if (cuisine) aiResponseData.cuisine = cuisine;
          if (maxTime) aiResponseData.maxReadyTime = parseInt(maxTime, 10);
          if (ingredients) aiResponseData.includeIngredients = ingredients;
          if (excludeIngredients)
            aiResponseData.excludeIngredients = excludeIngredients;
        }

        // Perform search with AI-optimized parameters
        const searchOptions: Parameters<typeof searchRecipes>[2] = {
          fillIngredients: true,
          addRecipeInformation: true,
          addRecipeNutrition: true,
        };
        if (aiResponseData && typeof aiResponseData.diet === "string")
          searchOptions.diet = aiResponseData.diet;
        if (aiResponseData && typeof aiResponseData.cuisine === "string")
          searchOptions.cuisine = aiResponseData.cuisine;
        if (aiResponseData && typeof aiResponseData.maxReadyTime === "number")
          searchOptions.maxReadyTime = aiResponseData.maxReadyTime;
        if (aiResponseData && typeof aiResponseData.type === "string")
          searchOptions.type = aiResponseData.type;
        if (
          aiResponseData &&
          typeof aiResponseData.excludeIngredients === "string"
        )
          searchOptions.excludeIngredients = aiResponseData.excludeIngredients;
        if (
          aiResponseData &&
          typeof aiResponseData.includeIngredients === "string"
        )
          searchOptions.includeIngredients = aiResponseData.includeIngredients;

        const number =
          (aiResponseData && typeof aiResponseData.number === "number"
            ? aiResponseData.number
            : null) || 10;
        const results = await searchRecipes(
          (aiResponseData && typeof aiResponseData.searchTerm === "string"
            ? aiResponseData.searchTerm
            : null) ||
            query.trim() ||
            ingredients?.trim() ||
            "recipes",
          1,
          Object.keys(searchOptions).length > 0 ? searchOptions : undefined
        );

        // Generate AI explanation for recommendations
        const reason = query.trim()
          ? `Recommended based on: "${query.trim()}"`
          : ingredients?.trim()
          ? `Recommended based on available ingredients: ${ingredients.trim()}`
          : "Personalized recommendations for you";

        const response = jsonResponse({
          recipes: (results.results || []).slice(0, number),
          reason: reason,
          context: recommendationContext.trim(),
        });
        response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
        return response;
      } catch (error) {
        console.error("AI recommendations error:", error);
        return jsonResponse(
          {
            error: "AI recommendations failed",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          500
        );
      }
    }

    // Route: /api/ai/analysis - AI-powered recipe analysis (nutrition, health, substitutions, allergens)
    if (path[0] === "ai" && path[1] === "analysis") {
      const recipeId = searchParams.get("recipeId");
      if (!recipeId || isNaN(Number(recipeId))) {
        return jsonResponse(
          { error: "Valid recipeId parameter is required" },
          400
        );
      }

      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
      const huggingFaceApiKey = process.env.HUGGING_FACE_INFERENCE_API_KEY;

      if (!openRouterApiKey && !geminiApiKey && !huggingFaceApiKey) {
        return jsonResponse(
          {
            error:
              "No AI API keys configured (OpenRouter, Gemini, or Hugging Face required)",
          },
          500
        );
      }

      try {
        // Fetch recipe information for analysis context
        const recipeInfo = await getRecipeInformation(recipeId, {
          includeNutrition: true,
        });

        if (!recipeInfo) {
          return jsonResponse({ error: "Recipe not found" }, 404);
        }

        // Build analysis context
        const analysisContext = `Analyze this recipe:

Title: ${recipeInfo.title || "Unknown"}
Servings: ${recipeInfo.servings || "Unknown"}
Ready in minutes: ${recipeInfo.readyInMinutes || "Unknown"}

Ingredients:
${
  recipeInfo.extendedIngredients
    ?.map(
      (ing: { original?: string; name?: string }) =>
        `- ${ing.original || ing.name || ""}`
    )
    .join("\n") || "Not available"
}

Nutrition (per serving):
${
  recipeInfo.nutrition
    ? JSON.stringify(
        recipeInfo.nutrition.nutrients?.slice(0, 10) || [],
        null,
        2
      )
    : "Not available"
}

Dietary Information:
${recipeInfo.vegan ? "- Vegan" : ""}
${recipeInfo.vegetarian ? "- Vegetarian" : ""}
${recipeInfo.glutenFree ? "- Gluten-free" : ""}
${recipeInfo.dairyFree ? "- Dairy-free" : ""}
${recipeInfo.ketogenic ? "- Ketogenic" : ""}

Provide a comprehensive analysis in JSON format with these fields:
{
  "healthScore": { "score": 0-100, "explanation": "string" },
  "nutritionAnalysis": { "summary": "string", "strengths": ["string"], "concerns": ["string"] },
  "ingredientSubstitutions": [{"original": "string", "substitute": "string", "reason": "string", "dietaryBenefit": "string"}],
  "allergens": [{"allergen": "string", "severity": "low|medium|high", "sources": ["string"]}],
  "cookingDifficulty": { "level": "beginner|intermediate|advanced", "explanation": "string", "tips": ["string"] },
  "timeValidation": { "estimatedTime": number, "discrepancy": "string" }
}

Return ONLY valid JSON, no other text.`;

        const systemPrompt =
          "You are a nutrition and cooking expert. Analyze recipes and provide comprehensive insights. Return ONLY valid JSON, no other text.";

        let analysisData: Record<string, unknown> | null = null;

        // Fallback chain: OpenRouter (Claude) -> OpenRouter (GPT) -> Gemini -> Hugging Face (simple fallback)
        // Try OpenRouter with Claude first
        if (openRouterApiKey && !analysisData) {
          try {
            const openRouterResponse = await fetch(
              "https://openrouter.ai/api/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${openRouterApiKey}`,
                  "HTTP-Referer":
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
                  "X-Title": "Recipe Smart App",
                },
                body: JSON.stringify({
                  model: "anthropic/claude-3.5-sonnet",
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: analysisContext },
                  ],
                  temperature: 0.7,
                  max_tokens: 1000,
                }),
              }
            );

            if (openRouterResponse.ok) {
              const openRouterResult = await openRouterResponse.json();
              const aiContent =
                openRouterResult.choices?.[0]?.message?.content || "{}";
              try {
                const jsonMatch =
                  aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                  aiContent.match(/{[\s\S]*}/);
                analysisData = JSON.parse(
                  jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                ) as Record<string, unknown>;
              } catch {
                // Parse failed, try next provider
              }
            }
          } catch (openRouterError) {
            console.warn(
              "OpenRouter Claude failed, trying GPT:",
              openRouterError
            );
          }

          // Try GPT-4o-mini on OpenRouter if Claude failed
          if (!analysisData && openRouterApiKey) {
            try {
              const gptResponse = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${openRouterApiKey}`,
                    "HTTP-Referer":
                      process.env.NEXT_PUBLIC_API_URL ||
                      "http://localhost:3000",
                    "X-Title": "Recipe Smart App",
                  },
                  body: JSON.stringify({
                    model: "openai/gpt-4o-mini",
                    messages: [
                      { role: "system", content: systemPrompt },
                      { role: "user", content: analysisContext },
                    ],
                    temperature: 0.7,
                    max_tokens: 1000,
                  }),
                }
              );

              if (gptResponse.ok) {
                const gptResult = await gptResponse.json();
                const aiContent =
                  gptResult.choices?.[0]?.message?.content || "{}";
                try {
                  const jsonMatch =
                    aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                    aiContent.match(/{[\s\S]*}/);
                  analysisData = JSON.parse(
                    jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                  );
                } catch {
                  // Parse failed, try next provider
                }
              }
            } catch (gptError) {
              console.warn("OpenRouter GPT failed, trying Gemini:", gptError);
            }
          }
        }

        // Fallback to Gemini
        if (!analysisData && geminiApiKey) {
          try {
            const geminiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        { text: `${systemPrompt}\n\n${analysisContext}` },
                      ],
                    },
                  ],
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                  },
                }),
              }
            );

            if (geminiResponse.ok) {
              const geminiResult = await geminiResponse.json();
              const aiContent =
                geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
              try {
                const jsonMatch =
                  aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                  aiContent.match(/{[\s\S]*}/);
                analysisData = JSON.parse(
                  jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                );
              } catch {
                // Parse failed, use fallback
              }
            }
          } catch (geminiError) {
            console.warn("Gemini failed, using simple fallback:", geminiError);
          }
        }

        // If all AI providers failed, use simple fallback based on recipe data
        if (!analysisData) {
          analysisData = {
            healthScore: {
              score: recipeInfo.healthScore || 50,
              explanation: "Health score based on recipe nutritional data",
            },
            nutritionAnalysis: {
              summary: "Nutritional analysis based on available recipe data",
              strengths: recipeInfo.veryHealthy
                ? ["Recipe is marked as very healthy"]
                : [],
              concerns: [],
            },
            allergens: (() => {
              const allergens: Array<{
                allergen: string;
                severity: "low" | "medium" | "high";
                sources?: string[];
              }> = [];
              if (!recipeInfo.glutenFree)
                allergens.push({ allergen: "gluten", severity: "medium" });
              if (!recipeInfo.dairyFree)
                allergens.push({ allergen: "dairy", severity: "medium" });
              return allergens;
            })(),
            cookingDifficulty: {
              level:
                recipeInfo.readyInMinutes && recipeInfo.readyInMinutes > 60
                  ? "advanced"
                  : recipeInfo.readyInMinutes && recipeInfo.readyInMinutes > 30
                  ? "intermediate"
                  : "beginner",
              explanation: "Difficulty estimated based on cooking time",
              tips: [],
            },
          };
        }

        const response = jsonResponse(analysisData);
        response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
        return response;
      } catch (error) {
        console.error("AI analysis error:", error);
        return jsonResponse(
          {
            error: "AI analysis failed",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          500
        );
      }
    }

    // Route: /api/ai/modifications - AI-powered recipe modifications (dietary conversion, simplification)
    if (path[0] === "ai" && path[1] === "modifications") {
      const recipeId = searchParams.get("recipeId");
      const modificationType = searchParams.get("type"); // "dietary" or "simplify"
      const targetDiet = searchParams.get("diet"); // e.g., "vegan", "keto", "gluten-free"

      if (!recipeId || isNaN(Number(recipeId))) {
        return jsonResponse(
          { error: "Valid recipeId parameter is required" },
          400
        );
      }

      if (
        !modificationType ||
        !["dietary", "simplify"].includes(modificationType)
      ) {
        return jsonResponse(
          { error: "Valid type parameter required (dietary or simplify)" },
          400
        );
      }

      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
      const huggingFaceApiKey = process.env.HUGGING_FACE_INFERENCE_API_KEY;

      if (!openRouterApiKey && !geminiApiKey && !huggingFaceApiKey) {
        return jsonResponse(
          {
            error:
              "No AI API keys configured (OpenRouter, Gemini, or Hugging Face required)",
          },
          500
        );
      }

      try {
        // Fetch recipe information for modification context
        const recipeInfo = await getRecipeInformation(recipeId, {
          includeNutrition: true,
        });

        if (!recipeInfo) {
          return jsonResponse({ error: "Recipe not found" }, 404);
        }

        // Build modification context
        const modificationContext =
          modificationType === "dietary"
            ? `Convert this recipe to ${targetDiet || "vegan"} diet:

Title: ${recipeInfo.title || "Unknown"}
Servings: ${recipeInfo.servings || "Unknown"}
Ready in minutes: ${recipeInfo.readyInMinutes || "Unknown"}

Ingredients:
${
  recipeInfo.extendedIngredients
    ?.map(
      (ing: { original?: string; name?: string }) =>
        `- ${ing.original || ing.name || ""}`
    )
    .join("\n") || "Not available"
}

Instructions:
${
  recipeInfo.instructions ||
  recipeInfo.analyzedInstructions
    ?.map((inst: { steps: Array<{ step: string }> }) =>
      inst.steps.map((s) => s.step).join("\n")
    )
    .join("\n\n") ||
  "Not available"
}

Convert this recipe to ${
                targetDiet || "vegan"
              } while maintaining flavor and texture. Provide:
1. Modified ingredients list with substitutions
2. Updated instructions if needed
3. Brief explanation of changes

Return JSON format:
{
  "modifiedIngredients": [{"original": "string", "substitute": "string", "reason": "string"}],
  "modifiedInstructions": "string",
  "explanation": "string"
}
Return ONLY valid JSON, no other text.`
            : `Simplify this recipe for beginners:

Title: ${recipeInfo.title || "Unknown"}
Servings: ${recipeInfo.servings || "Unknown"}
Ready in minutes: ${recipeInfo.readyInMinutes || "Unknown"}

Ingredients:
${
  recipeInfo.extendedIngredients
    ?.map(
      (ing: { original?: string; name?: string }) =>
        `- ${ing.original || ing.name || ""}`
    )
    .join("\n") || "Not available"
}

Instructions:
${
  recipeInfo.instructions ||
  recipeInfo.analyzedInstructions
    ?.map((inst: { steps: Array<{ step: string }> }) =>
      inst.steps.map((s) => s.step).join("\n")
    )
    .join("\n\n") ||
  "Not available"
}

Simplify this recipe for beginner cooks. Use simpler ingredients, clearer instructions, and fewer steps. Provide:
1. Simplified ingredients list
2. Step-by-step simplified instructions
3. Tips for beginners

Return JSON format:
{
  "simplifiedIngredients": [{"original": "string", "simplified": "string", "reason": "string"}],
  "simplifiedInstructions": "string",
  "tips": ["string"]
}
Return ONLY valid JSON, no other text.`;

        const systemPrompt =
          modificationType === "dietary"
            ? "You are a culinary expert specializing in dietary recipe conversions. Convert recipes to specific dietary requirements while maintaining taste and nutrition. Return ONLY valid JSON, no other text."
            : "You are a cooking instructor. Simplify complex recipes for beginner cooks with clear instructions and tips. Return ONLY valid JSON, no other text.";

        let modificationData: Record<string, unknown> | null = null;

        // Fallback chain: OpenRouter (Claude) -> OpenRouter (GPT) -> Gemini -> Hugging Face (simple fallback)
        if (openRouterApiKey && !modificationData) {
          try {
            const openRouterResponse = await fetch(
              "https://openrouter.ai/api/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${openRouterApiKey}`,
                  "HTTP-Referer":
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
                  "X-Title": "Recipe Smart App",
                },
                body: JSON.stringify({
                  model: "anthropic/claude-3.5-sonnet",
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: modificationContext },
                  ],
                  temperature: 0.7,
                  max_tokens: 1500,
                }),
              }
            );

            if (openRouterResponse.ok) {
              const openRouterResult = await openRouterResponse.json();
              const aiContent =
                openRouterResult.choices?.[0]?.message?.content || "{}";
              try {
                const jsonMatch =
                  aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                  aiContent.match(/{[\s\S]*}/);
                modificationData = JSON.parse(
                  jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                );
              } catch {
                // Parse failed, try next provider
              }
            }
          } catch (openRouterError) {
            console.warn(
              "OpenRouter Claude failed, trying GPT:",
              openRouterError
            );
          }

          // Try GPT-4o-mini on OpenRouter if Claude failed
          if (!modificationData && openRouterApiKey) {
            try {
              const gptResponse = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${openRouterApiKey}`,
                    "HTTP-Referer":
                      process.env.NEXT_PUBLIC_API_URL ||
                      "http://localhost:3000",
                    "X-Title": "Recipe Smart App",
                  },
                  body: JSON.stringify({
                    model: "openai/gpt-4o-mini",
                    messages: [
                      { role: "system", content: systemPrompt },
                      { role: "user", content: modificationContext },
                    ],
                    temperature: 0.7,
                    max_tokens: 1500,
                  }),
                }
              );

              if (gptResponse.ok) {
                const gptResult = await gptResponse.json();
                const aiContent =
                  gptResult.choices?.[0]?.message?.content || "{}";
                try {
                  const jsonMatch =
                    aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                    aiContent.match(/{[\s\S]*}/);
                  modificationData = JSON.parse(
                    jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                  );
                } catch {
                  // Parse failed, try next provider
                }
              }
            } catch (gptError) {
              console.warn("OpenRouter GPT failed, trying Gemini:", gptError);
            }
          }
        }

        // Fallback to Gemini
        if (!modificationData && geminiApiKey) {
          try {
            const geminiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        {
                          text: `${systemPrompt}\n\n${modificationContext}`,
                        },
                      ],
                    },
                  ],
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1500,
                  },
                }),
              }
            );

            if (geminiResponse.ok) {
              const geminiResult = await geminiResponse.json();
              const aiContent =
                geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
              try {
                const jsonMatch =
                  aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                  aiContent.match(/{[\s\S]*}/);
                modificationData = JSON.parse(
                  jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent
                );
              } catch {
                // Parse failed, use fallback
              }
            }
          } catch (geminiError) {
            console.warn("Gemini failed, using simple fallback:", geminiError);
          }
        }

        // Simple fallback if all AI providers failed
        if (!modificationData) {
          modificationData =
            modificationType === "dietary"
              ? {
                  modifiedIngredients: [],
                  modifiedInstructions: recipeInfo.instructions || "",
                  explanation:
                    "Dietary conversion not available. Please check recipe ingredients manually.",
                }
              : {
                  simplifiedIngredients: [],
                  simplifiedInstructions: recipeInfo.instructions || "",
                  tips: ["Follow the original recipe instructions carefully."],
                };
        }

        const response = jsonResponse(modificationData);
        response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
        return response;
      } catch (error) {
        console.error("AI modification error:", error);
        return jsonResponse(
          {
            error: "AI modification failed",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          500
        );
      }
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
    if (
      path[0] === "recipes" &&
      path[1] &&
      /^\d+$/.test(path[1]) &&
      path[2] === "information"
    ) {
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
    if (
      path[0] === "recipes" &&
      path[1] &&
      /^\d+$/.test(path[1]) &&
      path[2] === "similar"
    ) {
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
    if (
      path[0] === "recipes" &&
      path[1] &&
      /^\d+$/.test(path[1]) &&
      path[2] === "summary"
    ) {
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
        // Return 200 with null instead of 404 when note doesn't exist
        return jsonResponse(null);
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
    if (
      path[0] === "collections" &&
      path[1] &&
      path[2] === "items" &&
      path.length === 3
    ) {
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
      const maxPrice = searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice")!)
        : undefined;

      if (!food || food.trim().length === 0) {
        return jsonResponse({ error: "Food name is required" }, 400);
      }

      // Validate food parameter length
      if (food.trim().length > 100) {
        return jsonResponse(
          { error: "Food name must be less than 100 characters" },
          400
        );
      }

      if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) {
        return jsonResponse(
          { error: "maxPrice must be a positive number" },
          400
        );
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
        return jsonResponse(
          {
            error:
              "Invalid week start date format. Use ISO 8601 format (YYYY-MM-DD)",
          },
          400
        );
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
            orderBy: [
              { dayOfWeek: "asc" },
              { mealType: "asc" },
              { order: "asc" },
            ],
          },
        },
      });

      // Return empty meal plan structure if not found (graceful handling)
      if (!mealPlan) {
        const emptyMealPlan = {
          id: null,
          userId: auth.userId!,
          weekStart: weekStartDate.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          meals: [],
        };
        const response = jsonResponse(emptyMealPlan);
        response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
        return response;
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
          items:
            typeof list.items === "string"
              ? JSON.parse(list.items)
              : list.items,
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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const statusCode =
      errorMessage.includes("limit") || errorMessage.includes("402")
        ? 402
        : 500;

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
        },
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
        JSON.stringify({
          error: "Request body too large. Maximum size is 10MB",
        }),
        {
          status: 413,
          headers: { ...getCorsHeaders(), "Content-Type": "application/json" },
        }
      );
    }
    body = bodyText ? JSON.parse(bodyText) : {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_parseError) {
    if (
      request.headers.get("content-length") &&
      request.headers.get("content-length") !== "0"
    ) {
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
      if (
        isNaN(recipeIdNum) ||
        recipeIdNum <= 0 ||
        !Number.isInteger(recipeIdNum)
      ) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      const existing = await prisma.favouriteRecipes.findFirst({
        where: { recipeId: recipeIdNum, userId: auth.userId! },
      });

      if (existing) {
        return jsonResponse({ error: "Recipe is already in favorites" }, 409);
      }

      // Ensure User exists in database before creating FavouriteRecipes
      // This handles the case where a user authenticates but hasn't been created in our DB yet
      try {
        const authHeader = request.headers.get("authorization");
        let userEmail = `user-${auth.userId}@temp.local`; // Temporary email fallback
        let userName: string | undefined;
        let userPicture: string | undefined;

        // Try to extract user info from JWT token if available
        if (authHeader) {
          try {
            const cleanToken = authHeader.replace(/^Bearer\s+/i, "");
            const parts = cleanToken.split(".");
            if (parts.length === 3) {
              const payload = JSON.parse(
                Buffer.from(parts[1], "base64url").toString("utf-8")
              ) as {
                sub?: string;
                email?: string;
                name?: string;
                picture?: string;
                aud?: string | string[];
                iss?: string;
                exp?: number;
              };
              if (payload.email) userEmail = payload.email;
              if (payload.name) userName = payload.name;
              if (payload.picture) userPicture = payload.picture;
            }
          } catch (_e) {
            // If we can't decode token, use fallback
            console.warn(
              "Could not extract user info from token, using fallback"
            );
          }
        }

        // Upsert User to ensure it exists
        await prisma.user.upsert({
          where: { id: auth.userId! },
          update: {
            // Update email, name, picture if we have them and they're different
            ...(userEmail !== `user-${auth.userId}@temp.local` && {
              email: userEmail,
            }),
            ...(userName && { name: userName }),
            ...(userPicture && { picture: userPicture }),
          },
          create: {
            id: auth.userId!,
            email: userEmail,
            name: userName,
            picture: userPicture,
          },
        });

        const favouriteRecipe = await prisma.favouriteRecipes.create({
          data: { recipeId: recipeIdNum, userId: auth.userId! },
          select: { id: true, recipeId: true, userId: true },
        });
        return jsonResponse(favouriteRecipe, 201);
      } catch (createError: unknown) {
        const error = createError as Error;
        if (
          error.message.includes("createdAt") ||
          error.message.includes("does not exist")
        ) {
          return jsonResponse(
            {
              error: "Database schema needs migration",
              message:
                "Please run: npx prisma migrate deploy or npx prisma db push",
              details: error.message,
            },
            500
          );
        }
        throw createError;
      }
    }

    // Route: /api/collections (POST - create)
    if (path[0] === "collections" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { name, description, color } = body;
      if (!name || typeof name !== "string" || !name.trim()) {
        return jsonResponse({ error: "Collection name is required" }, 400);
      }

      // Validate name length
      if (name.trim().length > 100) {
        return jsonResponse(
          { error: "Collection name must be less than 100 characters" },
          400
        );
      }

      // Validate description length if provided
      if (
        description &&
        typeof description === "string" &&
        description.trim().length > 500
      ) {
        return jsonResponse(
          { error: "Collection description must be less than 500 characters" },
          400
        );
      }

      const collection = await prisma.recipeCollection.create({
        data: {
          userId: auth.userId!,
          name: name.trim(),
          description:
            (typeof description === "string" ? description.trim() : null) ||
            null,
          color: (typeof color === "string" ? color : null) || null,
        },
      });

      return jsonResponse(
        {
          ...collection,
          createdAt: collection.createdAt.toISOString(),
          updatedAt: collection.updatedAt.toISOString(),
        },
        201
      );
    }

    // Route: /api/collections/[id]/items (POST - add item)
    if (
      path[0] === "collections" &&
      path[1] &&
      path[2] === "items" &&
      path.length === 3
    ) {
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
      if (!recipeId || !recipeTitle || typeof recipeTitle !== "string") {
        return jsonResponse({ error: "Recipe ID and title are required" }, 400);
      }

      // Validate recipe ID
      const recipeIdNum = Number(recipeId);
      if (
        isNaN(recipeIdNum) ||
        recipeIdNum <= 0 ||
        !Number.isInteger(recipeIdNum)
      ) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      // Validate order if provided
      if (order !== undefined && (isNaN(Number(order)) || Number(order) < 0)) {
        return jsonResponse(
          { error: "Order must be a non-negative number" },
          400
        );
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
          recipeImage: typeof recipeImage === "string" ? recipeImage : null,
          order:
            order !== undefined ? Number(order) : (maxOrder?.order ?? 0) + 1,
        },
      });

      return jsonResponse(
        {
          ...item,
          createdAt: item.createdAt.toISOString(),
        },
        201
      );
    }

    // Route: /api/meal-plan (POST)
    if (path[0] === "meal-plan" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const {
        weekStart,
        recipeId,
        recipeTitle,
        recipeImage,
        dayOfWeek,
        mealType,
        servings,
      } = body;

      if (
        !weekStart ||
        typeof weekStart !== "string" ||
        recipeId === undefined ||
        !recipeTitle ||
        typeof recipeTitle !== "string" ||
        dayOfWeek === undefined ||
        !mealType
      ) {
        return jsonResponse(
          {
            error:
              "Week start, recipe ID, recipe title, day of week, and meal type are required",
          },
          400
        );
      }

      // Validate recipe ID
      const recipeIdNum = Number(recipeId);
      if (
        isNaN(recipeIdNum) ||
        recipeIdNum <= 0 ||
        !Number.isInteger(recipeIdNum)
      ) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      // Validate day of week (0-6)
      const dayOfWeekNum = Number(dayOfWeek);
      if (
        isNaN(dayOfWeekNum) ||
        dayOfWeekNum < 0 ||
        dayOfWeekNum > 6 ||
        !Number.isInteger(dayOfWeekNum)
      ) {
        return jsonResponse(
          { error: "Day of week must be between 0 and 6" },
          400
        );
      }

      // Validate servings if provided
      if (
        servings !== undefined &&
        (isNaN(Number(servings)) || Number(servings) <= 0)
      ) {
        return jsonResponse(
          { error: "Servings must be a positive number" },
          400
        );
      }

      // Validate weekStart date
      const weekStartDate = new Date(weekStart as string);
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
          recipeImage: typeof recipeImage === "string" ? recipeImage : null,
          dayOfWeek: dayOfWeekNum,
          mealType: typeof mealType === "string" ? mealType : "",
          servings: servings !== undefined ? Number(servings) : 1,
          order: (maxOrder?.order ?? 0) + 1,
        },
      });

      return jsonResponse(
        {
          ...mealItem,
          createdAt: mealItem.createdAt.toISOString(),
        },
        201
      );
    }

    // Route: /api/shopping-list (POST)
    if (path[0] === "shopping-list" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { name, recipeIds, items } = body;
      if (
        !name ||
        typeof name !== "string" ||
        !recipeIds ||
        !Array.isArray(recipeIds) ||
        !items
      ) {
        return jsonResponse(
          {
            error: "Name, recipe IDs array, and items are required",
          },
          400
        );
      }

      const shoppingList = await prisma.shoppingList.create({
        data: {
          userId: auth.userId!,
          name: name.trim(),
          recipeIds: recipeIds.map((id: number) => Number(id)),
          items: items,
        },
      });

      return jsonResponse(
        {
          ...shoppingList,
          items:
            typeof shoppingList.items === "string"
              ? JSON.parse(shoppingList.items)
              : shoppingList.items,
          createdAt: shoppingList.createdAt.toISOString(),
          updatedAt: shoppingList.updatedAt.toISOString(),
        },
        201
      );
    }

    // Route: /api/upload (POST)
    if (path[0] === "upload" && path.length === 1) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { imageData, folder, presetId, recipeId } = body;
      if (!imageData) {
        return jsonResponse({ error: "Image data is required" }, 400);
      }

      // Validate image data format
      if (typeof imageData !== "string") {
        return jsonResponse({ error: "Image data must be a string" }, 400);
      }

      // Validate base64 data size (max 10MB)
      const base64Data = imageData.includes(",")
        ? imageData.split(",")[1]
        : imageData;
      const imageSizeBytes = (base64Data.length * 3) / 4;
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB

      if (imageSizeBytes > maxSizeBytes) {
        return jsonResponse(
          {
            error: `Image size exceeds maximum of 10MB. Current size: ${(
              imageSizeBytes /
              1024 /
              1024
            ).toFixed(2)}MB`,
          },
          400
        );
      }

      // Validate folder name if provided
      if (folder && (typeof folder !== "string" || folder.length > 200)) {
        return jsonResponse(
          { error: "Folder name must be a string less than 200 characters" },
          400
        );
      }

      // Validate presetId if provided
      if (presetId && typeof presetId !== "string") {
        return jsonResponse({ error: "Preset ID must be a string" }, 400);
      }

      // Get preset if presetId is provided
      let preset = null;
      if (presetId && typeof presetId === "string") {
        preset = getPresetById(presetId);
        if (!preset) {
          return jsonResponse(
            { error: `Upload preset "${presetId}" not found` },
            400
          );
        }

        // Validate file size against preset
        const fileSizeMB = imageSizeBytes / (1024 * 1024);
        if (fileSizeMB > preset.maxFileSize) {
          return jsonResponse(
            {
              error: `Image size ${fileSizeMB.toFixed(
                2
              )}MB exceeds preset maximum of ${preset.maxFileSize}MB`,
            },
            400
          );
        }
      }

      // Build upload options
      let uploadOptions: { folder?: string; [key: string]: unknown } = {};

      // If preset is provided, use preset options
      if (preset) {
        uploadOptions = presetToCloudinaryOptions(preset, auth.userId);

        // Override folder if recipeId is provided
        if (recipeId && typeof recipeId === "number") {
          uploadOptions.folder = `${preset.folder}/${auth.userId}/${recipeId}`;
        }
      } else {
        // Fallback to original behavior if no preset
        uploadOptions = {
          folder:
            (typeof folder === "string" ? folder : null) ||
            `recipe-app/${auth.userId}`,
        };
      }

      // Determine image format from base64 data or use default
      const imageFormat = imageData.includes("data:image/")
        ? imageData.split(";")[0].split("/")[1]
        : "jpeg";

      const uploadResult = await cloudinary.uploader.upload(
        `data:image/${imageFormat};base64,${base64Data}`,
        uploadOptions
      );

      return jsonResponse({
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        eager: uploadResult.eager,
      });
    }

    // Route: /api/recipes/images (POST)
    if (path[0] === "recipes" && path[1] === "images") {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const { recipeId, imageUrl, imageType, order, caption } = body;
      if (
        !recipeId ||
        !imageUrl ||
        !imageType ||
        typeof imageUrl !== "string" ||
        typeof imageType !== "string"
      ) {
        return jsonResponse(
          {
            error: "Recipe ID, image URL, and image type are required",
          },
          400
        );
      }

      // Validate recipe ID
      const recipeIdNum = Number(recipeId);
      if (
        isNaN(recipeIdNum) ||
        recipeIdNum <= 0 ||
        !Number.isInteger(recipeIdNum)
      ) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      // Validate image URL format
      try {
        new URL(imageUrl);
      } catch {
        return jsonResponse({ error: "Invalid image URL format" }, 400);
      }

      // Validate image type - accept both old and new types
      const validImageTypes = [
        "main",
        "step",
        "ingredient",
        "other",
        "final",
        "custom",
      ];
      // Map new types to old types for database compatibility
      const imageTypeMap: Record<string, string> = {
        final: "main",
        custom: "other",
      };
      const mappedImageType = imageTypeMap[imageType] || imageType;

      if (!validImageTypes.includes(imageType)) {
        return jsonResponse(
          {
            error: `Invalid image type. Must be one of: ${validImageTypes.join(
              ", "
            )}`,
          },
          400
        );
      }

      // Validate order if provided
      if (order !== undefined && (isNaN(Number(order)) || Number(order) < 0)) {
        return jsonResponse(
          { error: "Order must be a non-negative number" },
          400
        );
      }

      const maxOrder = await prisma.recipeImage.findFirst({
        where: {
          userId: auth.userId!,
          recipeId: recipeIdNum,
          imageType: mappedImageType,
        },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const image = await prisma.recipeImage.create({
        data: {
          userId: auth.userId!,
          recipeId: recipeIdNum,
          imageUrl: imageUrl as string,
          imageType: mappedImageType as string,
          order:
            order !== undefined ? Number(order) : (maxOrder?.order ?? 0) + 1,
          caption:
            (typeof caption === "string" ? caption.trim() : undefined) ||
            undefined,
        },
      });

      return jsonResponse(
        {
          ...image,
          createdAt: image.createdAt.toISOString(),
          updatedAt: image.updatedAt.toISOString(),
        },
        201
      );
    }

    // Route: /api/email/share (POST) - Share recipe via email
    if (path[0] === "email" && path[1] === "share" && path.length === 2) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;

      const {
        recipeId,
        recipeTitle,
        recipeImage,
        recipientEmail,
        senderName,
        message,
      } = body;

      // Validation
      if (!recipeId || !recipeTitle || !recipientEmail) {
        return jsonResponse(
          { error: "Recipe ID, title, and recipient email are required" },
          400
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (
        typeof recipientEmail !== "string" ||
        !emailRegex.test(recipientEmail)
      ) {
        return jsonResponse({ error: "Invalid email format" }, 400);
      }

      // Use authorized sender email from environment variable
      const authorizedSenderEmail =
        process.env.EMAIL_SENDER_ADDRESS || "arnobt78@gmail.com";

      // Extract user name from JWT token if available
      let userName: string | undefined;
      try {
        const authHeader = request.headers.get("authorization");
        if (authHeader) {
          const cleanToken = authHeader.replace(/^Bearer\s+/i, "");
          const parts = cleanToken.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(
              Buffer.from(parts[1], "base64url").toString("utf-8")
            ) as { name?: string };
            if (payload.name) userName = payload.name;
          }
        }
      } catch {
        // If we can't decode token, use fallback
      }

      const senderDisplayName = senderName || userName || "Recipe Spoonacular";
      const recipeIdNum = String(recipeId);

      // Generate timestamp and unique identifier for subject
      const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const randomId = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      const subject = `Recipe Shared: ${recipeTitle} | ID: ${recipeIdNum} | ${timestamp}-${randomId}`;

      // Try Resend first (better deliverability), fallback to Brevo
      const resendToken = process.env.RESEND_TOKEN;
      const brevoApiKey = process.env.BREVO_API_KEY;

      let emailSent = false;
      let errorMessage = "";

      // Escape HTML to prevent XSS and ensure proper rendering
      const escapeHtml = (str: string): string => {
        return str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      const safeRecipeTitle = escapeHtml(
        typeof recipeTitle === "string" ? recipeTitle : ""
      );
      const safeSenderName = escapeHtml(
        typeof senderDisplayName === "string"
          ? senderDisplayName
          : "Recipe Spoonacular"
      );
      const safeMessage =
        message && typeof message === "string" ? escapeHtml(message) : "";
      const recipeUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/recipe/${recipeId}`;

      // Email client compatible template with inline styles and table-based layout
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Recipe Shared: ${safeRecipeTitle}</title>
            <!--[if mso]>
            <style type="text/css">
              body, table, td {font-family: Arial, sans-serif !important;}
            </style>
            <![endif]-->
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 0;">
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #f97316; padding: 40px 30px; text-align: center; border-radius: 0;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff; font-family: Arial, Helvetica, sans-serif;">
                          🍳 Recipe Shared with You
                        </h1>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px 30px; background-color: #ffffff;">
                        <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                          Hello,
                        </p>
                        <p style="margin: 0 0 30px 0; font-size: 16px; color: #333333; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                          <strong style="color: #f97316; font-weight: 600;">${safeSenderName}</strong> has shared a delicious recipe with you from Recipe Spoonacular.
                        </p>
                        <!-- Recipe Card -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin: 30px 0;">
                          <tr>
                            <td style="padding: 25px;">
                              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #1f2937; line-height: 1.3; font-family: Arial, Helvetica, sans-serif;">
                                ${safeRecipeTitle}
                              </h2>
                              ${
                                recipeImage
                                  ? `
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                                <tr>
                                  <td align="center" style="padding: 0;">
                                    <img src="${recipeImage}" alt="${safeRecipeTitle}" width="100%" style="max-width: 500px; height: auto; border-radius: 8px; display: block; margin: 0 auto;" />
                                  </td>
                                </tr>
                              </table>
                              `
                                  : ""
                              }
                              ${
                                message
                                  ? `
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                                <tr>
                                  <td style="padding: 15px; background-color: #ffffff; border-left: 4px solid #f97316; font-style: italic; color: #4b5563; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                                    &quot;${safeMessage}&quot;
                                  </td>
                                </tr>
                              </table>
                              `
                                  : ""
                              }
                            </td>
                          </tr>
                        </table>
                        <!-- CTA Button -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
                          <tr>
                            <td align="center" style="padding: 0;">
                              <a href="${recipeUrl}" style="display: inline-block; padding: 14px 32px; background-color: #f97316; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; font-family: Arial, Helvetica, sans-serif;">
                                View Full Recipe & Instructions
                              </a>
                            </td>
                          </tr>
                        </table>
                        <!-- Recipe ID -->
                        <p style="margin: 20px 0 0 0; font-size: 11px; color: #9ca3af; font-family: monospace; line-height: 1.6;">
                          Recipe ID: ${recipeIdNum} | Shared on ${timestamp}
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                        <p style="margin: 5px 0; font-size: 12px; color: #6b7280; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                          This email was sent from Recipe Spoonacular
                        </p>
                        <p style="margin: 5px 0; font-size: 12px; color: #6b7280; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                          Recipe sharing service powered by Spoonacular API
                        </p>
                        <p style="margin: 20px 0 0 0; font-size: 12px; color: #6b7280; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                          If you did not expect this email, please ignore it.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      // Try Resend first (better deliverability)
      if (resendToken) {
        try {
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendToken}`,
            },
            body: JSON.stringify({
              from: `${senderDisplayName} <${authorizedSenderEmail}>`,
              to: [recipientEmail],
              subject: subject,
              html: emailHtml,
            }),
          });

          if (resendResponse.ok) {
            emailSent = true;
          } else {
            const errorData = await resendResponse.json();
            errorMessage = errorData.message || "Resend API error";
            console.error("Resend API error:", errorData);
          }
        } catch (error) {
          errorMessage =
            error instanceof Error ? error.message : "Resend API error";
          console.error("Resend API exception:", error);
        }
      }

      // Fallback to Brevo if Resend failed
      if (!emailSent && brevoApiKey) {
        try {
          const brevoResponse = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "api-key": brevoApiKey,
              },
              body: JSON.stringify({
                sender: {
                  name: senderDisplayName,
                  email: authorizedSenderEmail,
                },
                to: [{ email: recipientEmail }],
                subject: subject,
                htmlContent: emailHtml,
              }),
            }
          );

          if (brevoResponse.ok) {
            emailSent = true;
          } else {
            const errorData = await brevoResponse.json();
            errorMessage = errorData.message || "Brevo API error";
            console.error("Brevo API error:", errorData);
          }
        } catch (error) {
          errorMessage =
            error instanceof Error ? error.message : "Brevo API error";
          console.error("Brevo API exception:", error);
        }
      }

      if (!emailSent) {
        return jsonResponse(
          {
            error: `Failed to send email: ${
              errorMessage || "No email service configured"
            }`,
          },
          500
        );
      }

      return jsonResponse({
        success: true,
        message: "Recipe shared successfully via email",
      });
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
      if (
        isNaN(recipeIdNum) ||
        recipeIdNum <= 0 ||
        !Number.isInteger(recipeIdNum)
      ) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      if (!content || typeof content !== "string" || !content.trim()) {
        return jsonResponse({ error: "Note content is required" }, 400);
      }

      // Validate content length
      if (content.trim().length > 10000) {
        return jsonResponse(
          { error: "Note content must be less than 10,000 characters" },
          400
        );
      }

      // Validate title length if provided
      if (title && typeof title === "string" && title.trim().length > 200) {
        return jsonResponse(
          { error: "Note title must be less than 200 characters" },
          400
        );
      }

      // Validate rating
      if (rating !== undefined) {
        const ratingNum = Number(rating);
        if (
          isNaN(ratingNum) ||
          ratingNum < 1 ||
          ratingNum > 5 ||
          !Number.isInteger(ratingNum)
        ) {
          return jsonResponse(
            { error: "Rating must be an integer between 1 and 5" },
            400
          );
        }
      }

      // Validate tags if provided
      if (tags !== undefined && (!Array.isArray(tags) || tags.length > 20)) {
        return jsonResponse(
          { error: "Tags must be an array with maximum 20 items" },
          400
        );
      }

      const note = await prisma.recipeNote.upsert({
        where: {
          userId_recipeId: {
            userId: auth.userId!,
            recipeId: recipeIdNum,
          },
        },
        update: {
          title:
            (typeof title === "string" ? title.trim() : undefined) || undefined,
          content: content.trim(),
          rating: rating !== undefined ? Number(rating) : undefined,
          tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
        },
        create: {
          userId: auth.userId!,
          recipeId: recipeIdNum,
          title:
            (typeof title === "string" ? title.trim() : undefined) || undefined,
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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
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
        },
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
        JSON.stringify({
          error: "Request body too large. Maximum size is 10MB",
        }),
        {
          status: 413,
          headers: { ...getCorsHeaders(), "Content-Type": "application/json" },
        }
      );
    }
    body = bodyText ? JSON.parse(bodyText) : {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_parseError) {
    if (
      request.headers.get("content-length") &&
      request.headers.get("content-length") !== "0"
    ) {
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
          ...(name && typeof name === "string" ? { name: name.trim() } : {}),
          ...(description !== undefined && typeof description === "string"
            ? { description: description.trim() }
            : {}),
          ...(color !== undefined
            ? { color: typeof color === "string" ? color : null }
            : {}),
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
        items?: Prisma.InputJsonValue;
        isCompleted?: boolean;
      } = {};

      if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0) {
          return jsonResponse(
            { error: "Name must be a non-empty string" },
            400
          );
        }
        if (name.trim().length > 200) {
          return jsonResponse(
            { error: "Name must be less than 200 characters" },
            400
          );
        }
        updates.name = name.trim();
      }

      if (items !== undefined) {
        if (!Array.isArray(items)) {
          return jsonResponse({ error: "Items must be an array" }, 400);
        }
        updates.items = items as Prisma.InputJsonValue;
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
        items:
          typeof updated.items === "string"
            ? JSON.parse(updated.items)
            : updated.items,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (error) {
    console.error("API PUT Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
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
        },
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
        JSON.stringify({
          error: "Request body too large. Maximum size is 10MB",
        }),
        {
          status: 413,
          headers: { ...getCorsHeaders(), "Content-Type": "application/json" },
        }
      );
    }
    body = bodyText ? JSON.parse(bodyText) : {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_parseError) {
    if (
      request.headers.get("content-length") &&
      request.headers.get("content-length") !== "0"
    ) {
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
      if (
        isNaN(recipeIdNum) ||
        recipeIdNum <= 0 ||
        !Number.isInteger(recipeIdNum)
      ) {
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
    if (
      path[0] === "collections" &&
      path[1] &&
      path[2] === "items" &&
      path.length === 3
    ) {
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

      // Validate recipe ID
      const recipeIdNum = Number(recipeId);
      if (
        isNaN(recipeIdNum) ||
        recipeIdNum <= 0 ||
        !Number.isInteger(recipeIdNum)
      ) {
        return jsonResponse({ error: "Invalid recipe ID format" }, 400);
      }

      const deleted = await prisma.collectionItem.deleteMany({
        where: {
          collectionId,
          recipeId: recipeIdNum,
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
      if (!itemId || typeof itemId !== "string") {
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
      if (
        isNaN(recipeIdNum) ||
        recipeIdNum <= 0 ||
        !Number.isInteger(recipeIdNum)
      ) {
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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
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
        },
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
