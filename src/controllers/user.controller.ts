import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { tokenService, userService } from '../services';
import { TokenType } from '@prisma/client';

const createUser = catchAsync(async (req, res) => {
  const { email, password, name, role } = req.body;
  const user = await userService.createUser(email, name, role);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const changeProfile = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Token not found');
  const payload = await tokenService.getPayload(token, TokenType.ACCESS);
  if (!payload) throw new Error('Payload not found');
  const userId = payload.sub;
  const user = await userService.updateUserById(userId, req.body);
  res.send(user);
});

const getProfile = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Token not found');
  const payload = await tokenService.getPayload(token, TokenType.ACCESS);
  if (!payload) throw new Error('Payload not found');
  const userId = payload.sub;
  const user = await userService.getUserById(userId);
  res.send(user);
});

export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changeProfile,
  getProfile
};
