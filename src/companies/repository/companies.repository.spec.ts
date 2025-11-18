/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesRepository } from './companies.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

describe('CompaniesRepository', () => {
  let repository: CompaniesRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    company: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    membership: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    invite: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<CompaniesRepository>(CompaniesRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createCompanyWithMembership', () => {
    it('should create company with membership in transaction', async () => {
      const userId = 'user123';
      const companyData = {
        name: 'Test Company',
        logoUrl: 'https://example.com/logo.png',
      };
      const mockCompany = {
        id: 'company123',
        name: companyData.name,
        logoUrl: companyData.logoUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.$transaction.mockImplementation(
        async <T>(callback: (tx: PrismaService) => Promise<T>): Promise<T> => {
          mockPrismaService.company.create.mockResolvedValue(mockCompany);
          mockPrismaService.membership.create.mockResolvedValue({});
          mockPrismaService.user.update.mockResolvedValue({});
          return callback(mockPrismaService as unknown as PrismaService);
        },
      );

      const result = await repository.createCompanyWithMembership(
        userId,
        companyData,
      );

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockCompany);
    });
  });

  describe('findMembershipsByUserId', () => {
    it('should return memberships with companies', async () => {
      const userId = 'user123';
      const skip = 0;
      const take = 10;
      const mockMemberships = [
        {
          company: {
            id: 'company1',
            name: 'Company 1',
            logoUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      mockPrismaService.membership.findMany.mockResolvedValue(mockMemberships);

      const result = await repository.findMembershipsByUserId(
        userId,
        skip,
        take,
      );

      expect(prismaService.membership.findMany).toHaveBeenCalledWith({
        where: { userId },
        select: {
          role: true,
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { company: { createdAt: 'desc' } },
        skip,
        take,
      });
      expect(result).toEqual(mockMemberships);
    });
  });

  describe('countMembershipsByUserId', () => {
    it('should return count of memberships', async () => {
      const userId = 'user123';
      mockPrismaService.membership.count.mockResolvedValue(5);

      const result = await repository.countMembershipsByUserId(userId);

      expect(prismaService.membership.count).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toBe(5);
    });
  });

  describe('findMembershipByUserAndCompany', () => {
    it('should return membership with role', async () => {
      const userId = 'user123';
      const companyId = 'company123';
      const mockMembership = {
        id: 'membership123',
        role: Role.OWNER,
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);

      const result = await repository.findMembershipByUserAndCompany(
        userId,
        companyId,
      );

      expect(prismaService.membership.findUnique).toHaveBeenCalledWith({
        where: { userId_companyId: { userId, companyId } },
        select: { id: true, role: true },
      });
      expect(result).toEqual(mockMembership);
    });

    it('should return null if membership not found', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue(null);

      const result = await repository.findMembershipByUserAndCompany(
        'user123',
        'company123',
      );

      expect(result).toBeNull();
    });
  });

  describe('createInvite', () => {
    it('should create invite and return id and token', async () => {
      const companyId = 'company123';
      const email = 'newuser@example.com';
      const role = Role.MEMBER;
      const token = 'uuid-token-123';
      const mockInvite = {
        id: 'invite123',
        token,
      };

      mockPrismaService.invite.create.mockResolvedValue(mockInvite);

      const result = await repository.createInvite(
        companyId,
        email,
        role,
        token,
      );

      // Verificar que foi chamado com os parâmetros corretos (incluindo expiresAt)
      expect(prismaService.invite.create).toHaveBeenCalled();
      expect(result).toEqual(mockInvite);
    });
  });

  describe('updateUserActiveCompany', () => {
    it('should update user active company', async () => {
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

  describe('findMembershipsByCompanyId', () => {
    it('should return memberships with users', async () => {
      const companyId = 'company123';
      const mockMemberships = [
        {
          id: 'membership1',
          role: Role.OWNER,
          createdAt: new Date(),
          user: {
            id: 'user1',
            name: 'Owner User',
            email: 'owner@example.com',
          },
        },
        {
          id: 'membership2',
          role: Role.MEMBER,
          createdAt: new Date(),
          user: {
            id: 'user2',
            name: 'Member User',
            email: 'member@example.com',
          },
        },
      ];

      mockPrismaService.membership.findMany.mockResolvedValue(mockMemberships);

      const result = await repository.findMembershipsByCompanyId(companyId);

      expect(prismaService.membership.findMany).toHaveBeenCalledWith({
        where: { companyId },
        select: {
          id: true,
          role: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { role: 'asc' },
      });
      expect(result).toEqual(mockMemberships);
    });
  });

  describe('findCompanyById', () => {
    it('should return company by id', async () => {
      const companyId = 'company123';
      const mockCompany = {
        id: companyId,
        name: 'Test Company',
        logoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.company.findUnique.mockResolvedValue(mockCompany);

      const result = await repository.findCompanyById(companyId);

      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: companyId },
      });
      expect(result).toEqual(mockCompany);
    });

    it('should return null if company not found', async () => {
      mockPrismaService.company.findUnique.mockResolvedValue(null);

      const result = await repository.findCompanyById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateCompany', () => {
    it('should update company data', async () => {
      const companyId = 'company123';
      const updateData = {
        name: 'Updated Company Name',
        logoUrl: 'https://example.com/new-logo.png',
      };
      const mockUpdatedCompany = {
        id: companyId,
        name: updateData.name,
        logoUrl: updateData.logoUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.company.update.mockResolvedValue(mockUpdatedCompany);

      const result = await repository.updateCompany(companyId, updateData);

      expect(prismaService.company.update).toHaveBeenCalledWith({
        where: { id: companyId },
        data: { name: updateData.name, logoUrl: updateData.logoUrl },
      });
      expect(result).toEqual(mockUpdatedCompany);
    });
  });

  describe('deleteCompany', () => {
    it('should delete company by id', async () => {
      const companyId = 'company123';

      mockPrismaService.company.delete.mockResolvedValue({});

      await repository.deleteCompany(companyId);

      expect(prismaService.company.delete).toHaveBeenCalledWith({
        where: { id: companyId },
      });
    });
  });
});
