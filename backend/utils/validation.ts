import { Request } from 'express';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

// Input sanitization function
export const sanitizeInput = (data: any): any => {
  if (typeof data === 'string') {
    return sanitizeHtml(data, {
      allowedTags: [],
      allowedAttributes: {},
    });
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitizedData: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedData[key] = sanitizeInput(value);
    }
    return sanitizedData;
  }

  return data;
};

// Validation schemas
const productSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
  category_id: z.string().uuid(),
});

const orderSchema = z.object({
  shipping_address: z.string().min(1),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
  })),
});

const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500),
});

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
});

// Schema mapping
const schemas: Record<string, z.ZodSchema> = {
  '/api/products': productSchema,
  '/api/orders': orderSchema,
  '/api/reviews': reviewSchema,
  '/api/users': userSchema,
};

// Validation function
export const validateInput = (req: Request): string[] => {
  const schema = schemas[req.path];
  if (!schema) {
    return [];
  }

  try {
    schema.parse(req.body);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
    }
    return ['Invalid input'];
  }
};
