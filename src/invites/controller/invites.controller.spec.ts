/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { InvitesController } from './invites.controller';
import { InvitesService } from '../service/invites.service';
import { Role } from '@prisma/client';

describe('InvitesController', () => {
  let controller: InvitesController;
  let invitesService: InvitesService;

  const mockInvitesService = {
    listPending: jest.fn(),
    accept: jest.fn(),
    decline: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitesController],
      providers: [
        {
          provide: InvitesService,
          useValue: mockInvitesService,
        },
      ],
    }).compile();

    controller = module.get<InvitesController>(InvitesController);
    invitesService = module.get<InvitesService>(InvitesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('pending', () => {
    it('should call invitesService.listPending with userId', async () => {
      const userId = 'user123';
      const expectedResult = [
        {
          id: 'invite123',
          companyId: 'company123',
          companyName: 'Test Company',
          email: 'test@example.com',
          role: Role.MEMBER,
          createdAt: new Date(),
        },
      ];

      mockInvitesService.listPending.mockResolvedValue(expectedResult);

      const result = await controller.pending(userId);

      expect(invitesService.listPending).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('accept', () => {
    it('should call invitesService.accept with userId and inviteId', async () => {
      const userId = 'user123';
      const inviteId = 'invite123';
      const expectedResult = { status: 'accepted' as const };

      mockInvitesService.accept.mockResolvedValue(expectedResult);

      const result = await controller.accept(userId, inviteId);

      expect(invitesService.accept).toHaveBeenCalledWith(userId, inviteId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('decline', () => {
    it('should call invitesService.decline with userId and inviteId', async () => {
      const userId = 'user123';
      const inviteId = 'invite123';
      const expectedResult = { status: 'declined' as const };

      mockInvitesService.decline.mockResolvedValue(expectedResult);

      const result = await controller.decline(userId, inviteId);

      expect(invitesService.decline).toHaveBeenCalledWith(userId, inviteId);
      expect(result).toEqual(expectedResult);
    });
  });
});
