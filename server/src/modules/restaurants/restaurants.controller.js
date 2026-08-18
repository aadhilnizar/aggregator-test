import * as service from "./restaurants.service.js";

export const list = async (req, res) => res.json(await service.listRestaurants(req.query, req.user));

export const getOne = async (req, res) => res.json(await service.getRestaurant(req.params.id));

export const create = async (req, res) =>
  res.status(201).json(await service.createRestaurant(req.body, req.user));

export const update = async (req, res) =>
  res.json(await service.updateRestaurant(req.params.id, req.body, req.user));

export const setStatus = async (req, res) =>
  res.json(await service.setRestaurantStatus(req.params.id, req.body.status, req.user));
