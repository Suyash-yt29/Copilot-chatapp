import { Request, Response } from 'express';
import { GroupModel, GroupMemberModel } from '../models/index.js';
import { asyncHandler } from '../middleware/error.js';

export const createGroup = asyncHandler(async (req: any, res: Response) => {
  const { name, description } = req.body;
  const group = await GroupModel.create(name, description, req.userId);
  await GroupMemberModel.addMember(group.id, req.userId, 'admin');
  res.json(group);
});

export const getGroupsForUser = asyncHandler(async (req: any, res: Response) => {
  const groups = await GroupModel.getGroupsForUser(req.userId);
  res.json(groups);
});

export const getGroupById = asyncHandler(async (req: Request, res: Response) => {
  const group = await GroupModel.getById(req.params.id);
  res.json(group);
});

export const addGroupMember = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = req.body;
  const member = await GroupMemberModel.addMember(req.params.id, userId, role);
  res.json(member);
});

export const getGroupMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await GroupMemberModel.getMembers(req.params.id);
  res.json(members);
});
