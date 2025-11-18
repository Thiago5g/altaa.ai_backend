/* eslint-disable prettier/prettier, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

export interface PendingInviteDto {
  id: string;
  companyId: string;
  companyName: string;
  email: string;
  role: Role;
  createdAt: Date;
}

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPending(userId: string): Promise<PendingInviteDto[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) throw new NotFoundException('User not found');
    const invites = (await this.prisma.invite.findMany({
      where: { email: user.email, acceptedAt: null },
      select: {
        id: true,
        companyId: true,
        role: true,
        email: true,
        createdAt: true,
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })) as any[];
    return invites.map((i) => ({
      id: i.id,
      companyId: i.companyId,
      companyName: i.company.name,
      email: i.email,
      role: i.role,
      createdAt: i.createdAt,
    }));
  }

  async accept(userId: string, inviteId: string): Promise<{ status: 'accepted' }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
  const invite = await this.prisma.invite.findUnique({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('Invite not found');
  if (invite.acceptedAt) throw new ForbiddenException('Invite not pending');
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) throw new ForbiddenException('Invite not for this user');

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.membership.findUnique({
        where: { userId_companyId: { userId, companyId: invite.companyId } },
      });
      if (!existing) {
        await tx.membership.create({ data: { userId, companyId: invite.companyId, role: invite.role } });
      }
      await tx.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
      // If user has no active company, set it
      const freshUser = await tx.user.findUnique({ where: { id: userId }, select: { activeCompanyId: true } });
      if (!freshUser?.activeCompanyId) {
        await tx.user.update({ where: { id: userId }, data: { activeCompanyId: invite.companyId } });
      }
    });
    return { status: 'accepted' };
  }

  async decline(userId: string, inviteId: string): Promise<{ status: 'declined' }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) throw new NotFoundException('User not found');
    const invite = await this.prisma.invite.findUnique({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.acceptedAt) throw new ForbiddenException('Invite not pending');
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) throw new ForbiddenException('Invite not for this user');
    // Simple approach: delete invite when declined
    await this.prisma.invite.delete({ where: { id: invite.id } });
    return { status: 'declined' };
  }
}
