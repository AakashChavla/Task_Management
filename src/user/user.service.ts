import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdatePasswordDto } from './dto/UserCreate.dto';
import { DatabaseService } from '../database/database.service';
import { ResponseService } from '../common/services/response.service';
import { Response } from 'express';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MailService } from '../common/mail/mail.service';
import { HelperService } from '../common/helper/otp';
import { Role } from 'generated/prisma';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly helper = new HelperService();

  constructor(
    private readonly db: DatabaseService,
    private readonly responseService: ResponseService,
    private readonly mailService: MailService,
  ) {}

async createUser(
  res: Response,
  createUserDto: CreateUserDto,
): Promise<Response> {
  try {
    // Check if email already exists
    const existingUser = await this.db.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      if (!existingUser.isVerified) {
        // Prepare update data
        const updateData: any = {
          name: createUserDto.name,
          password: await bcrypt.hash(createUserDto.password, 10),
          isApproved: createUserDto.isApproved ?? true,
          role: createUserDto.role ?? 'MANAGER',
          otp: this.helper.generateOTP(),
          otpCreatedAt: new Date(),
        };

        const updatedUser = await this.db.user.update({
          where: { email: createUserDto.email },
          data: updateData,
        });

        // Send OTP email
        await this.mailService.sendVerificationOTPEmail(
          updatedUser.email,
          updateData.otp,
          updatedUser.name,
        );
        return this.responseService.sendSuccess(
          res,
          HttpStatus.OK,
          'Otp Sent Successfully',
        );
      }
      // If user is verified, block registration
      return this.responseService.sendError(
        res,
        HttpStatus.BAD_REQUEST,
        'Email already Registered',
      );
    }

    // 1. Create the user first (without companyId)
    const otp = this.helper.generateOTP();
    const otpCreatedAt = new Date();
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.db.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        isApproved: createUserDto.isApproved ?? true,
        role: createUserDto.role ?? 'MANAGER',
        otp,
        otpCreatedAt,
        // companyId will be set after company creation
      },
    });

    // 2. Create the company with ownerId as the new user's id
    const company = await this.db.company.create({
      data: {
        companyName: createUserDto.company.companyName,
        ownerId: user.id,
      },
    });

    // 3. Update the user with the new companyId
    await this.db.user.update({
      where: { id: user.id },
      data: { companyId: company.id },
    });

    // Send OTP email
    await this.mailService.sendVerificationOTPEmail(
      user.email,
      otp,
      user.name,
    );

    return this.responseService.sendSuccess(
      res,
      HttpStatus.CREATED,
      'User and company created successfully. OTP sent.',
    );
  } catch (error) {
    this.logger.error('Error creating user and company:', error);
    return this.responseService.sendError(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user and company',
    );
  }
}

  async verifyUserOtp(
    res: Response,
    email: string,
    otp: number,
  ): Promise<Response> {
    try {
      // Find user by email
      const user = await this.db.user.findUnique({
        where: { email },
      });

      if (!user) {
        return this.responseService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          'User not found',
        );
      }

      // Check if already verified
      if (user.isVerified) {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          'User already verified',
        );
      }

      // Check OTP and expiry (15 min)
      const isOtpValid =
        user.otp === otp &&
        user.otpCreatedAt &&
        new Date().getTime() - new Date(user.otpCreatedAt).getTime() <=
          15 * 60 * 1000;

      if (!isOtpValid) {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          'Invalid or expired OTP',
        );
      }

      // Mark user as verified and clear OTP fields
      const verifiedUser = await this.db.user.update({
        where: { email },
        data: {
          isVerified: true,
          otp: null,
          otpCreatedAt: null,
        },
      });

      // Send welcome email
      await this.mailService.sendWelcomeEmail(
        verifiedUser.email,
        verifiedUser.name,
      );

      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        'Email verified successfully. Welcome email sent!',
        verifiedUser,
      );
    } catch (error) {
      this.logger.error('Error verifying OTP:', error);
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to verify OTP',
      );
    }
  }

  async updateUserPassword(
    res: Response,
    userId: string,
    dto: UpdatePasswordDto,
  ): Promise<Response> {
    try {
      // Find user by id
      const user = await this.db.user.findUnique({ where: { id: userId } });

      if (!user) {
        return this.responseService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          'User not found',
        );
      }

      // Check old password
      const isOldPasswordValid = await bcrypt.compare(
        dto.oldPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          'Old password is incorrect',
        );
      }

      // Check new and confirm password match
      if (dto.newPassword !== dto.confirmPassword) {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          'New password and confirm password do not match',
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

      // Update password
      await this.db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        'Password updated successfully',
      );
    } catch (error) {
      this.logger.error('Error updating password:', error);
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update password',
      );
    }
  }

  // ========== for Admin ======//
async getRoleWiseList(
  res: Response,
  role?: Role,
): Promise<Response> {
  try {
    if (role) {
      // Fetch users of a specific role
      const users = await this.db.user.findMany({
        where: { role, isVerified: true },
      });
      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        `Fetched users with role ${role}`,
        users,
      );
    } else {
      // Fetch all roles grouped
      const admins = await this.db.user.findMany({
        where: { role: Role.ADMIN, isVerified: true },
      });
      const managers = await this.db.user.findMany({
        where: { role: Role.MANAGER, isVerified: true },
      });
      const usersList = await this.db.user.findMany({
        where: { role: Role.USER, isVerified: true },
      });
      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        'Fetched users grouped by role',
        { admins, managers, users: usersList },
      );
    }
  } catch (error) {
    this.logger.error('Error getting users by role:', error.message);
    return this.responseService.sendError(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
    );
  }
}
}
