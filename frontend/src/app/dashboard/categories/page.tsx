'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useCategories,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  type Category,
} from '@/hooks/use-categories';
import { getErrorMessage } from '@/lib/get-error-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/loader';

export default function CategoriesPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const categoriesQuery = useCategories();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();

  const categories: Category[] = categoriesQuery.data?.data ?? [];
  const customCategories = categories.filter((category) => !category.isSystem);

  async function handleCreate() {
    if (!name.trim()) return;
    setError('');

    try {
      const result = await createCategoryMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');

      const newCategoryId = result?.data?.id as string | undefined;
      if (newCategoryId) {
        router.push(`/dashboard?category=${newCategoryId}`);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create list'));
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description ?? '');
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  }

  async function handleUpdate() {
    if (!editingId || !editName.trim()) return;
    setError('');

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingId,
        name: editName.trim(),
        description: editDescription.trim(),
      });
      cancelEdit();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update list'));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this list and all its tasks?')) return;
    setError('');

    try {
      await deleteCategoryMutation.mutateAsync(id);
      if (editingId === id) cancelEdit();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete list'));
    }
  }

  if (categoriesQuery.isLoading) {
    return <PageLoader label="Loading lists..." />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My lists</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage your custom lists.
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 rounded-lg border bg-card p-4">
        <Input
          placeholder="List name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          onClick={() => void handleCreate()}
          disabled={createCategoryMutation.isPending || !name.trim()}
          className="w-fit"
        >
          Create list
        </Button>
      </div>

      <ul className="space-y-2">
        {customCategories.map((category) => (
          <li
            key={category.id}
            className="rounded-md border bg-card p-4"
          >
            {editingId === category.id ? (
              <div className="grid gap-3">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="List name"
                  autoFocus
                />
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => void handleUpdate()}
                    disabled={
                      updateCategoryMutation.isPending || !editName.trim()
                    }
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEdit}
                    disabled={updateCategoryMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/dashboard?category=${category.id}`}
                  className="min-w-0 flex-1 hover:underline"
                >
                  <p className="font-medium">{category.name}</p>
                  {category.description ? (
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  ) : null}
                </Link>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(category)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => void handleDelete(category.id)}
                    disabled={deleteCategoryMutation.isPending}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
        {customCategories.length === 0 ? (
          <li className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No lists yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
