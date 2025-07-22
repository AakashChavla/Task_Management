import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdatePasswordDto } from './dto/UserCreate.dto';
import { DatabaseService } from '../database/database.service';
import { ResponseService } from '../common/services/response.service';
import { Response } from 'express';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MailService } from '../common/mail/mail.service';
import { HelperService } from '../common/helper/otp';

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
        include: { Project: true },
      });

      // Generate OTP and timestamp
      const otp = this.helper.generateOTP();
      const otpCreatedAt = new Date();

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      if (existingUser) {
        if (!existingUser.isVerified) {
          // Prepare update data
          const updateData: any = {
            name: createUserDto.name,
            password: hashedPassword,
            isApproved: createUserDto.isApproved ?? true,
            role: createUserDto.role ?? 'MANAGER',
            otp,
            otpCreatedAt,
          };

          // If project is provided, upsert (update or create) the project
          if (createUserDto.project) {
            if (existingUser.Project && existingUser.Project.length > 0) {
              // Update all existing projects (or adjust logic as needed)
              updateData.Project = {
                update: existingUser.Project.map((proj) => ({
                  where: { id: proj.id },
                  data: {
                    name: createUserDto.project?.name,
                    description: createUserDto.project?.description,
                  },
                })),
              };
            } else {
              // Create a new project
              updateData.Project = {
                create: {
                  name: createUserDto.project?.name,
                  description: createUserDto.project?.description,
                },
              };
            }
          }

          const updatedUser = await this.db.user.update({
            where: { email: createUserDto.email },
            data: updateData,
            include: { Project: true },
          });

          // Send OTP email
          await this.mailService.sendVerificationOTPEmail(
            updatedUser.email,
            otp,
            updatedUser.name,
          );
          return this.responseService.sendSuccess(
            res,
            HttpStatus.OK,
            'Otp Sent Successfully',
            // updatedUser,
          );
        }
        // If user is verified, block registration
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          'Email already Registered',
        );
      }

      const userData: any = {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        isApproved: createUserDto.isApproved ?? true,
        role: createUserDto.role ?? 'MANAGER',
        otp,
        otpCreatedAt,
      };

      let user;

      // If project is provided, create it with the user
      if (createUserDto.project) {
        user = await this.db.user.create({
          data: {
            ...userData,
            Project: {
              create: {
                name: createUserDto.project?.name,
                description: createUserDto.project?.description,
              },
            },
          },
          include: { Project: true },
        });
      } else {
        user = await this.db.user.create({
          data: userData,
        });
      }

      // Send OTP email
      await this.mailService.sendVerificationOTPEmail(
        user.email,
        otp,
        user.name,
      );

      return this.responseService.sendSuccess(
        res,
        HttpStatus.CREATED,
        'Otp sent successfully',
        // user,
      );
    } catch (error) {
      this.logger.error('Error creating user:', error);
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create user',
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
    const isOldPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
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
}
