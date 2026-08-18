/**
 * Restaurant / menu platform integrations — the single seam where external
 * delivery-platform credentials plug in.
 *
 * ── REAL-WORLD REALITY CHECK ────────────────────────────────────────────────
 *  • Swiggy and Zomato do NOT provide a public, self-serve API key that lets you
 *    "add restaurants" or push menus. Zomato's old public API was read-only and
 *    was discontinued for new developers (~2021). Swiggy has no public API.
 *  • Onboarding a restaurant onto those platforms is a contractual / KYC process
 *    done through their PARTNER portals. Their partner/merchant APIs are private
 *    and granted only to approved merchants & POS integrators under agreement.
 *  • The practical way to run a multi-platform aggregator is a POS / middleware
 *    provider that already integrates with Swiggy, Zomato, etc. and issues YOU a
 *    single API key — e.g. UrbanPiper, Petpooja, Rista, Posist.
 *
 * Put real keys in a .env file (see .env.example). With NO keys, every call runs
 * in MOCK mode so the UI is fully functional during development.
 * ────────────────────────────────────────────────────────────────────────────
 */

const env = import.meta.env ?? {};

export const PROVIDERS = {
  urbanpiper: {
    id: "urbanpiper",
    name: "UrbanPiper",
    note: "Middleware that syncs menus & orders across Swiggy, Zomato & more.",
    keyVar: "VITE_URBANPIPER_API_KEY",
    docs: "https://developer.urbanpiper.com",
    kind: "middleware",
  },
  swiggy: {
    id: "swiggy",
    name: "Swiggy Partner",
    note: "Private partner API — requires an approved Swiggy merchant agreement.",
    keyVar: "VITE_SWIGGY_PARTNER_KEY",
    docs: "https://partner.swiggy.com",
    kind: "platform",
  },
  zomato: {
    id: "zomato",
    name: "Zomato Partner",
    note: "Partner/merchant API only — the old public API was discontinued.",
    keyVar: "VITE_ZOMATO_PARTNER_KEY",
    docs: "https://www.zomato.com/partner",
    kind: "platform",
  },
};

export function providerKey(id) {
  const p = PROVIDERS[id];
  return p ? env[p.keyVar] : undefined;
}

export function isConfigured(id) {
  return Boolean(providerKey(id));
}

/* Per-provider REST bases. Only implemented providers appear here. */
const ENDPOINTS = {
  urbanpiper: "https://api.urbanpiper.com/hub/api/v1",
};

/**
 * Pull the stores/restaurants this account manages on a platform.
 * With a key present we hit the provider; otherwise we return clearly labelled
 * mock data so the "Import" button is demoable without credentials.
 *
 * @returns {Promise<Array>} restaurants in the app's shape (with a `source` tag)
 */
export async function importStores(providerId, { signal } = {}) {
  const provider = PROVIDERS[providerId];
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);

  const key = providerKey(providerId);
  if (!key) {
    // No credentials → deterministic demo payload.
    await delay(600, signal);
    return mockStores(provider);
  }

  const base = ENDPOINTS[providerId];
  if (!base) {
    // Fail loudly rather than pretend we called a platform we can't reach.
    throw new Error(`${provider.name} live client is not implemented in this build.`);
  }

  const res = await fetch(`${base}/stores/`, {
    signal,
    headers: {
      Authorization: `apikey ${key}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`${provider.name} request failed (${res.status})`);
  const data = await res.json();
  return normaliseStores(providerId, data);
}

/**
 * Publish a dish to a connected platform (outbound menu-sync). Stubbed so it's
 * obvious exactly where the real menu-push call goes once credentials exist.
 */
export async function publishDish(providerId, dish, { signal } = {}) {
  const key = providerKey(providerId);
  if (!key) {
    await delay(400, signal);
    return { ok: true, mocked: true, ref: `mock-${slug(dish.name)}` };
  }
  // Real menu-push would POST to the provider's menu/item endpoint here.
  throw new Error(`${PROVIDERS[providerId]?.name} publish is not implemented in this build.`);
}

/* Map a provider-specific payload into the app's restaurant shape. */
function normaliseStores(providerId, data) {
  const list = data?.objects ?? data?.stores ?? data?.data ?? [];
  return list.map((s, i) => ({
    id: `${providerId}-${s.id ?? i}`,
    name: s.name ?? s.store_name ?? "Unnamed store",
    cuisine: s.cuisine ?? "Mixed",
    area: s.city ?? s.address?.city ?? "—",
    rating: s.rating ?? 4.5,
    reviews: s.review_count ?? 0,
    orders: s.weekly_orders ?? 0,
    prep: s.avg_prep_time ?? 20,
    status: s.is_active === false ? "Closed" : "Open",
    trend: "+0%",
    commission: s.commission ?? 18,
    source: PROVIDERS[providerId].name,
  }));
}

function mockStores(provider) {
  const base = [
    { name: "The Biryani Company", cuisine: "Hyderabadi", area: "Andheri", rating: 4.7, reviews: 3120, orders: 640, prep: 26, commission: 20 },
    { name: "Pizza Piazza", cuisine: "Italian", area: "Versova", rating: 4.5, reviews: 1890, orders: 410, prep: 22, commission: 21 },
  ];
  return base.map((b, i) => ({
    id: `${provider.id}-mock-${i}`,
    status: "Open",
    trend: "+0%",
    source: provider.name,
    ...b,
  }));
}

const slug = (s = "") => s.toLowerCase().replace(/\s+/g, "-");

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
