import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Company, Role } from '@prisma/client';

export interface CreateCompanyData {
  name: string;
  logoUrl?: string | null;
}

export interface MembershipWithRole {
  id?: string;
  role: Role;
}

export interface CompanyWithDetails {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipWithCompany {
  company: CompanyWithDetails;
  role: Role;
}

export interface InviteCreated {
  id: string;
  token: string;
}

export interface MembershipWithUser {
  id: string;
  role: Role;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

@Injectable()
export class CompaniesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCompanyWithMembership(
    userId: string,
    companyData: CreateCompanyData,
  ): Promise<Company> {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.company.create({
        data: { name: companyData.name, logoUrl: companyData.logoUrl },
      });
      await tx.membership.create({
        data: { userId, companyId: created.id, role: Role.OWNER },
      });
      await tx.user.update({
        where: { id: userId },
        data: { activeCompanyId: created.id },
      });
      return created;
    });
  }

  async findMembershipsByUserId(
    userId: string,
    skip: number,
    take: number,
  ): Promise<MembershipWithCompany[]> {
    return this.prisma.membership.findMany({
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
  }

  async countMembershipsByUserId(userId: string): Promise<number> {
    return this.prisma.membership.count({ where: { userId } });
  }

  async findMembershipByUserAndCompany(
    userId: string,
    companyId: string,
  ): Promise<MembershipWithRole | null> {
    return this.prisma.membership.findUnique({
      where: { userId_companyId: { userId, companyId } },
      select: { id: true, role: true },
    });
  }

  async createInvite(
    companyId: string,
    email: string,
    role: Role,
    token: string,
  ): Promise<InviteCreated> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

    return this.prisma.invite.create({
      data: { companyId, email, role, token, expiresAt },
      select: { id: true, token: true },
    });
  }

  async updateUserActiveCompany(
    userId: string,
    companyId: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { activeCompanyId: companyId },
    });
  }

  async findMembershipsByCompanyId(
    companyId: string,
  ): Promise<MembershipWithUser[]> {
    return this.prisma.membership.findMany({
      where: { companyId },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { role: 'asc' },
    });
  }

  async findCompanyById(companyId: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { id: companyId },
    });
  }

  async updateCompany(
    companyId: string,
    data: CreateCompanyData,
  ): Promise<Company> {
    return this.prisma.company.update({
      where: { id: companyId },
      data: { name: data.name, logoUrl: data.logoUrl },
    });
  }

  async deleteCompany(companyId: string): Promise<void> {
    await this.prisma.company.delete({
      where: { id: companyId },
    });
  }

  async deleteMember(membershipId: string): Promise<void> {
    await this.prisma.membership.delete({
      where: { id: membershipId },
    });
  }

  async findMembershipById(
    membershipId: string,
  ): Promise<MembershipWithUser | null> {
    return this.prisma.membership.findUnique({
      where: { id: membershipId },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findUserActiveCompany(
    userId: string,
  ): Promise<{ activeCompanyId: string | null } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeCompanyId: true },
    });
  }

  async findPendingInviteByEmailAndCompany(
    email: string,
    companyId: string,
  ): Promise<{ id: string; expiresAt: Date } | null> {
    return this.prisma.invite.findFirst({
      where: {
        email,
        companyId,
        acceptedAt: null,
        declinedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async invalidateInvite(inviteId: string): Promise<void> {
    await this.prisma.invite.update({
      where: { id: inviteId },
      data: { declinedAt: new Date() },
    });
  }
}
