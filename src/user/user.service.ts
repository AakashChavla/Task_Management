import { Injectable, HttpStatus } from "@nestjs/common";
import { ResponseService } from "src/common/services/response.service";
import { DatabaseService } from "src/database/database.service";
import { CreateUserDto } from "./dto/UserCreate.dto";
import { Response } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    private readonly db: DatabaseService,
    private readonly responseService: ResponseService
  ) {}

  async registerUser(res: Response, createUserDto: CreateUserDto) {
    try {
      // Check if email already exists
      const existingUser = await this.db.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        if (!existingUser.isVerified) {
          // Update user data
          const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
          const updatedUser = await this.db.user.update({
            where: { email: createUserDto.email },
            data: {
              name: createUserDto.name,
              password: hashedPassword,
              isApproved: true,
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

          return this.responseService.sendSuccess(
            res,
            HttpStatus.OK,
            "User and company updated successfully",
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

      // Create user first (without companyId)
      const user = await this.db.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: hashedPassword,
          isApproved: true,
          isVerified: false,
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

      return this.responseService.sendSuccess(
        res,
        HttpStatus.CREATED,
        "User and company registered successfully",
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
}
