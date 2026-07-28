'use client';

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
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
