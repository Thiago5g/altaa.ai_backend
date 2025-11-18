import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompaniesRepository } from '../repository/companies.repository';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CreateInviteDto } from '../dto/create-invite.dto';
import { randomUUID } from 'node:crypto';
import { Company, Role } from '@prisma/client';

export interface CompanyListResponse {
  data: Array<Company & { userRole: Role }>;
  page: number;
  pageSize: number;
  total: number;
}

export interface CompanyMemberSummary {
  membershipId: string;
  userId: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface CompanyMembersResponse {
  data: CompanyMemberSummary[];
  companyId: string;
  total: number;
  currentUserRole: Role;
}

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  async createCompany(userId: string, dto: CreateCompanyDto): Promise<Company> {
    return this.companiesRepository.createCompanyWithMembership(userId, {
      name: dto.name,
      logoUrl: dto.logoUrl,
    });
  }

  async listCompanies(
    userId: string,
    page = 1,
    pageSize = 10,
  ): Promise<CompanyListResponse> {
    const skip = (page - 1) * pageSize;
    const memberships = await this.companiesRepository.findMembershipsByUserId(
      userId,
      skip,
      pageSize,
    );
    const companies = memberships.map((m) => ({
      ...m.company,
      userRole: m.role,
    }));
    const total =
      await this.companiesRepository.countMembershipsByUserId(userId);
    return { data: companies, page, pageSize, total };
  }

  async inviteToCompany(
    requestorId: string,
    companyId: string,
    dto: CreateInviteDto,
  ): Promise<{ inviteId: string; token: string }> {
    const member =
      await this.companiesRepository.findMembershipByUserAndCompany(
        requestorId,
        companyId,
      );
    if (!member) throw new ForbiddenException('Not a member');
    if (member.role === Role.MEMBER)
      throw new ForbiddenException('Only OWNER/ADMIN can invite');

    const token = randomUUID();
    const invite = await this.companiesRepository.createInvite(
      companyId,
      dto.email,
      dto.role,
      token,
    );
    return { inviteId: invite.id, token: invite.token };
  }

  async selectActiveCompany(
    userId: string,
    companyId: string,
  ): Promise<{ activeCompanyId: string }> {
    const member =
      await this.companiesRepository.findMembershipByUserAndCompany(
        userId,
        companyId,
      );
    if (!member) throw new NotFoundException('Not a member of this company');
    await this.companiesRepository.updateUserActiveCompany(userId, companyId);
    return { activeCompanyId: companyId };
  }

  async listMembers(
    requestorId: string,
    companyId: string,
  ): Promise<CompanyMembersResponse> {
    const requesterMembership =
      await this.companiesRepository.findMembershipByUserAndCompany(
        requestorId,
        companyId,
      );
    if (!requesterMembership)
      throw new ForbiddenException('Not a member of this company');

    const memberships =
      await this.companiesRepository.findMembershipsByCompanyId(companyId);
    const data: CompanyMemberSummary[] = memberships.map((m) => ({
      membershipId: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      createdAt: m.createdAt,
    }));
    return {
      data,
      companyId,
      total: data.length,
      currentUserRole: requesterMembership.role,
    };
  }

  async updateCompany(
    userId: string,
    companyId: string,
    dto: UpdateCompanyDto,
  ): Promise<Company> {
    const member =
      await this.companiesRepository.findMembershipByUserAndCompany(
        userId,
        companyId,
      );
    if (!member) throw new ForbiddenException('Not a member of this company');
    if (member.role !== Role.OWNER && member.role !== Role.ADMIN) {
      throw new ForbiddenException('Only OWNER/ADMIN can update company');
    }

    const company = await this.companiesRepository.findCompanyById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    return this.companiesRepository.updateCompany(companyId, {
      name: dto.name,
      logoUrl: dto.logoUrl,
    });
  }

  async deleteCompany(
    userId: string,
    companyId: string,
  ): Promise<{ message: string }> {
    const member =
      await this.companiesRepository.findMembershipByUserAndCompany(
        userId,
        companyId,
      );
    if (!member) throw new ForbiddenException('Not a member of this company');
    if (member.role !== Role.OWNER) {
      throw new ForbiddenException('Only OWNER can delete company');
    }

    const company = await this.companiesRepository.findCompanyById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    await this.companiesRepository.deleteCompany(companyId);
    return { message: 'Company deleted successfully' };
  }

  async deleteMember(
    requestorId: string,
    companyId: string,
    membershipId: string,
  ): Promise<{ message: string }> {
    const requesterMembership =
      await this.companiesRepository.findMembershipByUserAndCompany(
        requestorId,
        companyId,
      );
    if (!requesterMembership)
      throw new ForbiddenException('Not a member of this company');
    if (
      requesterMembership.role !== Role.OWNER &&
      requesterMembership.role !== Role.ADMIN
    ) {
      throw new ForbiddenException('Only OWNER/ADMIN can remove members');
    }

    const targetMembership =
      await this.companiesRepository.findMembershipById(membershipId);
    if (!targetMembership) throw new NotFoundException('Member not found');

    if (targetMembership.role === Role.OWNER) {
      throw new ForbiddenException('Cannot remove OWNER');
    }

    await this.companiesRepository.deleteMember(membershipId);
    return { message: 'Member removed successfully' };
  }
}
