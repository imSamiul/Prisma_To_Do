import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  categoryId: string;
  inMyDay: boolean;
}

type TodoListParams =
  | { mode: 'all' }
  | { mode: 'my-day' }
  | { mode: 'category'; categoryId: string };

export function useTodos(params: TodoListParams) {
  const key =
    params.mode === 'my-day'
      ? (['todos', 'my-day'] as const)
      : params.mode === 'all'
        ? (['todos', 'all'] as const)
        : (['todos', 'category', params.categoryId] as const);

  return useQuery({
    queryKey: key,
    enabled: params.mode !== 'category' || Boolean(params.categoryId),
    queryFn: () =>
      apiClient
        .get('/api/todos', {
          params:
            params.mode === 'my-day'
              ? { view: 'my-day' }
              : params.mode === 'category'
                ? { categoryId: params.categoryId }
                : undefined,
        })
        .then((res) => res.data),
  });
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      categoryId: string;
      description?: string;
    }) => {
      const response = await apiClient.post('/api/todos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      description?: string;
      completed?: boolean;
    }) => {
      const response = await apiClient.put(`/api/todos/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/todos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useToggleTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.put(`/api/todos/${id}/toggle-complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useSetMyDayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, inMyDay }: { id: string; inMyDay: boolean }) => {
      const response = await apiClient.put(`/api/todos/${id}/my-day`, {
        inMyDay,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useMoveTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      categoryId,
    }: {
      id: string;
      categoryId: string;
    }) => {
      const response = await apiClient.put(`/api/todos/${id}/move`, {
        categoryId,
      });
      return response.data as { message: string; data: Todo };
    },
    onSuccess: async (result, variables) => {
      const movedTodo: Todo = {
        id: result.data.id ?? variables.id,
        title: result.data.title,
        description: result.data.description,
        completed: result.data.completed,
        inMyDay: result.data.inMyDay,
        categoryId: String(result.data.categoryId ?? variables.categoryId),
      };

      // Patch every cached list immediately so destination isn't stuck on stale empty data
      for (const [queryKey, cached] of queryClient.getQueriesData<{
        data: Todo[];
      }>({ queryKey: ['todos'] })) {
        if (!cached?.data) continue;

        const key = queryKey as unknown[];
        const withoutMoved = cached.data.filter(
          (todo) => todo.id !== movedTodo.id,
        );

        const isAll = key[1] === 'all';
        const isMyDay = key[1] === 'my-day';
        const isCategory = key[1] === 'category';
        const listCategoryId = isCategory ? String(key[2] ?? '') : '';

        const belongsHere =
          isAll ||
          (isMyDay && movedTodo.inMyDay) ||
          (isCategory && listCategoryId === movedTodo.categoryId);

        queryClient.setQueryData(queryKey, {
          ...cached,
          data: belongsHere ? [movedTodo, ...withoutMoved] : withoutMoved,
        });
      }

      // Refetch active + inactive todo queries so every list stays in sync
      await queryClient.invalidateQueries({
        queryKey: ['todos'],
        refetchType: 'all',
      });
    },
  });
}

