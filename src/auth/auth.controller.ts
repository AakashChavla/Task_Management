import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'yourPassword123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token and user info.',
  })
  @ApiResponse({ status: 400, description: 'User not found.' })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or email not verified.',
  })
  async login(
    @Res() res: Response,
    @Body() body: { email: string; password: string },
  ) {
    return this.authService.login(res, body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile (requires JWT Bearer token)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user profile.',
    schema: {
      example: {
        message: 'Token is valid',
        user: {
          userId: 'uuid',
          email: 'user@example.com',
          role: 'USER',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Req() req) {
    return { message: 'Token is valid', user: req.user };
  }
}
