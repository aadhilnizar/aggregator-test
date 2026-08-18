import { prisma } from "../../prisma.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { signAccess, signRefresh, verifyRefresh } from "../../lib/jwt.js";
import { conflict, unauthorized } from "../../lib/http-error.js";

const publicUser = { id: true, email: true, name: true, role: true };

function issueTokens(user) {
  const payload = { sub: user.id, role: user.role };
  return { user, accessToken: signAccess(payload), refreshToken: signRefresh(payload) };
}

export async function registerUser({ email, password, name, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict("Email already registered");

  const user = await prisma.user.create({
    data: { email, name, role: role || "CUSTOMER", passwordHash: await hashPassword(password) },
    select: publicUser,
  });
  return issueTokens(user);
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw unauthorized("Invalid credentials");

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw unauthorized("Invalid credentials");

  return issueTokens({ id: user.id, email: user.email, name: user.name, role: user.role });
}

export async function refreshTokens(refreshToken) {
  let payload;
  try {
    payload = verifyRefresh(refreshToken);
  } catch {
    throw unauthorized("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: publicUser,
  });
  if (!user) throw unauthorized("User no longer exists");

  return issueTokens(user);
}
