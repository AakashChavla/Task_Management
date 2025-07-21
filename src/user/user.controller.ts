import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/UserCreate.dto';
import { Response } from 'express';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Email already in use' })
  async registerUser(
    @Res() res: Response,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.userService.createUser(res, createUserDto);
  }

  @Post('verify-otp')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        otp: { type: 'number', example: 123456 },
      },
      required: ['email', 'otp'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully. Welcome email sent!',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(
    @Res() res: Response,
    @Body() body: { email: string; otp: number },
  ) {
    return this.userService.verifyUserOtp(res, body.email, body.otp);
  }
}
