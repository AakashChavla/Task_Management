import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.login and return its result', async () => {
    const res: any = { mock: true };
    const body = { email: 'user@example.com', password: 'pass' };
    mockAuthService.login.mockResolvedValue('login-success');
    const result = await controller.login(res, body);
    expect(authService.login).toHaveBeenCalledWith(res, body.email, body.password);
    expect(result).toBe('login-success');
  });

  it('should return user profile from getProfile', () => {
    const req = { user: { userId: '1', email: 'user@example.com', role: 'USER' } };
    const result = controller.getProfile(req);
    expect(result).toEqual({
      message: 'Token is valid',
      user: req.user,
    });
  });
});