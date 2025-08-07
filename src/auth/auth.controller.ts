import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, VerifyTokenDto } from './dto/auth.dto';
import { Response } from 'express';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or not verified' })
  @ApiResponse({ status: 500, description: 'Login failed' })
  async login(@Res() res: Response, @Body() loginDto: LoginDto) {
    return this.authService.login(res, loginDto);
  }

  @Post('verify-token')
  @ApiBody({ type: VerifyTokenDto })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async verifyToken(@Res() res: Response, @Body() verifyTokenDto: VerifyTokenDto) {
    return this.authService.verifyToken(res, verifyTokenDto);
  }
}