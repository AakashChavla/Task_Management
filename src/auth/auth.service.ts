import { Injectable, UnauthorizedException, HttpStatus } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { ResponseService } from "src/common/services/response.service";
import { Response } from "express";
import { LoginDto, VerifyTokenDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly responseService: ResponseService
  ) {}

  async login(res: Response, loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const user = await this.db.user.findUnique({
        where: { email },
        include: { company: true },
      });

      if (!user) {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          "User not found"
        );
      }

      if (!user.isVerified) {
        return this.responseService.sendError(
          res,
          HttpStatus.UNAUTHORIZED,
          "Email not verified. Please verify your email before logging in."
        );
      }

      if (!user.company || !user.company.isApproved) {
        return this.responseService.sendError(
          res,
          HttpStatus.UNAUTHORIZED,
          "Company not approved or not found."
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return this.responseService.sendError(
          res,
          HttpStatus.UNAUTHORIZED,
          "Invalid credentials"
        );
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company.id,
      };
      const token = this.jwtService.sign(payload);

      // Update user's lastLoginAt and sessionToken
      await this.db.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          sessionToken: token,
        },
      });

      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Login successful",
        { access_token: token }
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Login failed",
        error.message || error
      );
    }
  }

  async verifyToken(res: Response, verifyTokenDto: VerifyTokenDto) {
    try {
      const { token } = verifyTokenDto;
      const payload = this.jwtService.verify(token);
      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Token is valid",
        { payload }
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.UNAUTHORIZED,
        "Invalid or expired token",
        error.message || error
      );
    }
  }
}
