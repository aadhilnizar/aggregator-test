/**
 * Thin API layer over the public DummyJSON service (https://dummyjson.com).
 * No API key required — used here to populate the Customers and Menu pages
 * with realistic remote data (names, avatars, food items, ratings, etc.).
 */
const BASE = "https://dummyjson.com";

export async function apiGet(path, { signal } = {}) {
  const res = await fetch(`${BASE}${path}`, { signal });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  return res.json();
}

/* Customers → real users with avatars, contact info and addresses. */
export function fetchCustomers(limit = 20) {
  return apiGet(
    `/users?limit=${limit}&select=firstName,lastName,email,phone,image,address,company`
  );
}

/* Menu → recipes act as menu items (name, image, cuisine, rating, timing). */
export function fetchMenu(limit = 24) {
  return apiGet(
    `/recipes?limit=${limit}&select=name,image,cuisine,difficulty,rating,reviewCount,caloriesPerServing,mealType,prepTimeMinutes,cookTimeMinutes,tags`
  );
}
