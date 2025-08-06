import {
  Controller,
  Post,
  Body,
  Res,
  Patch,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import {
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from "./dto/UserCreate.dto";
import { Response } from "express";
import { ApiTags, ApiBody, ApiResponse, ApiQuery, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PaginationQuery } from "src/common/interfaces/pagination";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { Roles } from "src/common/decorators/roles.decorator";

@ApiTags("user")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: "User and company registered successfully",
  })
  @ApiResponse({
    status: 200,
    description: "User and company updated successfully",
  })
  @ApiResponse({ status: 400, description: "Email already registered" })
  @ApiResponse({ status: 500, description: "Registration failed" })
  async registerUser(
    @Res() res: Response,
    @Body() createUserDto: CreateUserDto
  ) {
    return this.userService.registerUser(res, createUserDto);
  }

  @Patch("update-user")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the authenticated user's profile. Requires JWT Bearer token." })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 500, description: "Update failed" })
  async updateUser(
    @Res() res: Response,
    @GetUser("id") userId: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.updateUser(res, userId, updateUserDto);
  }

  @Patch("update-password")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the authenticated user's profile. Requires JWT Bearer token." })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: "Password updated successfully" })
  @ApiResponse({ status: 400, description: "Old password is incorrect" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 500, description: "Password update failed" })
  async updatePassword(
    @Res() res: Response,
    @GetUser("id") userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    return this.userService.updatePassword(res, userId, updatePasswordDto);
  }

  @Get("company/users")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("MANAGER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the authenticated user's profile. Requires JWT Bearer token." })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number",
  })
  @ApiQuery({
    name: "orderBy",
    required: false,
    type: String,
    description: "Order direction (asc/desc)",
  })
  @ApiQuery({
    name: "orderField",
    required: false,
    type: String,
    description: "Order by field (e.g. name)",
  })
  @ApiResponse({
    status: 200,
    description: "Company users fetched successfully",
  })
  @ApiResponse({ status: 500, description: "Failed to fetch company users" })
  async listCompanyUsers(
    @Res() res: Response,
    @GetUser("companyId") companyId: string,
    @Query() pagination: PaginationQuery
  ) {
    return this.userService.listCompanyUsers(res, companyId, pagination);
  }
}
