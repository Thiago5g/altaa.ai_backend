import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Membership, Role } from '@prisma/client';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
}

export interface UserWithPasswordHash {
  id: string;
  passwordHash: string;
}

export interface InviteWithDetails {
  id: string;
  companyId: string;
  role: Role;
  acceptedAt: Date | null;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countUsersByEmail(email: string): Promise<number> {
    return this.prisma.user.count({ where: { email } });
  }

  async createUser(data: CreateUserData): Promise<Pick<User, 'id'>> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
      },
      select: { id: true },
    });
  }

  async findUserByEmail(email: string): Promise<UserWithPasswordHash | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async findInviteByToken(token: string): Promise<InviteWithDetails | null> {
    return this.prisma.invite.findUnique({
      where: { token },
      select: { id: true, companyId: true, role: true, acceptedAt: true },
    });
  }

  async findMembershipByUserAndCompany(
    userId: string,
    companyId: string,
  ): Promise<Membership | null> {
    return this.prisma.membership.findUnique({
      where: { userId_companyId: { userId, companyId } },
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

  async markInviteAsAccepted(inviteId: string): Promise<void> {
    await this.prisma.invite.update({
      where: { id: inviteId },
      data: { acceptedAt: new Date() },
    });
  }

  async findUserActiveCompanyId(
    userId: string,
  ): Promise<{ activeCompanyId: string | null } | null> {
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

  async executeInTransaction<T>(
    callback: (prisma: PrismaService) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return callback(tx as PrismaService);
    });
  }
}
