import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models';
import { IAuthTokens, IJwtPayload, ILoginRequest, IRegisterRequest, UserRole } from '../types';
import { config } from '../config/config';

export class AuthService {
  static async register(userData: IRegisterRequest): Promise<IUserDocument> {
    const { email } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = new User(userData);
    await user.save();

    return user;
  }

  static async login(credentials: ILoginRequest): Promise<{ user: IUserDocument; tokens: IAuthTokens }> {
    const { email, password } = credentials;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { user, tokens };
  }

  static async refreshAccessToken(refreshToken: string): Promise<IAuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as IJwtPayload;

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private static generateTokens(payload: { userId: string; email: string; role: UserRole }): IAuthTokens {
    const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRE,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRE,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): IJwtPayload {
    try {
      return jwt.verify(token, config.JWT_ACCESS_SECRET) as IJwtPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token: string): IJwtPayload {
    try {
      return jwt.verify(token, config.JWT_REFRESH_SECRET) as IJwtPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async getUserById(userId: string): Promise<IUserDocument | null> {
    return User.findById(userId);
  }

  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.password = newPassword;
    await user.save();
  }
}
