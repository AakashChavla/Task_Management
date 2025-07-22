import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdatePasswordDto } from './dto/UserCreate.dto';
import { Response } from 'express';
import { ApiTags, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

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

  @Patch('update-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Old password is incorrect or new/confirm do not match',
  })
  async updateUserPassword(
    @Res() res: Response,
    @Req() req,
    @Body() dto: UpdatePasswordDto,
  ) {
    // userId from JWT payload (set by JwtStrategy)
    return this.userService.updateUserPassword(res, req.user.userId, dto);
  }
}
