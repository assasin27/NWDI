import { z } from 'zod';

// Common schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const productSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
  category_id: z.string().uuid(),
  certification: z.string().optional(),
  region: z.string(),
  image_url: z.string().url().optional(),
});

export const orderSchema = z.object({
  shipping_address: z.string().min(1),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  payment_method: z.enum(['card', 'paypal', 'bank_transfer']),
  notes: z.string().max(500).optional(),
});

export const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  address: z.string().min(1).max(200).optional(),
});

export const farmerSchema = z.object({
  farm_name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  region: z.string(),
  certification: z.string().optional(),
});

export const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  selected_variant: z.record(z.string(), z.string()).optional(),
});

export const wishlistItemSchema = z.object({
  product_id: z.string().uuid(),
});

export const notificationSettingsSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  order_updates: z.boolean(),
  marketing_emails: z.boolean(),
  price_alerts: z.boolean(),
});

export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().min(1),
  is_default: z.boolean().optional(),
  label: z.string().optional(),
});

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return async (req: any, res: any, next: any) => {
    try {
      // Parse and validate the request data
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Attach validated data to request
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.issues.map(err => ({
            path: err.path,
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
