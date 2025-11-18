/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesRepository } from '../repository/invites.repository';
import { Role } from '@prisma/client';

describe('InvitesService', () => {
  let service: InvitesService;
  let invitesRepository: InvitesRepository;

  const mockInvitesRepository = {
    findPendingInvitesByEmail: jest.fn(),
    findUserEmailById: jest.fn(),
    findUserByIdWithEmail: jest.fn(),
    findInviteById: jest.fn(),
    findMembershipByUserAndCompany: jest.fn(),
    createMembership: jest.fn(),
    markInviteAccepted: jest.fn(),
    findUserActiveCompanyId: jest.fn(),
    updateUserActiveCompany: jest.fn(),
    deleteInvite: jest.fn(),
    executeInTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitesService,
        {
          provide: InvitesRepository,
          useValue: mockInvitesRepository,
        },
      ],
    }).compile();

    service = module.get<InvitesService>(InvitesService);
    invitesRepository = module.get<InvitesRepository>(InvitesRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listPending', () => {
    it('should return pending invites for user email', async () => {
      const userId = 'user1';
      const mockUser = { email: 'user@example.com' };
      const mockInvites = [
        {
          id: 'invite1',
          companyId: 'company1',
          role: Role.MEMBER,
          email: 'user@example.com',
          createdAt: new Date(),
          company: { id: 'company1', name: 'Company 1' },
        },
      ];

      mockInvitesRepository.findUserEmailById.mockResolvedValue(mockUser);
      mockInvitesRepository.findPendingInvitesByEmail.mockResolvedValue(
        mockInvites,
      );

      const result = await service.listPending(userId);

      expect(invitesRepository.findUserEmailById).toHaveBeenCalledWith(userId);
      expect(invitesRepository.findPendingInvitesByEmail).toHaveBeenCalledWith(
        mockUser.email,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'invite1',
        companyId: 'company1',
        companyName: 'Company 1',
        email: 'user@example.com',
        role: Role.MEMBER,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'nonexistent';

      mockInvitesRepository.findUserEmailById.mockResolvedValue(null);

      await expect(service.listPending(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('accept', () => {
    const userId = 'user1';
    const inviteId = 'invite1';
    const mockUser = {
      id: userId,
      email: 'user@example.com',
      activeCompanyId: null,
    };
    const mockInvite = {
      id: inviteId,
      email: 'user@example.com',
      companyId: 'company1',
      role: Role.MEMBER,
      acceptedAt: null,
    };

    it('should accept invite and create membership', async () => {
      mockInvitesRepository.findUserByIdWithEmail.mockResolvedValue(mockUser);
      mockInvitesRepository.findInviteById.mockResolvedValue(mockInvite);

      mockInvitesRepository.executeInTransaction.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/require-await
        async (callback) => {
          const mockTx = {
            membership: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({}),
            },
            invite: {
              update: jest.fn().mockResolvedValue({}),
            },
            user: {
              findUnique: jest
                .fn()
                .mockResolvedValue({ activeCompanyId: null }),
              update: jest.fn().mockResolvedValue({}),
            },
          };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          return callback(mockTx);
        },
      );

      const result = await service.accept(userId, inviteId);

      expect(invitesRepository.findUserByIdWithEmail).toHaveBeenCalledWith(
        userId,
      );
      expect(invitesRepository.findInviteById).toHaveBeenCalledWith(inviteId);
      expect(invitesRepository.executeInTransaction).toHaveBeenCalled();
      expect(result).toEqual({ status: 'accepted' });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockInvitesRepository.findUserByIdWithEmail.mockResolvedValue(null);

      await expect(service.accept(userId, inviteId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if invite not found', async () => {
      mockInvitesRepository.findUserByIdWithEmail.mockResolvedValue(mockUser);
      mockInvitesRepository.findInviteById.mockResolvedValue(null);

      await expect(service.accept(userId, inviteId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if invite already accepted', async () => {
      const acceptedInvite = { ...mockInvite, acceptedAt: new Date() };

      mockInvitesRepository.findUserByIdWithEmail.mockResolvedValue(mockUser);
      mockInvitesRepository.findInviteById.mockResolvedValue(acceptedInvite);

      await expect(service.accept(userId, inviteId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if invite email does not match user email', async () => {
      const differentUser = { ...mockUser, email: 'other@example.com' };

      mockInvitesRepository.findUserByIdWithEmail.mockResolvedValue(
        differentUser,
      );
      mockInvitesRepository.findInviteById.mockResolvedValue(mockInvite);

      await expect(service.accept(userId, inviteId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('decline', () => {
    const userId = 'user1';
    const inviteId = 'invite1';
    const mockUser = { email: 'user@example.com' };
    const mockInvite = {
      id: inviteId,
      email: 'user@example.com',
      companyId: 'company1',
      role: Role.MEMBER,
      acceptedAt: null,
    };

    it('should decline invite by deleting it', async () => {
      mockInvitesRepository.findUserEmailById.mockResolvedValue(mockUser);
      mockInvitesRepository.findInviteById.mockResolvedValue(mockInvite);
      mockInvitesRepository.deleteInvite.mockResolvedValue(undefined);

      const result = await service.decline(userId, inviteId);

      expect(invitesRepository.findUserEmailById).toHaveBeenCalledWith(userId);
      expect(invitesRepository.findInviteById).toHaveBeenCalledWith(inviteId);
      expect(invitesRepository.deleteInvite).toHaveBeenCalledWith(
        mockInvite.id,
      );
      expect(result).toEqual({ status: 'declined' });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockInvitesRepository.findUserEmailById.mockResolvedValue(null);

      await expect(service.decline(userId, inviteId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if invite not found', async () => {
      mockInvitesRepository.findUserEmailById.mockResolvedValue(mockUser);
      mockInvitesRepository.findInviteById.mockResolvedValue(null);

      await expect(service.decline(userId, inviteId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if invite already accepted', async () => {
      const acceptedInvite = { ...mockInvite, acceptedAt: new Date() };

      mockInvitesRepository.findUserEmailById.mockResolvedValue(mockUser);
      mockInvitesRepository.findInviteById.mockResolvedValue(acceptedInvite);

      await expect(service.decline(userId, inviteId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if invite email does not match user email', async () => {
      const differentUser = { email: 'other@example.com' };

      mockInvitesRepository.findUserEmailById.mockResolvedValue(differentUser);
      mockInvitesRepository.findInviteById.mockResolvedValue(mockInvite);

      await expect(service.decline(userId, inviteId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
