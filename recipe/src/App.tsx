/**
 * Main App Component
 *
 * Features:
 * - React Query for data fetching with infinite cache
 * - Query params synchronization
 * - Reusable components (ShadCN UI)
 * - Centralized context for state management
 * - Card-based recipe detail view (replaces modal)
 * - SVG images integration
 * - Optimized with useMemo/useCallback
 * - No code duplication
 */

import {
  FormEvent,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  Suspense,
  lazy,
} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeProvider, useRecipeContext } from "./context/RecipeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RecipePage from "./pages/RecipePage";
import SearchInput from "./components/SearchInput";
import TabNavigation from "./components/TabNavigation";
import RecipeGrid from "./components/RecipeGrid";
import ErrorMessage from "./components/ErrorMessage";
import EmptyState from "./components/EmptyState";
import ViewMoreButton from "./components/ViewMoreButton";
import HeroHeader from "./components/HeroHeader";
import Navbar from "./components/Navbar";
import SkeletonRecipeGrid from "./components/SkeletonRecipeGrid";
import SkeletonMealPlanner from "./components/SkeletonMealPlanner";
import SkeletonShoppingList from "./components/SkeletonShoppingList";

// Code splitting: Lazy load large components that are conditionally rendered
const CollectionManager = lazy(() => import("./components/CollectionManager"));
const CollectionDetailView = lazy(
  () => import("./components/CollectionDetailView")
);
const MealPlanner = lazy(() => import("./components/MealPlanner"));
const ShoppingListGenerator = lazy(
  () => import("./components/ShoppingListGenerator")
);
import {
  useSearchRecipes,
  useFavouriteRecipes,
  useAddFavouriteRecipe,
  useRemoveFavouriteRecipe,
} from "./hooks/useRecipes";
import { Recipe, SearchRecipesResponse } from "./types";
import { toast } from "sonner";

/**
 * Main App Content (wrapped in RecipeProvider and AuthProvider)
 */
const AppContent = () => {
  const {
    selectedCollection,
    setSelectedCollection,
    searchTerm,
    setSearchTerm,
    selectedTab,
    setSelectedTab,
    currentPage,
    setCurrentPage,
  } = useRecipeContext();

  const { isAuthenticated } = useAuth();

  // React Query hooks with infinite cache strategy
  const {
    data: searchResponse,
    isLoading: isSearching,
    error: searchError,
  } = useSearchRecipes(
    searchTerm,
    currentPage,
    !!searchTerm && selectedTab === "search"
  );

  const {
    data: favouriteRecipes = [],
    isLoading: isLoadingFavourites,
    error: favouritesError,
  } = useFavouriteRecipes();
  const addFavouriteMutation = useAddFavouriteRecipe();
  const removeFavouriteMutation = useRemoveFavouriteRecipe();

  // Handle search errors with toast
  useEffect(() => {
    if (searchError) {
      const error = searchError as Error & { code?: number };
      if (error?.code === 402 || error?.message?.includes("points limit")) {
        toast.error(
          "Daily API limit reached. Please try again later or upgrade your plan."
        );
      } else {
        toast.error("Failed to search recipes. Please try again.");
      }
    }
  }, [searchError]);

  // Handle favourites errors with toast
  useEffect(() => {
    if (favouritesError) {
      toast.error("Failed to load favourite recipes.");
    }
  }, [favouritesError]);

  // Accumulate recipes across all pages for better UX
  // Store all fetched pages in a ref to accumulate results
  const allRecipesRef = useRef<Recipe[]>([]);
  const lastPageRef = useRef<number>(0);
  const lastSearchTermRef = useRef<string>("");

  // Reset accumulated recipes when search term changes
  useEffect(() => {
    if (searchTerm !== lastSearchTermRef.current) {
      allRecipesRef.current = [];
      lastPageRef.current = 0;
      lastSearchTermRef.current = searchTerm;
    }
  }, [searchTerm]);

  // Accumulate recipes from all pages
  const recipes = useMemo(() => {
    if (!searchResponse?.results) {
      return allRecipesRef.current;
    }

    const currentPageResults = searchResponse.results;

    // If this is a new page, add to accumulated results
    if (currentPage > lastPageRef.current) {
      allRecipesRef.current = [...allRecipesRef.current, ...currentPageResults];
      lastPageRef.current = currentPage;
    } else if (currentPage === 1) {
      // Reset on new search (page 1 means new search)
      allRecipesRef.current = currentPageResults;
      lastPageRef.current = 1;
    }

    return allRecipesRef.current;
  }, [searchResponse, currentPage]) as Recipe[];

  const apiError = useMemo(
    () =>
      (searchResponse as SearchRecipesResponse)?.status === "failure" ||
      (searchResponse as SearchRecipesResponse)?.code === 402
        ? (searchResponse as SearchRecipesResponse)?.message ||
          "Daily API limit reached. Please try again later."
        : "",
    [searchResponse]
  );


  // Memoized event handlers
  const handleSearchSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (!searchTerm.trim()) return;
      setCurrentPage(1);
    },
    [searchTerm, setCurrentPage]
  );

  const handleViewMoreClick = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, [setCurrentPage]);

  const handleFavouriteToggle = useCallback(
    (recipe: Recipe, isFavourite: boolean) => {
      // Check if user is authenticated before attempting to add/remove favourites
      if (!isAuthenticated) {
        toast.info(
          "🍳 Hey there, food explorer! 👋 To save your favourite recipes, please login first. It's quick and easy! Just click the Login button above and let's get cooking! 🚀",
          {
            duration: 5000,
          }
        );
        return;
      }

      if (isFavourite) {
        removeFavouriteMutation.mutate(recipe);
      } else {
        addFavouriteMutation.mutate(recipe);
      }
    },
    [isAuthenticated, addFavouriteMutation, removeFavouriteMutation]
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Navbar - Sticky at top */}
      <Navbar />

      {/* Full-width Hero Section */}
      <HeroHeader subtitle="Discover & Save Your Favourite Recipes" />

      {/* Main Content - Flex grow to fill remaining space, full width with inner constraint */}
      <div className="w-full flex-1">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-0 py-4">
          {/* Tab Navigation */}
          <TabNavigation value={selectedTab} onValueChange={setSelectedTab} />

          <AnimatePresence mode="wait">
            {selectedTab === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Search Input - Always visible, never shows loading */}
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onSubmit={handleSearchSubmit}
                />

                {/* Error Message */}
                <ErrorMessage message={apiError} />

                {/* Recipe Grid */}
                {isSearching ? (
                  <SkeletonRecipeGrid count={8} />
                ) : recipes.length > 0 ? (
                  <RecipeGrid
                    recipes={recipes}
                    favouriteRecipes={favouriteRecipes}
                    onFavouriteToggle={handleFavouriteToggle}
                  />
                ) : null}

                {/* View More Button - Show if there are more results available */}
                {recipes.length > 0 &&
                  searchResponse?.totalResults &&
                  recipes.length < searchResponse.totalResults && (
                    <ViewMoreButton
                      onClick={handleViewMoreClick}
                      isLoading={isSearching}
                    />
                  )}
              </motion.div>
            )}

            {selectedTab === "favourites" && (
              <motion.div
                key="favourites"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {isLoadingFavourites ? (
                  <SkeletonRecipeGrid count={4} />
                ) : favouriteRecipes.length === 0 ? (
                  <EmptyState
                    message="No Favourite Recipes Yet"
                    subtitle={
                      isAuthenticated
                        ? "Start exploring and add recipes you love to your favourites! 🍳✨"
                        : "Hey there, food explorer! 👋 To see your favourite recipes, you'll need to login first. Don't worry, it's quick and easy! Once you're in, you can save all those delicious recipes that make your taste buds dance. 🎉 Just click the Login button above and let's get cooking! 🚀"
                    }
                    fullWidth={true}
                  />
                ) : (
                  <RecipeGrid
                    recipes={favouriteRecipes as Recipe[]}
                    favouriteRecipes={favouriteRecipes as Recipe[]}
                    onFavouriteToggle={handleFavouriteToggle}
                  />
                )}
              </motion.div>
            )}

            {selectedTab === "collections" && (
              <motion.div
                key="collections"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {isAuthenticated ? (
                  selectedCollection ? (
                    <Suspense fallback={<SkeletonRecipeGrid count={4} />}>
                      <CollectionDetailView
                        collection={selectedCollection}
                        onBack={() => setSelectedCollection(undefined)}
                        onDelete={() => {
                          setSelectedCollection(undefined);
                        }}
                      />
                    </Suspense>
                  ) : (
                    <Suspense fallback={<SkeletonRecipeGrid count={4} />}>
                      <CollectionManager
                        onCollectionSelect={(collection) =>
                          setSelectedCollection(collection)
                        }
                      />
                    </Suspense>
                  )
                ) : (
                  <EmptyState
                    message="Login Required"
                    subtitle="Please login to create and manage your recipe collections!"
                  />
                )}
              </motion.div>
            )}

            {selectedTab === "meal-plan" && (
              <motion.div
                key="meal-plan"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {isAuthenticated ? (
                  <Suspense fallback={<SkeletonMealPlanner />}>
                    <MealPlanner />
                  </Suspense>
                ) : (
                  <EmptyState
                    message="Login Required"
                    subtitle="Please login to create and manage your weekly meal plans!"
                  />
                )}
              </motion.div>
            )}

            {selectedTab === "shopping" && (
              <motion.div
                key="shopping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {isAuthenticated ? (
                  <Suspense fallback={<SkeletonShoppingList />}>
                    <ShoppingListGenerator />
                  </Suspense>
                ) : (
                  <EmptyState
                    message="Login Required"
                    subtitle="Please login to generate and manage your shopping lists!"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

/**
 * App Component with RecipeProvider and AuthProvider
 * Uses React Router for navigation
 */
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RecipeProvider>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/recipe/:id" element={<RecipePage />} />
          </Routes>
        </RecipeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
