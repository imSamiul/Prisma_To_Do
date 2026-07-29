import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import { CheckCircle2, FolderKanban, MoreHorizontal, Pencil, Sun, Trash2 } from 'lucide-react';
import {
  useCategories,
  useUpdateCategoryMutation,
  type Category,
} from '@/hooks/use-categories';
import {
  useTodos,
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoMutation,
  useSetMyDayMutation,
  useMoveTodoMutation,
  useUpdateTodoMutation,
  type Todo,
} from '@/hooks/use-todos';
import { DEFAULT_CATEGORY_SLUG } from '@/lib/system-categories';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Loader, PageLoader } from '@/components/ui/loader';

const dashboardSearchSchema = z.object({
  category: z.string().optional(),
});

export const Route = createFileRoute('/dashboard/')({
  validateSearch: dashboardSearchSchema,
  component: DashboardPage,
});

function DashboardPage() {
  const { category } = Route.useSearch();
  const categoryId = category ?? '';

  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [error, setError] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTodoTitle, setEditTodoTitle] = useState('');
  const [editTodoDescription, setEditTodoDescription] = useState('');
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDescription, setEditCategoryDescription] = useState('');

  const categoriesQuery = useCategories();
  const categories: Category[] = categoriesQuery.data?.data ?? [];
  const defaultCategory =
    categories.find((category) => category.slug === DEFAULT_CATEGORY_SLUG) ??
    categories.find((category) => category.isSystem);

  const activeCategory = categoryId
    ? categories.find((category) => category.id === categoryId)
    : undefined;
  const isAllTasksView = !categoryId;
  const isMyDayView = activeCategory?.slug === 'my-day';
  const canEditCategory = Boolean(activeCategory && !activeCategory.isSystem);
  // Stale ?category= id after list cleanup / recreate
  const isUnknownCategory = Boolean(categoryId) && !activeCategory;

  const todosQuery = useTodos(
    isUnknownCategory
      ? { mode: 'all' }
      : isMyDayView
        ? { mode: 'my-day' }
        : isAllTasksView
          ? { mode: 'all' }
          : { mode: 'category', categoryId },
  );

  const createTodoMutation = useCreateTodoMutation();
  const updateTodoMutation = useUpdateTodoMutation();
  const deleteTodoMutation = useDeleteTodoMutation();
  const toggleTodoMutation = useToggleTodoMutation();
  const setMyDayMutation = useSetMyDayMutation();
  const moveTodoMutation = useMoveTodoMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();

  const todos: Todo[] = todosQuery.data?.data ?? [];
  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);
  const moveTargets = categories.filter(
    (category) => category.slug !== 'my-day',
  );
  const categoryNameById = Object.fromEntries(
    categories.map((category) => [category.id, category.name]),
  );

  async function handleCreateTodo() {
    if (!newTodoTitle.trim()) return;

    const targetCategoryId =
      isAllTasksView || isUnknownCategory
        ? defaultCategory?.id
        : categoryId;

    if (!targetCategoryId) {
      setError('Default Tasks list is not ready yet. Refresh and try again.');
      return;
    }

    setError('');
    try {
      await createTodoMutation.mutateAsync({
        title: newTodoTitle.trim(),
        categoryId: targetCategoryId,
      });
      setNewTodoTitle('');
    } catch {
      setError('Failed to create todo');
    }
  }

  function startEditTodo(todo: Todo) {
    setEditingTodoId(todo.id);
    setEditTodoTitle(todo.title);
    setEditTodoDescription(todo.description ?? '');
    setError('');
  }

  function cancelEditTodo() {
    setEditingTodoId(null);
    setEditTodoTitle('');
    setEditTodoDescription('');
  }

  async function handleUpdateTodo() {
    if (!editingTodoId || !editTodoTitle.trim()) return;
    setError('');
    try {
      await updateTodoMutation.mutateAsync({
        id: editingTodoId,
        title: editTodoTitle.trim(),
        description: editTodoDescription.trim(),
      });
      cancelEditTodo();
    } catch {
      setError('Failed to update task');
    }
  }

  async function handleDeleteTodo(id: string) {
    if (!window.confirm('Delete this todo?')) return;
    try {
      await deleteTodoMutation.mutateAsync(id);
      if (editingTodoId === id) cancelEditTodo();
    } catch {
      setError('Failed to delete todo');
    }
  }

  async function handleToggleMyDay(todo: Todo) {
    try {
      await setMyDayMutation.mutateAsync({
        id: todo.id,
        inMyDay: !todo.inMyDay,
      });
    } catch {
      setError('Failed to update My Day');
    }
  }

  async function handleMoveTodo(todoId: string, nextCategoryId: string) {
    if (!nextCategoryId) return;
    setError('');
    try {
      await moveTodoMutation.mutateAsync({
        id: todoId,
        categoryId: nextCategoryId,
      });
    } catch {
      setError('Failed to move task');
    }
  }

  function startEditCategory() {
    if (!activeCategory || activeCategory.isSystem) return;
    setIsEditingCategory(true);
    setEditCategoryName(activeCategory.name);
    setEditCategoryDescription(activeCategory.description ?? '');
    setError('');
  }

  function cancelEditCategory() {
    setIsEditingCategory(false);
    setEditCategoryName('');
    setEditCategoryDescription('');
  }

  async function handleUpdateCategory() {
    if (!activeCategory || !editCategoryName.trim()) return;
    setError('');
    try {
      await updateCategoryMutation.mutateAsync({
        id: activeCategory.id,
        name: editCategoryName.trim(),
        description: editCategoryDescription.trim(),
      });
      cancelEditCategory();
    } catch {
      setError('Failed to update list');
    }
  }

  if (categoriesQuery.isLoading) {
    return <PageLoader label="Loading lists..." />;
  }

  if (categoriesQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        Could not load lists. Check that you are logged in and the API is running.
      </div>
    );
  }

  const title = isAllTasksView
    ? 'All tasks'
    : isUnknownCategory
      ? 'List not found'
      : (activeCategory?.name ?? 'List');
  const subtitle = isAllTasksView
    ? 'Every task across all your lists'
    : isUnknownCategory
      ? 'This list is no longer available. Pick another list from the sidebar.'
      : isMyDayView
        ? 'Tasks you added for today. They still stay in their original list.'
        : activeCategory?.description ||
          (activeCategory?.isSystem
            ? 'Built-in list'
            : 'Add tasks to this list. You can also move them or send them to My Day.');

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        {isEditingCategory && canEditCategory ? (
          <div className="grid gap-3">
            <Input
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              placeholder="List name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleUpdateCategory();
                if (e.key === 'Escape') cancelEditCategory();
              }}
            />
            <Input
              value={editCategoryDescription}
              onChange={(e) => setEditCategoryDescription(e.target.value)}
              placeholder="Description (optional)"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => void handleUpdateCategory()}
                disabled={
                  updateCategoryMutation.isPending || !editCategoryName.trim()
                }
              >
                Save list
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEditCategory}
                disabled={updateCategoryMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {canEditCategory ? (
              <Button
                variant="outline"
                size="sm"
                onClick={startEditCategory}
                className="shrink-0"
              >
                <Pencil className="size-3.5" />
                Rename list
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Add a task"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleCreateTodo();
          }}
          disabled={isUnknownCategory}
        />
        <Button
          onClick={() => void handleCreateTodo()}
          disabled={
            isUnknownCategory ||
            createTodoMutation.isPending ||
            !newTodoTitle.trim()
          }
        >
          Add
        </Button>
      </div>

      <div className="space-y-6">
        {todosQuery.isLoading ? (
          <Loader label="Loading tasks..." className="justify-start py-2" />
        ) : null}

        {todosQuery.isError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Could not load tasks.
          </p>
        ) : null}

        {!todosQuery.isLoading && !todosQuery.isError && todos.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No task found
          </div>
        ) : null}

        {!todosQuery.isLoading && !todosQuery.isError && activeTodos.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              To do · {activeTodos.length}
            </h2>
            <ul className="space-y-2">
              {activeTodos.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  categoryName={categoryNameById[String(todo.categoryId)]}
                  editingTodoId={editingTodoId}
                  editTodoTitle={editTodoTitle}
                  editTodoDescription={editTodoDescription}
                  setEditTodoTitle={setEditTodoTitle}
                  setEditTodoDescription={setEditTodoDescription}
                  moveTargets={moveTargets}
                  isUpdating={updateTodoMutation.isPending}
                  isToggling={toggleTodoMutation.isPending}
                  isMoving={moveTodoMutation.isPending}
                  isSettingMyDay={setMyDayMutation.isPending}
                  onSave={() => void handleUpdateTodo()}
                  onCancelEdit={cancelEditTodo}
                  onStartEdit={startEditTodo}
                  onToggle={() => toggleTodoMutation.mutate(todo.id)}
                  onToggleMyDay={() => void handleToggleMyDay(todo)}
                  onMove={(categoryId) => void handleMoveTodo(todo.id, categoryId)}
                  onDelete={() => void handleDeleteTodo(todo.id)}
                />
              ))}
            </ul>
          </section>
        ) : null}

        {!todosQuery.isLoading &&
        !todosQuery.isError &&
        completedTodos.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Completed · {completedTodos.length}
            </h2>
            <ul className="space-y-2">
              {completedTodos.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  categoryName={categoryNameById[String(todo.categoryId)]}
                  editingTodoId={editingTodoId}
                  editTodoTitle={editTodoTitle}
                  editTodoDescription={editTodoDescription}
                  setEditTodoTitle={setEditTodoTitle}
                  setEditTodoDescription={setEditTodoDescription}
                  moveTargets={moveTargets}
                  isUpdating={updateTodoMutation.isPending}
                  isToggling={toggleTodoMutation.isPending}
                  isMoving={moveTodoMutation.isPending}
                  isSettingMyDay={setMyDayMutation.isPending}
                  onSave={() => void handleUpdateTodo()}
                  onCancelEdit={cancelEditTodo}
                  onStartEdit={startEditTodo}
                  onToggle={() => toggleTodoMutation.mutate(todo.id)}
                  onToggleMyDay={() => void handleToggleMyDay(todo)}
                  onMove={(categoryId) => void handleMoveTodo(todo.id, categoryId)}
                  onDelete={() => void handleDeleteTodo(todo.id)}
                />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function TodoRow({
  todo,
  categoryName,
  editingTodoId,
  editTodoTitle,
  editTodoDescription,
  setEditTodoTitle,
  setEditTodoDescription,
  moveTargets,
  isUpdating,
  isToggling,
  isMoving,
  isSettingMyDay,
  onSave,
  onCancelEdit,
  onStartEdit,
  onToggle,
  onToggleMyDay,
  onMove,
  onDelete,
}: {
  todo: Todo;
  categoryName?: string;
  editingTodoId: string | null;
  editTodoTitle: string;
  editTodoDescription: string;
  setEditTodoTitle: (value: string) => void;
  setEditTodoDescription: (value: string) => void;
  moveTargets: Category[];
  isUpdating: boolean;
  isToggling: boolean;
  isMoving: boolean;
  isSettingMyDay: boolean;
  onSave: () => void;
  onCancelEdit: () => void;
  onStartEdit: (todo: Todo) => void;
  onToggle: () => void;
  onToggleMyDay: () => void;
  onMove: (categoryId: string) => void;
  onDelete: () => void;
}) {
  return (
    <li
      className={`rounded-md border p-3 ${
        todo.completed ? 'bg-accent/40' : 'bg-card'
      }`}
    >
      {editingTodoId === todo.id ? (
        <div className="grid gap-3">
          <Input
            value={editTodoTitle}
            onChange={(e) => setEditTodoTitle(e.target.value)}
            placeholder="Task title"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave();
              if (e.key === 'Escape') onCancelEdit();
            }}
          />
          <Input
            value={editTodoDescription}
            onChange={(e) => setEditTodoDescription(e.target.value)}
            placeholder="Description (optional)"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={onSave}
              disabled={isUpdating || !editTodoTitle.trim()}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelEdit}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={onToggle}
            disabled={isToggling}
            className="shrink-0"
            aria-label={
              todo.completed ? 'Mark as incomplete' : 'Mark as complete'
            }
          />

          <div className="min-w-0 flex-1 overflow-hidden">
            <p
              className={`truncate font-medium ${
                todo.completed ? 'line-through opacity-70' : ''
              }`}
            >
              {todo.title}
            </p>
            {todo.description ? (
              <p className="truncate text-sm text-muted-foreground">
                {todo.description}
              </p>
            ) : null}
            {categoryName ? (
              <p className="truncate text-xs text-muted-foreground">
                {categoryName}
                {todo.inMyDay ? ' · My Day' : ''}
              </p>
            ) : null}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label="Task actions"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                className="gap-2"
                onClick={() => onStartEdit(todo)}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <FolderKanban className="size-4" />
                  Move to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {moveTargets.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      disabled={
                        !category.id ||
                        category.id === String(todo.categoryId) ||
                        isMoving
                      }
                      onSelect={() => {
                        if (!category.id) return;
                        onMove(category.id);
                      }}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                className="gap-2"
                onClick={onToggleMyDay}
                disabled={isSettingMyDay}
              >
                <Sun className="size-4" />
                {todo.inMyDay ? 'Remove from My Day' : 'Add to My Day'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={onToggle}
                disabled={isToggling}
              >
                <CheckCircle2 className="size-4" />
                {todo.completed ? 'Mark incomplete' : 'Complete'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </li>
  );
}
