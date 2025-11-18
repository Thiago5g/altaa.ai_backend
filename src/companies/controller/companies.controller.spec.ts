/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from '../service/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CreateInviteDto } from '../dto/create-invite.dto';
import { Role } from '@prisma/client';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let companiesService: CompaniesService;

  const mockCompaniesService = {
    createCompany: jest.fn(),
    listCompanies: jest.fn(),
    inviteToCompany: jest.fn(),
    selectActiveCompany: jest.fn(),
    listMembers: jest.fn(),
    updateCompany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    companiesService = module.get<CompaniesService>(CompaniesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call companiesService.createCompany with userId and dto', async () => {
      const userId = 'user123';
      const createCompanyDto: CreateCompanyDto = {
        name: 'Test Company',
        logoUrl: 'https://example.com/logo.png',
      };
      const expectedResult = {
        id: 'company123',
        name: 'Test Company',
        logoUrl: 'https://example.com/logo.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.createCompany.mockResolvedValue(expectedResult);

      const result = await controller.create(userId, createCompanyDto);

      expect(companiesService.createCompany).toHaveBeenCalledWith(
        userId,
        createCompanyDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('list', () => {
    it('should call companiesService.listCompanies with userId and default pagination', async () => {
      const userId = 'user123';
      const expectedResult = {
        data: [],
        page: 1,
        pageSize: 10,
        total: 0,
      };

      mockCompaniesService.listCompanies.mockResolvedValue(expectedResult);

      const result = await controller.list(userId);

      expect(companiesService.listCompanies).toHaveBeenCalledWith(
        userId,
        1,
        10,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should call companiesService.listCompanies with custom pagination', async () => {
      const userId = 'user123';
      const page = 2;
      const pageSize = 20;
      const expectedResult = {
        data: [],
        page: 2,
        pageSize: 20,
        total: 0,
      };

      mockCompaniesService.listCompanies.mockResolvedValue(expectedResult);

      const result = await controller.list(userId, page, pageSize);

      expect(companiesService.listCompanies).toHaveBeenCalledWith(
        userId,
        2,
        20,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('invite', () => {
    it('should call companiesService.inviteToCompany with userId, companyId and dto', async () => {
      const userId = 'user123';
      const companyId = 'company123';
      const createInviteDto: CreateInviteDto = {
        email: 'newuser@example.com',
        role: Role.MEMBER,
      };
      const expectedResult = {
        inviteId: 'invite123',
        token: 'token123',
      };

      mockCompaniesService.inviteToCompany.mockResolvedValue(expectedResult);

      const result = await controller.invite(
        userId,
        companyId,
        createInviteDto,
      );

      expect(companiesService.inviteToCompany).toHaveBeenCalledWith(
        userId,
        companyId,
        createInviteDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('select', () => {
    it('should call companiesService.selectActiveCompany with userId and companyId', async () => {
      const userId = 'user123';
      const companyId = 'company123';
      const expectedResult = {
        activeCompanyId: companyId,
      };

      mockCompaniesService.selectActiveCompany.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.select(userId, companyId);

      expect(companiesService.selectActiveCompany).toHaveBeenCalledWith(
        userId,
        companyId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('members', () => {
    it('should call companiesService.listMembers with userId and companyId', async () => {
      const userId = 'user123';
      const companyId = 'company123';
      const expectedResult = {
        data: [
          {
            membershipId: 'membership123',
            userId: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            role: Role.OWNER,
            createdAt: new Date(),
          },
        ],
        companyId: 'company123',
        total: 1,
      };

      mockCompaniesService.listMembers.mockResolvedValue(expectedResult);

      const result = await controller.members(userId, companyId);

      expect(companiesService.listMembers).toHaveBeenCalledWith(
        userId,
        companyId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should call companiesService.updateCompany with userId, companyId and dto', async () => {
      const userId = 'user123';
      const companyId = 'company123';
      const updateCompanyDto: UpdateCompanyDto = {
        name: 'Updated Company Name',
        logoUrl: 'https://example.com/new-logo.png',
      };
      const expectedResult = {
        id: companyId,
        name: 'Updated Company Name',
        logoUrl: 'https://example.com/new-logo.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.updateCompany.mockResolvedValue(expectedResult);

      const result = await controller.update(
        userId,
        companyId,
        updateCompanyDto,
      );

      expect(companiesService.updateCompany).toHaveBeenCalledWith(
        userId,
        companyId,
        updateCompanyDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('delete', () => {
    it('should delete company and return success message', async () => {
      const userId = 'user1';
      const companyId = 'company1';
      const expectedResult = { message: 'Company deleted successfully' };

      companiesService.deleteCompany = jest
        .fn()
        .mockResolvedValue(expectedResult);

      const result = await controller.delete(userId, companyId);

      expect(companiesService.deleteCompany).toHaveBeenCalledWith(
        userId,
        companyId,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
