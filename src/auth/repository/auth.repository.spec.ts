/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    invite: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('countUsersByEmail', () => {
    it('should return count of users with email', async () => {
      const email = 'test@example.com';
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await repository.countUsersByEmail(email);

      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBe(1);
    });
  });

  describe('createUser', () => {
    it('should create a user and return id', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed123',
      };
      const mockUser = { id: 'user123' };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await repository.createUser(userData);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          name: userData.name,
          passwordHash: userData.passwordHash,
        },
        select: { id: true },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findUserByEmail', () => {
    it('should return user with passwordHash', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 'user123',
        passwordHash: 'hashed123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserByEmail(email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: { id: true, passwordHash: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findUserByEmail(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should return full user object', async () => {
      const userId = 'user123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed123',
        activeCompanyId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserById(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findInviteByToken', () => {
    it('should return invite with details', async () => {
      const token = 'invite-token-123';
      const mockInvite = {
        id: 'invite123',
        companyId: 'company123',
        role: Role.MEMBER,
        acceptedAt: null,
      };

      mockPrismaService.invite.findUnique.mockResolvedValue(mockInvite);

      const result = await repository.findInviteByToken(token);

      expect(prismaService.invite.findUnique).toHaveBeenCalledWith({
        where: { token },
        select: {
          id: true,
          companyId: true,
          role: true,
          acceptedAt: true,
        },
      });
      expect(result).toEqual(mockInvite);
    });
  });

  describe('findMembershipByUserAndCompany', () => {
    it('should return membership', async () => {
      const userId = 'user123';
      const companyId = 'company123';
      const mockMembership = {
        id: 'membership123',
        userId,
        companyId,
        role: Role.MEMBER,
        createdAt: new Date(),
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);

      const result = await repository.findMembershipByUserAndCompany(
        userId,
        companyId,
      );

      expect(prismaService.membership.findUnique).toHaveBeenCalledWith({
        where: { userId_companyId: { userId, companyId } },
      });
      expect(result).toEqual(mockMembership);
    });
  });

  describe('createMembership', () => {
    it('should create membership', async () => {
      const userId = 'user123';
      const companyId = 'company123';
      const role = Role.MEMBER;

      mockPrismaService.membership.create.mockResolvedValue({});

      await repository.createMembership(userId, companyId, role);

      expect(prismaService.membership.create).toHaveBeenCalledWith({
        data: { userId, companyId, role },
      });
    });
  });

  describe('markInviteAsAccepted', () => {
    it('should update invite with acceptedAt', async () => {
      const inviteId = 'invite123';

      mockPrismaService.invite.update.mockResolvedValue({});

      await repository.markInviteAsAccepted(inviteId);

      expect(prismaService.invite.update).toHaveBeenCalledWith({
        where: { id: inviteId },
        data: { acceptedAt: expect.any(Date) as Date },
      });
    });
  });

  describe('findUserActiveCompanyId', () => {
    it('should return activeCompanyId', async () => {
      const userId = 'user123';
      const mockResult = { activeCompanyId: 'company123' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockResult);

      const result = await repository.findUserActiveCompanyId(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { activeCompanyId: true },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateUserActiveCompany', () => {
    it('should update user activeCompanyId', async () => {
      const userId = 'user123';
      const companyId = 'company123';

      mockPrismaService.user.update.mockResolvedValue({});

      await repository.updateUserActiveCompany(userId, companyId);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { activeCompanyId: companyId },
      });
    });
  });

  describe('executeInTransaction', () => {
    it('should execute callback within transaction', async () => {
      const mockCallback = jest
        .fn<Promise<string>, [PrismaService]>()
        .mockResolvedValue('result');

      mockPrismaService.$transaction.mockImplementation(
        async <T>(callback: (tx: PrismaService) => Promise<T>): Promise<T> => {
          return callback(mockPrismaService as unknown as PrismaService);
        },
      );

      const result = await repository.executeInTransaction(mockCallback);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(mockPrismaService);
      expect(result).toBe('result');
    });
  });
});
