/**
 * Recipe Modifications Component
 *
 * Unified component for recipe scaling, dietary modifications, and simplification
 * Features:
 * - Recipe scaling (servings adjustment with proportional ingredient scaling)
 * - Dietary modifications (AI-powered conversion to vegan, keto, gluten-free, etc.)
 * - Recipe simplification (AI-powered simplification for beginners)
 * - Unit conversion (metric/imperial)
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks, ShadCN UI
 */

import { memo, useState, useMemo } from "react";
import { useRecipeModification } from "../../hooks/useRecipes";
import { RecipeInformation } from "../../types";
import { scaleRecipeIngredients } from "../../utils/recipeScaling";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Scale,
  Leaf,
  Sparkles,
  ChefHat,
} from "lucide-react";
import { toast } from "sonner";
import EmptyState from "../common/EmptyState";
import { Skeleton } from "../ui/skeleton";

interface RecipeModificationsProps {
  recipeInfo: RecipeInformation;
  className?: string;
}

/**
 * Recipe Modifications Component (Memoized for performance)
 *
 * Provides recipe scaling, dietary modifications, and simplification features
 */
const RecipeModifications = memo(
  ({ recipeInfo, className = "" }: RecipeModificationsProps) => {
    const [targetServings, setTargetServings] = useState<number>(
      recipeInfo.servings || 4
    );
    const [selectedDiet, setSelectedDiet] = useState<string>("vegan");
    const [activeModificationTab, setActiveModificationTab] =
      useState<string>("scale");

    // Scale recipe ingredients
    const scaledIngredients = useMemo(() => {
      if (activeModificationTab !== "scale") return [];
      return scaleRecipeIngredients(
        recipeInfo,
        targetServings,
        recipeInfo.servings
      );
    }, [recipeInfo, targetServings, activeModificationTab]);

    // Fetch dietary modification
    const {
      data: dietaryModification,
      isLoading: isDietaryLoading,
      error: dietaryError,
    } = useRecipeModification(
      recipeInfo.id,
      "dietary",
      selectedDiet,
      activeModificationTab === "dietary" && !!recipeInfo.id
    );

    // Fetch simplification
    const {
      data: simplification,
      isLoading: isSimplificationLoading,
      error: simplificationError,
    } = useRecipeModification(
      recipeInfo.id,
      "simplify",
      undefined,
      activeModificationTab === "simplify" && !!recipeInfo.id
    );

    const handleCopyIngredients = (ingredients: string[]) => {
      navigator.clipboard.writeText(ingredients.join("\n"));
      toast.success("Ingredients copied to clipboard!");
    };

    return (
      <Card
        className={`bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-green-500/20 ${className}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white">
            <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
            Recipe Modifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeModificationTab}
            onValueChange={setActiveModificationTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="scale" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                <span className="hidden sm:inline">Scale</span>
              </TabsTrigger>
              <TabsTrigger value="dietary" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                <span className="hidden sm:inline">Dietary</span>
              </TabsTrigger>
              <TabsTrigger value="simplify" className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                <span className="hidden sm:inline">Simplify</span>
              </TabsTrigger>
            </TabsList>

            {/* Scaling Tab */}
            <TabsContent value="scale" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-300 whitespace-nowrap">
                    Target Servings:
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={targetServings}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value > 0 && value <= 20) {
                        setTargetServings(value);
                      }
                    }}
                    className="w-24 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Original: {recipeInfo.servings} servings
                </Badge>
              </div>

              {scaledIngredients.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white">
                      Scaled Ingredients
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyIngredients(
                          scaledIngredients.map((ing) => ing.scaled)
                        )
                      }
                      className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                    >
                      Copy All
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {scaledIngredients.map((ing, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-green-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {ing.scaled}
                            </p>
                            {ing.original !== ing.scaled && (
                              <p className="text-xs text-gray-400 mt-1 line-through">
                                {ing.original}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState message="No ingredients available for scaling." />
              )}
            </TabsContent>

            {/* Dietary Modification Tab */}
            <TabsContent value="dietary" className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-sm text-gray-300">Convert to:</label>
                {["vegan", "keto", "gluten-free", "dairy-free"].map(
                  (diet) => (
                    <Button
                      key={diet}
                      variant={selectedDiet === diet ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDiet(diet)}
                      className={
                        selectedDiet === diet
                          ? "bg-green-600 hover:bg-green-700"
                          : "border-green-500/30 text-green-300 hover:bg-green-500/20"
                      }
                    >
                      {diet.charAt(0).toUpperCase() + diet.slice(1)}
                    </Button>
                  )
                )}
              </div>

              {isDietaryLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : dietaryError ? (
                <EmptyState
                  message="Failed to load dietary modification."
                  subtitle={dietaryError.message}
                />
              ) : dietaryModification ? (
                <div className="space-y-4">
                  {dietaryModification.explanation && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {dietaryModification.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {dietaryModification.modifiedIngredients &&
                    dietaryModification.modifiedIngredients.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-white">
                            Modified Ingredients
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCopyIngredients(
                                dietaryModification.modifiedIngredients!.map(
                                  (ing) => `${ing.substitute} (instead of ${ing.original})`
                                )
                              )
                            }
                            className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                          >
                            Copy All
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                          {dietaryModification.modifiedIngredients.map(
                            (ing, index) => (
                              <div
                                key={index}
                                className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-green-500/30 transition-colors"
                              >
                                <p className="text-white font-medium">
                                  {ing.substitute}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 line-through">
                                  {ing.original}
                                </p>
                                {ing.reason && (
                                  <p className="text-xs text-green-400 mt-1">
                                    {ing.reason}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {dietaryModification.modifiedInstructions && (
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-white">
                        Modified Instructions
                      </h4>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {dietaryModification.modifiedInstructions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState message="No dietary modification available." />
              )}
            </TabsContent>

            {/* Simplification Tab */}
            <TabsContent value="simplify" className="space-y-4">
              {isSimplificationLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : simplificationError ? (
                <EmptyState
                  message="Failed to load simplification."
                  subtitle={simplificationError.message}
                />
              ) : simplification ? (
                <div className="space-y-4">
                  {simplification.simplifiedIngredients &&
                    simplification.simplifiedIngredients.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-white">
                            Simplified Ingredients
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCopyIngredients(
                                simplification.simplifiedIngredients!.map(
                                  (ing) => ing.simplified
                                )
                              )
                            }
                            className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                          >
                            Copy All
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                          {simplification.simplifiedIngredients.map(
                            (ing, index) => (
                              <div
                                key={index}
                                className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-green-500/30 transition-colors"
                              >
                                <p className="text-white font-medium">
                                  {ing.simplified}
                                </p>
                                {ing.original !== ing.simplified && (
                                  <p className="text-xs text-gray-400 mt-1 line-through">
                                    {ing.original}
                                  </p>
                                )}
                                {ing.reason && (
                                  <p className="text-xs text-green-400 mt-1">
                                    {ing.reason}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {simplification.simplifiedInstructions && (
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-white">
                        Simplified Instructions
                      </h4>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {simplification.simplifiedInstructions}
                        </p>
                      </div>
                    </div>
                  )}

                  {simplification.tips && simplification.tips.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-white">
                        Tips for Beginners
                      </h4>
                      <div className="space-y-2">
                        {simplification.tips.map((tip, index) => (
                          <div
                            key={index}
                            className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                          >
                            <div className="flex items-start gap-2">
                              <Sparkles className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-300">{tip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState message="No simplification available." />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }
);

RecipeModifications.displayName = "RecipeModifications";

export default RecipeModifications;

