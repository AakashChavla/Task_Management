import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { ResponseService } from '../common/services/response.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly responseService: ResponseService,
  ) {}

  async login(res: Response, email: string, password: string) {
    try {
      const user = await this.db.user.findUnique({ where: { email } });

      if (!user) {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          'User not found',
        );
      }

      if (!user.isVerified) {
        return this.responseService.sendError(
          res,
          HttpStatus.UNAUTHORIZED,
          'Email not verified. Please verify your email before logging in.',
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return this.responseService.sendError(
          res,
          HttpStatus.UNAUTHORIZED,
          'Invalid credentials',
        );
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const token = this.jwtService.sign(payload);

      // Update user's lastLoginAt and sessionToken
      const updatedUser = await this.db.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          sessionToken: token,
        },
      });

      const { password: _pw, ...userData } = updatedUser;
      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        'Login successful',
        {
          access_token: token,
          user: userData,
        },
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Login failed',
        error.message || error,
      );
    }
  }
}