import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DatabaseService } from '../database/database.service';
import { ResponseService } from '../common/services/response.service';

describe('UserService', () => {
  let service: UserService;
  let db: DatabaseService;
  let responseService: ResponseService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: ResponseService, useValue: mockResponseService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    db = module.get<DatabaseService>(DatabaseService);
    responseService = module.get<ResponseService>(ResponseService);
  });

  it('should call db.user.create and responseService.sendSuccess when creating a new user', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);
    mockDb.user.create.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });
    const mockRes: any = {};
    const dto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'pass123',
    };
    await service.createUser(mockRes, dto);
    expect(mockDb.user.create).toHaveBeenCalled();
    expect(mockResponseService.sendSuccess).toHaveBeenCalled();
  });

  // Example: Add more tests for createUser, etc.
});
