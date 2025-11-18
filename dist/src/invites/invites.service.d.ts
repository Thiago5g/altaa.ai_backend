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
export declare class InvitesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listPending(userId: string): Promise<PendingInviteDto[]>;
    accept(userId: string, inviteId: string): Promise<{
        status: 'accepted';
    }>;
    decline(userId: string, inviteId: string): Promise<{
        status: 'declined';
    }>;
}
