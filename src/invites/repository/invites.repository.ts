import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

export interface InviteWithCompany {
  id: string;
  companyId: string;
  role: Role;
  email: string;
  createdAt: Date;
  company: {
    id: string;
    name: string;
  };
}

export interface UserEmail {
  email: string;
}

export interface UserWithEmail {
  id: string;
  email: string;
  activeCompanyId: string | null;
}

export interface InviteDetails {
  id: string;
  email: string;
  companyId: string;
  role: Role;
  acceptedAt: Date | null;
}

export interface UserActiveCompany {
  activeCompanyId: string | null;
}

@Injectable()
export class InvitesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPendingInvitesByEmail(email: string): Promise<InviteWithCompany[]> {
    return this.prisma.invite.findMany({
      where: { email, acceptedAt: null },
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
  }

  async findUserEmailById(userId: string): Promise<UserEmail | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
  }

  async findUserByIdWithEmail(userId: string): Promise<UserWithEmail | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, activeCompanyId: true },
    });
  }

  async findInviteById(inviteId: string): Promise<InviteDetails | null> {
    return this.prisma.invite.findUnique({
      where: { id: inviteId },
      select: {
        id: true,
        email: true,
        companyId: true,
        role: true,
        acceptedAt: true,
      },
    });
  }

  async findMembershipByUserAndCompany(
    userId: string,
    companyId: string,
  ): Promise<{ id: string } | null> {
    return this.prisma.membership.findUnique({
      where: { userId_companyId: { userId, companyId } },
      select: { id: true },
    });
  }

  async createMembership(
    userId: string,
    companyId: string,
    role: Role,
  ): Promise<void> {
    await this.prisma.membership.create({
      data: { userId, companyId, role },
    });
  }

  async markInviteAccepted(inviteId: string): Promise<void> {
    await this.prisma.invite.update({
      where: { id: inviteId },
      data: { acceptedAt: new Date() },
    });
  }

  async findUserActiveCompanyId(
    userId: string,
  ): Promise<UserActiveCompany | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeCompanyId: true },
    });
  }

  async updateUserActiveCompany(
    userId: string,
    companyId: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { activeCompanyId: companyId },
    });
  }

  async deleteInvite(inviteId: string): Promise<void> {
    await this.prisma.invite.delete({ where: { id: inviteId } });
  }

  async executeInTransaction<T>(
    callback: (prisma: any) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
