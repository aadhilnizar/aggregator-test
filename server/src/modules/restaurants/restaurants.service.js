import { prisma } from "../../prisma.js";
import { forbidden, notFound } from "../../lib/http-error.js";

/** List restaurants, scoped by role (a RESTAURANT owner sees only their own). */
export async function listRestaurants(query, user) {
  const { page, pageSize, search, status, cuisine } = query;

  const where = {};
  if (user.role === "RESTAURANT") where.ownerId = user.id;
  if (status) where.status = status;
  if (cuisine) where.cuisine = cuisine;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { cuisine: { contains: search, mode: "insensitive" } },
      { area: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true, menuItems: true } } },
    }),
    prisma.restaurant.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function getRestaurant(id) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw notFound("Restaurant not found");
  return restaurant;
}

export async function createRestaurant(dto, user) {
  return prisma.restaurant.create({
    // A RESTAURANT owner owns what they create; an ADMIN creates unowned records.
    data: { ...dto, ownerId: user.role === "RESTAURANT" ? user.id : null },
  });
}

export async function updateRestaurant(id, dto, user) {
  await assertCanEdit(id, user);
  return prisma.restaurant.update({ where: { id }, data: dto });
}

export async function setRestaurantStatus(id, status, user) {
  await assertCanEdit(id, user);
  return prisma.restaurant.update({ where: { id }, data: { status } });
}

/** Row-level guard: ADMIN can edit anything; others only their own restaurant. */
async function assertCanEdit(id, user) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw notFound("Restaurant not found");
  if (user.role !== "ADMIN" && restaurant.ownerId !== user.id) {
    throw forbidden("Not your restaurant");
  }
  return restaurant;
}
