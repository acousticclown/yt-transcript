import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi, Tag } from "../api";

// Query keys
export const tagKeys = {
  all: ["tags"] as const,
};

// Fetch all tags
export function useTags() {
  return useQuery({
    queryKey: tagKeys.all,
    queryFn: tagsApi.list,
  });
}

// Create tag
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) =>
      tagsApi.create(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}

// Update tag
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; color?: string } }) =>
      tagsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}

// Delete tag
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsApi.delete,
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: tagKeys.all });
      const previous = queryClient.getQueryData<Tag[]>(tagKeys.all);

      queryClient.setQueryData<Tag[]>(tagKeys.all, (old) =>
        old?.filter((t) => t.id !== id)
      );

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(tagKeys.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}

