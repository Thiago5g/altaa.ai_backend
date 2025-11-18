/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { SigninDto } from '../dto/signin.dto';
import { AcceptInviteDto } from '../dto/accept-invite.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    signin: jest.fn(),
    acceptInvite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup with dto', async () => {
      const signupDto: SignupDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { access_token: 'token123' };

      mockAuthService.signup.mockResolvedValue(expectedResult);

      const result = await controller.signup(signupDto);

      expect(authService.signup).toHaveBeenCalledWith(signupDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('signin', () => {
    it('should call authService.signin with dto', async () => {
      const signinDto: SigninDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { access_token: 'token123' };

      mockAuthService.signin.mockResolvedValue(expectedResult);

      const result = await controller.signin(signinDto);

      expect(authService.signin).toHaveBeenCalledWith(signinDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('acceptInvite', () => {
    it('should call authService.acceptInvite with userId and dto', async () => {
      const userId = 'user123';
      const acceptInviteDto: AcceptInviteDto = {
        token: 'invite-token-123',
      };
      const expectedResult = { companyId: 'company123' };

      mockAuthService.acceptInvite.mockResolvedValue(expectedResult);

      const result = await controller.acceptInvite(userId, acceptInviteDto);

      expect(authService.acceptInvite).toHaveBeenCalledWith(
        userId,
        acceptInviteDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
