import { Controller, Post, Body, Res } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/UserCreate.dto";
import { Response } from "express";
import { ApiTags, ApiBody, ApiResponse } from "@nestjs/swagger";

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
}
