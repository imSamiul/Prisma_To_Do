'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  FolderKanban,
  ListTodo,
  Loader2,
  LogOut,
  Plus,
  Settings2,
  Star,
  Sun,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCategories,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  type Category,
} from '@/hooks/use-categories';
import apiClient from '@/lib/api-client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function categoryIcon(category: Category) {
  switch (category.slug) {
    case 'my-day':
      return Sun;
    case 'important':
      return Star;
    case 'tasks':
      return ListTodo;
    default:
      return FolderKanban;
  }
}

export function AppSidebar() {
  const hasMounted = useHasMounted();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get('category') ?? '';
  const { data, isPending } = useCategories();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const categories: Category[] = hasMounted ? (data?.data ?? []) : [];

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const systemCategories = categories.filter((category) => category.isSystem);
  const customCategories = categories.filter((category) => !category.isSystem);
  const showListsLoading = !hasMounted || isPending;

  async function handleLogout() {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // still leave the app even if logout request fails
    }
    queryClient.clear();
    router.refresh();
    router.push('/login');
  }

  function startAddingList() {
    setIsAddingList(true);
    setNewListName('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function createList() {
    const name = newListName.trim();
    if (!name || createCategoryMutation.isPending) return;

    try {
      const result = await createCategoryMutation.mutateAsync({ name });
      setNewListName('');
      setIsAddingList(false);

      const newCategoryId = result?.data?.id as string | undefined;
      if (newCategoryId) {
        router.push(`/dashboard?category=${newCategoryId}`);
      }
    } catch {
      // keep input open so the user can retry
    }
  }

  function startRename(category: Category) {
    setRenamingId(category.id);
    setRenameValue(category.name);
    requestAnimationFrame(() => renameInputRef.current?.focus());
  }

  async function saveRename() {
    if (!renamingId) return;
    const name = renameValue.trim();
    if (!name || updateCategoryMutation.isPending) return;

    try {
      await updateCategoryMutation.mutateAsync({ id: renamingId, name });
      setRenamingId(null);
      setRenameValue('');
    } catch {
      // keep rename input open
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-hunter-green-500/10 bg-vanilla-cream-800/95">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ListTodo className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Leaflist</span>
                  <span className="truncate text-xs text-hunter-green-400/80">
                    Plan with calm
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Smart lists</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/dashboard' && !selectedCategoryId}
                  tooltip="All tasks"
                >
                  <Link href="/dashboard">
                    <ListTodo />
                    <span>All tasks</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {showListsLoading ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Loader2 className="animate-spin" />
                    <span>Loading...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                systemCategories.map((category) => {
                  const Icon = categoryIcon(category);
                  return (
                    <SidebarMenuItem key={category.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          pathname === '/dashboard' &&
                          selectedCategoryId === category.id
                        }
                        tooltip={category.name}
                      >
                        <Link href={`/dashboard?category=${category.id}`}>
                          <Icon />
                          <span>{category.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/dashboard/categories')}
                  tooltip="Manage lists"
                >
                  <Link href="/dashboard/categories">
                    <Settings2 />
                    <span>Manage lists</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>My lists</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={startAddingList} tooltip="Add list">
                  <Plus />
                  <span>Add list</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {!showListsLoading
                ? customCategories.map((category) => (
                    <SidebarMenuItem key={category.id}>
                      {renamingId === category.id ? (
                        <div className="px-2 py-1">
                          <Input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                void saveRename();
                              }
                              if (e.key === 'Escape') {
                                setRenamingId(null);
                                setRenameValue('');
                              }
                            }}
                            onBlur={() => {
                              if (!renameValue.trim()) {
                                setRenamingId(null);
                                return;
                              }
                              void saveRename();
                            }}
                            className="h-8"
                            disabled={updateCategoryMutation.isPending}
                          />
                        </div>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={
                            pathname === '/dashboard' &&
                            selectedCategoryId === category.id
                          }
                          tooltip={`${category.name} (double-click to rename)`}
                        >
                          <Link
                            href={`/dashboard?category=${category.id}`}
                            onDoubleClick={(e) => {
                              e.preventDefault();
                              startRename(category);
                            }}
                          >
                            <FolderKanban />
                            <span>{category.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))
                : null}

              {isAddingList ? (
                <SidebarMenuItem>
                  <div className="px-2 py-1">
                    <Input
                      ref={inputRef}
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void createList();
                        }
                        if (e.key === 'Escape') {
                          setIsAddingList(false);
                          setNewListName('');
                        }
                      }}
                      onBlur={() => {
                        if (!newListName.trim()) {
                          setIsAddingList(false);
                        }
                      }}
                      placeholder="List name"
                      className="h-8"
                      disabled={createCategoryMutation.isPending}
                    />
                  </div>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Log out">
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
