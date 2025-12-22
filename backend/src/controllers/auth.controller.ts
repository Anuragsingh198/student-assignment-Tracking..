import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { IApiResponse } from '../types';
import { asyncHandler } from '../middleware/error.middleware';

export const register = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  const { name, email, password, role } = req.body;

  const user = await AuthService.register({ name, email, password, role });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

export const login = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  const { email, password } = req.body;

  const { user, tokens } = await AuthService.login({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    },
  });
});

export const refreshToken = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  const { refreshToken } = req.body;

  const tokens = await AuthService.refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: { tokens },
  });
});

export const getProfile = asyncHandler(async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const user = await AuthService.getUserById(req.user.userId);

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});
