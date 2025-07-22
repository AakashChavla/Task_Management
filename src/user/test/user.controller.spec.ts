import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/UserCreate.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    createUser: jest.fn(),
    verifyUserOtp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call userService.createUser on registerUser', async () => {
    const res: any = {};
    const dto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
    mockUserService.createUser.mockResolvedValue('mocked response');
    const result = await controller.registerUser(res, dto);
    expect(userService.createUser).toHaveBeenCalledWith(res, dto);
    expect(result).toBe('mocked response');
  });

  it('should call userService.verifyUserOtp on verifyOtp', async () => {
    const res: any = {};
    const body = { email: 'test@example.com', otp: 123456 };
    mockUserService.verifyUserOtp.mockResolvedValue('otp verified');
    const result = await controller.verifyOtp(res, body);
    expect(userService.verifyUserOtp).toHaveBeenCalledWith(res, body.email, body.otp);
    expect(result).toBe('otp verified');
  });

  it('should handle error from userService.createUser', async () => {
    const res: any = {};
    const dto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
    mockUserService.createUser.mockRejectedValue(new Error('fail'));
    await expect(controller.registerUser(res, dto)).rejects.toThrow('fail');
  });

  it('should handle error from userService.verifyUserOtp', async () => {
    const res: any = {};
    const body = { email: 'test@example.com', otp: 123456 };
    mockUserService.verifyUserOtp.mockRejectedValue(new Error('otp fail'));
    await expect(controller.verifyOtp(res, body)).rejects.toThrow('otp fail');
  });
});