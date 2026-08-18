import { z } from "zod";

const status = z.enum(["OPEN", "BUSY", "CLOSED"]);

export const createRestaurantSchema = z.object({
  name: z.string().min(2),
  cuisine: z.string().min(1),
  area: z.string().min(1),
  address: z.string().optional(),
  prepTime: z.coerce.number().int().min(1).optional(),
  commission: z.coerce.number().min(0).max(40).optional(),
  status: status.optional(),
  source: z.enum(["DIRECT", "SWIGGY", "ZOMATO", "URBANPIPER"]).optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export const statusSchema = z.object({ status });

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: status.optional(),
  cuisine: z.string().optional(),
});
