import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/index';
import { ApiError } from '../middleware/errorHandler';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw ApiError.badRequest('Email, password, and name are required');
    }

    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const user = await UserModel.create({
      email,
      password,
      name,
      role: 'viewer'
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw ApiError.forbidden('Account is not active');
    }

    await user.update({ lastLoginAt: new Date() });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findByPk(req.user!.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findByPk(req.user!.id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const { name, preferences } = req.body;

    await user.update({
      ...(name && { name }),
      ...(preferences && { preferences })
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/change-password', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('Current password and new password are required');
    }

    const user = await UserModel.findByPk(req.user!.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;
