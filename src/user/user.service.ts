import { Injectable, HttpStatus } from "@nestjs/common";
import { ResponseService } from "src/common/services/response.service";
import { DatabaseService } from "src/database/database.service";
import {
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from "./dto/UserCreate.dto";
import * as bcrypt from "bcrypt";
import {
  PaginationMeta,
  PaginationQuery,
} from "src/common/interfaces/pagination";
import { MailService } from "src/common/mail/mail.service";
import { addMinutes } from "date-fns"; // npm install date-fns (or use new Date logic)


@Injectable()
export class UserService {
  constructor(
    private readonly db: DatabaseService,
    private readonly responseService: ResponseService,
    private readonly mailService: MailService
  ) {}

 async registerUser(res: Response, createUserDto: CreateUserDto) {
  try {
    // Check if email already exists
    const existingUser = await this.db.user.findUnique({
      where: { email: createUserDto.email },
    });

    // Generate OTP and expiry (10 minutes from now)
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpCreatedAt = new Date();

    if (existingUser) {
      if (!existingUser.isVerified) {
        // Update user data and save OTP
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const updatedUser = await this.db.user.update({
          where: { email: createUserDto.email },
          data: {
            name: createUserDto.name,
            password: hashedPassword,
            isApproved: true,
            otp,
            otpCreatedAt,
          },
        });

        // Update or create company for this user
        let company;
        if (updatedUser.companyId) {
          company = await this.db.company.update({
            where: { id: updatedUser.companyId },
            data: {
              companyName: createUserDto.companyName,
              isApproved: true,
              ownerId: updatedUser.id,
            },
          });
        } else {
          company = await this.db.company.create({
            data: {
              companyName: createUserDto.companyName,
              isApproved: true,
              ownerId: updatedUser.id,
            },
          });
          // Link company to user
          await this.db.user.update({
            where: { id: updatedUser.id },
            data: { companyId: company.id },
          });
        }

        // Send OTP email
        await this.mailService.sendEmail({
          to: updatedUser.email,
          subject: "Your Task Management OTP Verification Code",
          html: this.mailService.getOtpVerificationMailTemplate(updatedUser.name, otp.toString()),
        });

        return this.responseService.sendSuccess(
          res,
          HttpStatus.OK,
          "User and company registered successfully. Please check your email for the OTP.",
          { userId: updatedUser.id, companyId: company.id }
        );
      }
      // If user is verified, block registration
      return this.responseService.sendError(
        res,
        HttpStatus.BAD_REQUEST,
        "Email already registered"
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user first (without companyId), save OTP and expiry
    const user = await this.db.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        isApproved: true,
        isVerified: false,
        otp,
        otpCreatedAt,
      },
    });

    // Create company with ownerId as the new user's id
    const company = await this.db.company.create({
      data: {
        companyName: createUserDto.companyName,
        isApproved: true,
        ownerId: user.id,
      },
    });

    // Update user with companyId
    await this.db.user.update({
      where: { id: user.id },
      data: { companyId: company.id },
    });

    // Send OTP email
    await this.mailService.sendEmail({
      to: user.email,
      subject: "Your Task Management OTP Verification Code",
      html: this.mailService.getOtpVerificationMailTemplate(user.name, otp.toString()),
    });

    return this.responseService.sendSuccess(
      res,
      HttpStatus.CREATED,
      "User and company registered successfully. Please check your email for the OTP.",
      { userId: user.id, companyId: company.id }
    );
  } catch (error) {
    return this.responseService.sendError(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      "Registration failed",
      error.message || error
    );
  }
}

  async updateUser(
    res: Response,
    userId: string,
    updateUserDto: UpdateUserDto
  ) {
    try {
      // Find the user
      const user = await this.db.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        return this.responseService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          "User not found"
        );
      }

      // Prepare update data for user
      const userUpdateData: any = {};
      if (updateUserDto.name) userUpdateData.name = updateUserDto.name;
      if (updateUserDto.email) userUpdateData.email = updateUserDto.email;

      // Update user
      const updatedUser = await this.db.user.update({
        where: { id: userId },
        data: userUpdateData,
      });

      // Update company if companyName is provided
      let updatedCompany: any = null;
      if (updateUserDto.companyName && user.companyId) {
        updatedCompany = await this.db.company.update({
          where: { id: user.companyId },
          data: { companyName: updateUserDto.companyName },
        });
      }

      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "User updated successfully",
        { user: updatedUser, company: updatedCompany }
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Update failed",
        error.message || error
      );
    }
  }

  async updatePassword(
    res: Response,
    userId: string,
    updatePasswordDto: UpdatePasswordDto
  ) {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return this.responseService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          "User not found"
        );
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(
        updatePasswordDto.oldPassword,
        user.password
      );
      if (!isOldPasswordValid) {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          "Old password is incorrect"
        );
      }

      // Hash and update new password
      const hashedNewPassword = await bcrypt.hash(
        updatePasswordDto.newPassword,
        10
      );
      await this.db.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Password updated successfully"
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Password update failed",
        error.message || error
      );
    }
  }

  async listCompanyUsers(
    res: Response,
    companyId: string,
    PaginationQuery: PaginationQuery
  ) {
    try {
      const {
        limit = 10,
        page = 1,
        orderBy = "asc",
        orderField = "name",
      } = PaginationQuery;

      // Count total users for pagination meta
      const totalItems = await this.db.user.count({
        where: { companyId },
      });

      // Fetch users with pagination
      const users = await this.db.user.findMany({
        where: { companyId },
        orderBy: { [orderField]: orderBy },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isApproved: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Pagination meta
      const pagination: PaginationMeta = {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page * limit < totalItems,
        hasPreviousPage: page > 1,
      };

      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Company users fetched successfully",
        { users, pagination }
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Failed to fetch company users",
        error.message || error
      );
    }
  }
}
