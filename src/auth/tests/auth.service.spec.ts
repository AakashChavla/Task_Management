import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseService } from '../../common/services/response.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let db: any;
  let jwtService: any;
  let responseService: any;

  const mockDb = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked.jwt.token'),
  };

  const mockResponseService = {
    sendSuccess: jest.fn(),
    sendError: jest.fn(),
  };

  beforeEach(async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ResponseService, useValue: mockResponseService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    db = module.get<DatabaseService>(DatabaseService);
    jwtService = module.get<JwtService>(JwtService);
    responseService = module.get<ResponseService>(ResponseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return error if user not found', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);
    const res: any = {};
    await service.login(res, 'test@example.com', 'password');
    expect(responseService.sendError).toHaveBeenCalledWith(
      res,
      expect.any(Number),
      'User not found'
    );
  });

  it('should return error if user is not verified', async () => {
    mockDb.user.findUnique.mockResolvedValue({ isVerified: false });
    const res: any = {};
    await service.login(res, 'test@example.com', 'password');
    expect(responseService.sendError).toHaveBeenCalledWith(
      res,
      expect.any(Number),
      'Email not verified. Please verify your email before logging in.'
    );
  });

  it('should return error if password is invalid', async () => {
    mockDb.user.findUnique.mockResolvedValue({ isVerified: true, password: 'hashed', email: 'test@example.com' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const res: any = {};
    await service.login(res, 'test@example.com', 'wrongpassword');
    expect(responseService.sendError).toHaveBeenCalledWith(
      res,
      expect.any(Number),
      'Invalid credentials'
    );
  });

  it('should login successfully and update user', async () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      password: 'hashed',
      isVerified: true,
      role: 'USER',
    };
    mockDb.user.findUnique.mockResolvedValue(user);
    mockDb.user.update.mockResolvedValue({ ...user, lastLoginAt: new Date(), sessionToken: 'mocked.jwt.token' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const res: any = {};
    await service.login(res, user.email, 'password');
    expect(mockDb.user.update).toHaveBeenCalled();
    expect(responseService.sendSuccess).toHaveBeenCalledWith(
      res,
      expect.any(Number),
      'Login successful',
      expect.objectContaining({
        access_token: 'mocked.jwt.token',
        user: expect.objectContaining({ email: user.email }),
      })
    );
  });

  it('should handle unexpected errors', async () => {
    mockDb.user.findUnique.mockRejectedValue(new Error('DB error'));
    const res: any = {};
    await service.login(res, 'test@example.com', 'password');
    expect(responseService.sendError).toHaveBeenCalledWith(
      res,
      expect.any(Number),
      'Login failed',
      expect.any(String)
    );
  });
});