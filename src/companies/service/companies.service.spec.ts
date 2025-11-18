/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesRepository } from '../repository/companies.repository';
import { Role } from '@prisma/client';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companiesRepository: CompaniesRepository;

  const mockCompaniesRepository = {
    createCompanyWithMembership: jest.fn(),
    findMembershipsByUserId: jest.fn(),
    countMembershipsByUserId: jest.fn(),
    findMembershipByUserAndCompany: jest.fn(),
    createInvite: jest.fn(),
    updateUserActiveCompany: jest.fn(),
    findMembershipsByCompanyId: jest.fn(),
    findCompanyById: jest.fn(),
    updateCompany: jest.fn(),
    deleteCompany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: CompaniesRepository,
          useValue: mockCompaniesRepository,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    companiesRepository = module.get<CompaniesRepository>(CompaniesRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCompany', () => {
    it('should create a new company and membership', async () => {
      const userId = 'user1';
      const createCompanyDto = {
        name: 'Test Company',
        logoUrl: 'https://example.com/logo.png',
      };
      const mockCompany = {
        id: 'company1',
        name: createCompanyDto.name,
        logoUrl: createCompanyDto.logoUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesRepository.createCompanyWithMembership.mockResolvedValue(
        mockCompany,
      );

      const result = await service.createCompany(userId, createCompanyDto);

      expect(
        companiesRepository.createCompanyWithMembership,
      ).toHaveBeenCalledWith(userId, {
        name: createCompanyDto.name,
        logoUrl: createCompanyDto.logoUrl,
      });
      expect(result).toEqual(mockCompany);
    });
  });

  describe('listCompanies', () => {
    it('should return paginated list of companies', async () => {
      const userId = 'user1';
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
        {
          company: {
            id: 'company2',
            name: 'Company 2',
            logoUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      mockCompaniesRepository.findMembershipsByUserId.mockResolvedValue(
        mockMemberships,
      );
      mockCompaniesRepository.countMembershipsByUserId.mockResolvedValue(2);

      const result = await service.listCompanies(userId, 1, 10);

      expect(companiesRepository.findMembershipsByUserId).toHaveBeenCalledWith(
        userId,
        0,
        10,
      );
      expect(companiesRepository.countMembershipsByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual({
        data: [mockMemberships[0].company, mockMemberships[1].company],
        page: 1,
        pageSize: 10,
        total: 2,
      });
    });
  });

  describe('inviteToCompany', () => {
    const requestorId = 'user1';
    const companyId = 'company1';
    const createInviteDto = {
      email: 'newuser@example.com',
      role: Role.MEMBER,
    };

    it('should create an invite when requestor is OWNER', async () => {
      const mockMembership = {
        id: 'membership1',
        role: Role.OWNER,
      };
      const mockInvite = {
        id: 'invite1',
        token: 'some-uuid-token',
      };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );
      mockCompaniesRepository.createInvite.mockResolvedValue(mockInvite);

      const result = await service.inviteToCompany(
        requestorId,
        companyId,
        createInviteDto,
      );

      expect(
        companiesRepository.findMembershipByUserAndCompany,
      ).toHaveBeenCalledWith(requestorId, companyId);
      expect(companiesRepository.createInvite).toHaveBeenCalledWith(
        companyId,
        createInviteDto.email,
        createInviteDto.role,
        expect.any(String),
      );
      expect(result).toEqual({
        inviteId: mockInvite.id,
        token: mockInvite.token,
      });
    });

    it('should create an invite when requestor is ADMIN', async () => {
      const mockMembership = {
        id: 'membership1',
        role: Role.ADMIN,
      };
      const mockInvite = {
        id: 'invite1',
        token: 'some-uuid-token',
      };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );
      mockCompaniesRepository.createInvite.mockResolvedValue(mockInvite);

      const result = await service.inviteToCompany(
        requestorId,
        companyId,
        createInviteDto,
      );

      expect(result).toEqual({
        inviteId: mockInvite.id,
        token: mockInvite.token,
      });
    });

    it('should throw ForbiddenException if not a member', async () => {
      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        null,
      );

      await expect(
        service.inviteToCompany(requestorId, companyId, createInviteDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if requestor is MEMBER', async () => {
      const mockMembership = {
        id: 'membership1',
        role: Role.MEMBER,
      };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );

      await expect(
        service.inviteToCompany(requestorId, companyId, createInviteDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('selectActiveCompany', () => {
    const userId = 'user1';
    const companyId = 'company1';

    it('should update activeCompanyId when user is a member', async () => {
      const mockMembership = {
        id: 'membership1',
        role: Role.MEMBER,
      };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );
      mockCompaniesRepository.updateUserActiveCompany.mockResolvedValue(
        undefined,
      );

      const result = await service.selectActiveCompany(userId, companyId);

      expect(
        companiesRepository.findMembershipByUserAndCompany,
      ).toHaveBeenCalledWith(userId, companyId);
      expect(companiesRepository.updateUserActiveCompany).toHaveBeenCalledWith(
        userId,
        companyId,
      );
      expect(result).toEqual({ activeCompanyId: companyId });
    });

    it('should throw NotFoundException if not a member', async () => {
      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        null,
      );

      await expect(
        service.selectActiveCompany(userId, companyId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listMembers', () => {
    const requestorId = 'user1';
    const companyId = 'company1';

    it('should return list of company members', async () => {
      const mockRequesterMembership = { id: 'membership1', role: Role.OWNER };
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

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockRequesterMembership,
      );
      mockCompaniesRepository.findMembershipsByCompanyId.mockResolvedValue(
        mockMemberships,
      );

      const result = await service.listMembers(requestorId, companyId);

      expect(
        companiesRepository.findMembershipByUserAndCompany,
      ).toHaveBeenCalledWith(requestorId, companyId);
      expect(
        companiesRepository.findMembershipsByCompanyId,
      ).toHaveBeenCalledWith(companyId);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.companyId).toBe(companyId);
    });

    it('should throw ForbiddenException if requestor is not a member', async () => {
      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        null,
      );

      await expect(service.listMembers(requestorId, companyId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateCompany', () => {
    const userId = 'user1';
    const companyId = 'company1';
    const updateDto = {
      name: 'Updated Company Name',
      logoUrl: 'https://example.com/new-logo.png',
    };

    it('should update company when user is OWNER', async () => {
      const mockMembership = { id: 'membership1', role: Role.OWNER };
      const mockCompany = {
        id: companyId,
        name: 'Test Company',
        logoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockUpdatedCompany = {
        ...mockCompany,
        name: updateDto.name,
        logoUrl: updateDto.logoUrl,
      };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );
      mockCompaniesRepository.findCompanyById.mockResolvedValue(mockCompany);
      mockCompaniesRepository.updateCompany.mockResolvedValue(
        mockUpdatedCompany,
      );

      const result = await service.updateCompany(userId, companyId, updateDto);

      expect(
        companiesRepository.findMembershipByUserAndCompany,
      ).toHaveBeenCalledWith(userId, companyId);
      expect(companiesRepository.findCompanyById).toHaveBeenCalledWith(
        companyId,
      );
      expect(companiesRepository.updateCompany).toHaveBeenCalledWith(
        companyId,
        {
          name: updateDto.name,
          logoUrl: updateDto.logoUrl,
        },
      );
      expect(result).toEqual(mockUpdatedCompany);
    });

    it('should update company when user is ADMIN', async () => {
      const mockMembership = { id: 'membership1', role: Role.ADMIN };
      const mockCompany = {
        id: companyId,
        name: 'Test Company',
        logoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockUpdatedCompany = {
        ...mockCompany,
        name: updateDto.name,
        logoUrl: updateDto.logoUrl,
      };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );
      mockCompaniesRepository.findCompanyById.mockResolvedValue(mockCompany);
      mockCompaniesRepository.updateCompany.mockResolvedValue(
        mockUpdatedCompany,
      );

      const result = await service.updateCompany(userId, companyId, updateDto);

      expect(result).toEqual(mockUpdatedCompany);
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        null,
      );

      await expect(
        service.updateCompany(userId, companyId, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user is MEMBER', async () => {
      const mockMembership = { id: 'membership1', role: Role.MEMBER };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );

      await expect(
        service.updateCompany(userId, companyId, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      const mockMembership = { id: 'membership1', role: Role.OWNER };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );
      mockCompaniesRepository.findCompanyById.mockResolvedValue(null);

      await expect(
        service.updateCompany(userId, companyId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCompany', () => {
    const userId = 'user1';
    const companyId = 'company1';

    it('should delete company when user is OWNER', async () => {
      const mockMembership = { id: 'membership1', role: Role.OWNER };
      const mockCompany = {
        id: companyId,
        name: 'Test Company',
        logoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );
      mockCompaniesRepository.findCompanyById.mockResolvedValue(mockCompany);
      mockCompaniesRepository.deleteCompany.mockResolvedValue(undefined);

      const result = await service.deleteCompany(userId, companyId);

      expect(
        companiesRepository.findMembershipByUserAndCompany,
      ).toHaveBeenCalledWith(userId, companyId);
      expect(companiesRepository.findCompanyById).toHaveBeenCalledWith(
        companyId,
      );
      expect(companiesRepository.deleteCompany).toHaveBeenCalledWith(companyId);
      expect(result).toEqual({ message: 'Company deleted successfully' });
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        null,
      );

      await expect(service.deleteCompany(userId, companyId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if user is ADMIN', async () => {
      const mockMembership = { id: 'membership1', role: Role.ADMIN };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );

      await expect(service.deleteCompany(userId, companyId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if user is MEMBER', async () => {
      const mockMembership = { id: 'membership1', role: Role.MEMBER };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );

      await expect(service.deleteCompany(userId, companyId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if company does not exist', async () => {
      const mockMembership = { id: 'membership1', role: Role.OWNER };

      mockCompaniesRepository.findMembershipByUserAndCompany.mockResolvedValue(
        mockMembership,
      );
      mockCompaniesRepository.findCompanyById.mockResolvedValue(null);

      await expect(service.deleteCompany(userId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
