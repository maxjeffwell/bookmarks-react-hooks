import { z } from 'zod';

// Bookmark schemas
export const createBookmarkSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  url: z.string()
    .url('Must be a valid URL')
    .max(2000, 'URL must be 2000 characters or less'),
  description: z.string()
    .max(1000, 'Description must be 1000 characters or less')
    .trim()
    .optional()
    .default(''),
  rating: z.union([
    z.number().int().min(0).max(5),
    z.string().regex(/^[0-5]$/).transform(Number)
  ]).optional().default(0),
  toggledRadioButton: z.boolean().optional().default(false),
  checked: z.boolean().optional().default(false)
});

export const updateBookmarkSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim()
    .optional(),
  url: z.string()
    .url('Must be a valid URL')
    .max(2000, 'URL must be 2000 characters or less')
    .optional(),
  description: z.string()
    .max(1000, 'Description must be 1000 characters or less')
    .trim()
    .optional(),
  rating: z.union([
    z.number().int().min(0).max(5),
    z.string().regex(/^[0-5]$/).transform(Number)
  ]).optional(),
  toggledRadioButton: z.boolean().optional(),
  checked: z.boolean().optional()
});

// Auth schemas
export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be 50 characters or less')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be 255 characters or less')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(7, 'Password must be at least 7 characters')
    .max(72, 'Password must be 72 characters or less')
});

export const loginSchema = z.object({
  login: z.string()
    .min(1, 'Login is required')
    .max(255, 'Login must be 255 characters or less')
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
    .max(72, 'Password must be 72 characters or less')
});

// AI schemas
export const generateTagsSchema = z.object({
  bookmarkId: z.string().uuid('Invalid bookmark ID').optional(),
  bookmark: z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).max(200),
    url: z.string().url(),
    description: z.string().max(1000).optional()
  }).optional()
}).refine(
  data => data.bookmarkId || data.bookmark,
  { message: 'Either bookmarkId or bookmark data is required' }
);

// Param schemas
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
});
