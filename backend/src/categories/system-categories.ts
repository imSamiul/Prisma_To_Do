export const DEFAULT_CATEGORY_SLUG = 'tasks';

export const SYSTEM_CATEGORIES = [
  {
    slug: 'my-day',
    name: 'My Day',
    description: 'Tasks planned for today',
  },
  {
    slug: 'important',
    name: 'Important',
    description: 'Starred and high-priority tasks',
  },
  {
    slug: 'tasks',
    name: 'Tasks',
    description: 'Your default task list',
  },
] as const;

export type SystemCategorySlug = (typeof SYSTEM_CATEGORIES)[number]['slug'];

export const SYSTEM_CATEGORY_NAMES = SYSTEM_CATEGORIES.map(
  (category) => category.name.toLowerCase(),
);
