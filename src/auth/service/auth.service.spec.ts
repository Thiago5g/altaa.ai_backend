/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from '../repository/auth.repository';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: AuthRepository;
  let jwtService: JwtService;

  const mockAuthRepository = {
    countUsersByEmail: jest.fn(),
    createUser: jest.fn(),
    findUserByEmail: jest.fn(),
    findInviteByToken: jest.fn(),
    findMembershipByUserAndCompany: jest.fn(),
    createMembership: jest.fn(),
    markInviteAsAccepted: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const signupDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashedPassword';
      const mockUser = {
        id: 'user1',
      };
      const mockToken = 'jwt-token';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockAuthRepository.countUsersByEmail.mockResolvedValue(0);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.signup(signupDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(authRepository.countUsersByEmail).toHaveBeenCalledWith(
        signupDto.email,
      );
      expect(authRepository.createUser).toHaveBeenCalledWith({
        email: signupDto.email,
        name: signupDto.name,
        passwordHash: hashedPassword,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
      });
      expect(result).toEqual({
        access_token: mockToken,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockAuthRepository.countUsersByEmail.mockResolvedValue(1);

      await expect(service.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
      expect(authRepository.countUsersByEmail).toHaveBeenCalledWith(
        signupDto.email,
      );
      expect(authRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    const signinDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user1',
      passwordHash: 'hashedPassword',
    };

    it('should sign in user successfully', async () => {
      const mockToken = 'jwt-token';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.signin(signinDto);

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(
        signinDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signinDto.password,
        mockUser.passwordHash,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
      });
      expect(result).toEqual({
        access_token: mockToken,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);

      await expect(service.signin(signinDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(
        signinDto.email,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      await expect(service.signin(signinDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(
        signinDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signinDto.password,
        mockUser.passwordHash,
      );
    });
  });
});
