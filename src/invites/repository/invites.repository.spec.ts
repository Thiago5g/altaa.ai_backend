/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { InvitesRepository } from './invites.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

describe('InvitesRepository', () => {
  let repository: InvitesRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    invite: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
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
        InvitesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<InvitesRepository>(InvitesRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findPendingInvitesByEmail', () => {
    it('should find pending invites by email', async () => {
      const email = 'user@example.com';
      const mockInvites = [
        {
          id: 'invite1',
          companyId: 'company1',
          role: Role.MEMBER,
          email,
          createdAt: new Date(),
          company: { id: 'company1', name: 'Company 1' },
        },
      ];

      mockPrismaService.invite.findMany.mockResolvedValue(mockInvites);

      const result = await repository.findPendingInvitesByEmail(email);

      expect(prismaService.invite.findMany).toHaveBeenCalledWith({
        where: {
          email,
          acceptedAt: null,
          declinedAt: null,
          expiresAt: { gt: expect.any(Date) as Date },
        },
        select: {
          id: true,
          companyId: true,
          role: true,
          email: true,
          createdAt: true,
          company: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockInvites);
    });
  });

  describe('findUserEmailById', () => {
    it('should find user email by id', async () => {
      const userId = 'user1';
      const mockUser = { email: 'user@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserEmailById(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { email: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const userId = 'nonexistent';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findUserEmailById(userId);

      expect(result).toBeNull();
    });
  });

  describe('findUserByIdWithEmail', () => {
    it('should find user with email and activeCompanyId', async () => {
      const userId = 'user1';
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        activeCompanyId: 'company1',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserByIdWithEmail(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true, email: true, activeCompanyId: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const userId = 'nonexistent';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findUserByIdWithEmail(userId);

      expect(result).toBeNull();
    });
  });

  describe('findInviteById', () => {
    it('should find invite by id', async () => {
      const inviteId = 'invite1';
      const mockInvite = {
        id: inviteId,
        email: 'user@example.com',
        companyId: 'company1',
        role: Role.MEMBER,
        acceptedAt: null,
      };

      mockPrismaService.invite.findUnique.mockResolvedValue(mockInvite);

      const result = await repository.findInviteById(inviteId);

      expect(prismaService.invite.findUnique).toHaveBeenCalledWith({
        where: { id: inviteId },
        select: {
          id: true,
          email: true,
          companyId: true,
          role: true,
          acceptedAt: true,
          expiresAt: true,
        },
      });
      expect(result).toEqual(mockInvite);
    });

    it('should return null if invite not found', async () => {
      const inviteId = 'nonexistent';

      mockPrismaService.invite.findUnique.mockResolvedValue(null);

      const result = await repository.findInviteById(inviteId);

      expect(result).toBeNull();
    });
  });

  describe('findMembershipByUserAndCompany', () => {
    it('should find membership by user and company', async () => {
      const userId = 'user1';
      const companyId = 'company1';
      const mockMembership = { id: 'membership1' };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);

      const result = await repository.findMembershipByUserAndCompany(
        userId,
        companyId,
      );

      expect(prismaService.membership.findUnique).toHaveBeenCalledWith({
        where: { userId_companyId: { userId, companyId } },
        select: { id: true },
      });
      expect(result).toEqual(mockMembership);
    });

    it('should return null if membership not found', async () => {
      const userId = 'user1';
      const companyId = 'company1';

      mockPrismaService.membership.findUnique.mockResolvedValue(null);

      const result = await repository.findMembershipByUserAndCompany(
        userId,
        companyId,
      );

      expect(result).toBeNull();
    });
  });

  describe('createMembership', () => {
    it('should create membership', async () => {
      const userId = 'user1';
      const companyId = 'company1';
      const role = Role.MEMBER;

      mockPrismaService.membership.create.mockResolvedValue({});

      await repository.createMembership(userId, companyId, role);

      expect(prismaService.membership.create).toHaveBeenCalledWith({
        data: { userId, companyId, role },
      });
    });
  });

  describe('markInviteAccepted', () => {
    it('should mark invite as accepted', async () => {
      const inviteId = 'invite1';

      mockPrismaService.invite.update.mockResolvedValue({});

      await repository.markInviteAccepted(inviteId);

      expect(prismaService.invite.update).toHaveBeenCalledWith({
        where: { id: inviteId },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { acceptedAt: expect.any(Date) },
      });
    });
  });

  describe('findUserActiveCompanyId', () => {
    it('should find user activeCompanyId', async () => {
      const userId = 'user1';
      const mockUser = { activeCompanyId: 'company1' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserActiveCompanyId(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { activeCompanyId: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const userId = 'nonexistent';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findUserActiveCompanyId(userId);

      expect(result).toBeNull();
    });
  });

  describe('updateUserActiveCompany', () => {
    it('should update user activeCompanyId', async () => {
      const userId = 'user1';
      const companyId = 'company1';

      mockPrismaService.user.update.mockResolvedValue({});

      await repository.updateUserActiveCompany(userId, companyId);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { activeCompanyId: companyId },
      });
    });
  });

  describe('deleteInvite', () => {
    it('should delete invite', async () => {
      const inviteId = 'invite1';

      mockPrismaService.invite.delete.mockResolvedValue({});

      await repository.deleteInvite(inviteId);

      expect(prismaService.invite.delete).toHaveBeenCalledWith({
        where: { id: inviteId },
      });
    });
  });

  describe('executeInTransaction', () => {
    it('should execute callback in transaction', async () => {
      const mockCallback = jest
        .fn<Promise<string>, [PrismaService]>()
        .mockResolvedValue('result');

      mockPrismaService.$transaction.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/require-await
        async (callback) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          return callback(mockPrismaService);
        },
      );

      const result = await repository.executeInTransaction(mockCallback);

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(mockPrismaService);
      expect(result).toBe('result');
    });
  });
});
