import { registerUser, loginUser, refreshTokens } from "./auth.service.js";

export const register = async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
};

export const login = async (req, res) => {
  const result = await loginUser(req.body);
  res.json(result);
};

export const refresh = async (req, res) => {
  const result = await refreshTokens(req.body.refreshToken);
  res.json(result);
};

export const me = async (req, res) => {
  res.json(req.user);
};
