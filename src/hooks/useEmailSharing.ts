/**
 * React Query hooks for email sharing
 *
 * Caching Strategy:
 * - Mutations only (no queries)
 * - Toast notifications for success/error
 *
 * Following REACT_QUERY_SETUP_GUIDE.md patterns
 */

import { useMutation, UseMutationResult } from "@tanstack/react-query";
import * as api from "../api";
import { toast } from "sonner";
import {
  ShareRecipeEmailRequest,
  ShareRecipeEmailResponse,
} from "../types";

/**
 * Hook to share recipe via email
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, etc.
 */
export function useShareRecipeEmail(): UseMutationResult<
  ShareRecipeEmailResponse,
  Error,
  ShareRecipeEmailRequest
> {
  return useMutation({
    mutationFn: (data) => api.shareRecipeEmail(data),
    onSuccess: () => {
      toast.success("Recipe shared successfully via email!");
    },
    onError: (error: Error) => {
      if (error.message.includes("authenticated")) {
        toast.error("Please login to share recipes.");
      } else {
        toast.error("Failed to share recipe. Please try again.");
      }
    },
  });
}

