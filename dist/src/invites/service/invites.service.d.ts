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
export declare class InvitesService {
    private readonly invitesRepository;
    constructor(invitesRepository: InvitesRepository);
    listPending(userId: string): Promise<PendingInviteDto[]>;
    accept(userId: string, inviteId: string): Promise<{
        status: 'accepted';
    }>;
    decline(userId: string, inviteId: string): Promise<{
        status: 'declined';
    }>;
}
