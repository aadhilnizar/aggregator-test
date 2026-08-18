import { apiFetch } from "./http";

/** API client for the restaurants module (maps to /api/restaurants). */
export const RestaurantsApi = {
  list(params = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== "All")
    ).toString();
    return apiFetch(`/restaurants${qs ? `?${qs}` : ""}`);
  },
  create(data) {
    return apiFetch("/restaurants", { method: "POST", body: data });
  },
  update(id, data) {
    return apiFetch(`/restaurants/${id}`, { method: "PATCH", body: data });
  },
  setStatus(id, status) {
    return apiFetch(`/restaurants/${id}/status`, { method: "PATCH", body: { status } });
  },
};
