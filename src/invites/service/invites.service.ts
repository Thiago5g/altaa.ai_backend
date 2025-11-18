/* eslint-disable prettier/prettier, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { InvitesRepository } from '../repository/invites.repository';

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
  constructor(private readonly invitesRepository: InvitesRepository) {}

  async listPending(userId: string): Promise<PendingInviteDto[]> {
    const user = await this.invitesRepository.findUserEmailById(userId);
    if (!user) throw new NotFoundException('User not found');
    const invites = (await this.invitesRepository.findPendingInvitesByEmail(
      user.email,
    )) as any[];
    return invites.map((i) => ({
      id: i.id,
      companyId: i.companyId,
      companyName: i.company.name,
      email: i.email,
      role: i.role,
      createdAt: i.createdAt,
    }));
  }

  async accept(
    userId: string,
    inviteId: string,
  ): Promise<{ status: 'accepted' }> {
    const user = await this.invitesRepository.findUserByIdWithEmail(userId);
    if (!user) throw new NotFoundException('User not found');
    const invite = await this.invitesRepository.findInviteById(inviteId);
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.acceptedAt)
      throw new ForbiddenException('Invite not pending');
    if (invite.email.toLowerCase() !== user.email.toLowerCase())
      throw new ForbiddenException('Invite not for this user');

    await this.invitesRepository.executeInTransaction(
      async (tx: any) => {
        const existing = await tx.membership.findUnique({
          where: { userId_companyId: { userId, companyId: invite.companyId } },
        });
        if (!existing) {
          await tx.membership.create({
            data: { userId, companyId: invite.companyId, role: invite.role },
          });
        }
        await tx.invite.update({
          where: { id: invite.id },
          data: { acceptedAt: new Date() },
        });
        const freshUser = await tx.user.findUnique({
          where: { id: userId },
          select: { activeCompanyId: true },
        });
        if (!freshUser?.activeCompanyId) {
          await tx.user.update({
            where: { id: userId },
            data: { activeCompanyId: invite.companyId },
          });
        }
      },
    );
    return { status: 'accepted' };
  }

  async decline(
    userId: string,
    inviteId: string,
  ): Promise<{ status: 'declined' }> {
    const user = await this.invitesRepository.findUserEmailById(userId);
    if (!user) throw new NotFoundException('User not found');
    const invite = await this.invitesRepository.findInviteById(inviteId);
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.acceptedAt)
      throw new ForbiddenException('Invite not pending');
    if (invite.email.toLowerCase() !== user.email.toLowerCase())
      throw new ForbiddenException('Invite not for this user');
    await this.invitesRepository.deleteInvite(invite.id);
    return { status: 'declined' };
  }
}
