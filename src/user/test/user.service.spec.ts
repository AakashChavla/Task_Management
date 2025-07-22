import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { DatabaseService } from '../../database/database.service';
import { ResponseService } from '../../common/services/response.service';
import { MailService } from '../../common/mail/mail.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let db: any;
  let responseService: any;
  let mailService: any;

  const mockDb = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockResponseService = {
    sendSuccess: jest.fn(),
    sendError: jest.fn(),
  };

  const mockMailService = {
    sendVerificationOTPEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
  };

  beforeEach(async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: ResponseService, useValue: mockResponseService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    db = module.get<DatabaseService>(DatabaseService);
    responseService = module.get<ResponseService>(ResponseService);
    mailService = module.get<MailService>(MailService);

    jest.clearAllMocks();
  });

  it('should call db.user.create, send OTP email, and sendSuccess when creating a new user', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);
    mockDb.user.create.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test',
    });
    const mockRes: any = {};
    const dto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'pass123',
    };
    await service.createUser(mockRes, dto);
    expect(mockDb.user.create).toHaveBeenCalled();
    expect(mockMailService.sendVerificationOTPEmail).toHaveBeenCalled();
    expect(mockResponseService.sendSuccess).toHaveBeenCalled();
  });

  it('should update unverified user, send OTP email, and sendSuccess', async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      isVerified: false,
      Project: [],
    });
    mockDb.user.update.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test',
    });
    const mockRes: any = {};
    const dto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'pass123',
    };
    await service.createUser(mockRes, dto);
    expect(mockDb.user.update).toHaveBeenCalled();
    expect(mockMailService.sendVerificationOTPEmail).toHaveBeenCalled();
    expect(mockResponseService.sendSuccess).toHaveBeenCalled();
  });

  it('should sendError if user is already verified', async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      isVerified: true,
      Project: [],
    });
    const mockRes: any = {};
    const dto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'pass123',
    };
    await service.createUser(mockRes, dto);
    expect(mockResponseService.sendError).toHaveBeenCalledWith(
      mockRes,
      expect.any(Number),
      'Email already Registered'
    );
  });

  // Add more tests for verifyUserOtp, etc.
});