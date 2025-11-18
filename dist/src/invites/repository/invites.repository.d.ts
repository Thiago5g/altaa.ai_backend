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
    expiresAt: Date;
}
export interface UserActiveCompany {
    activeCompanyId: string | null;
}
export declare class InvitesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findPendingInvitesByEmail(email: string): Promise<InviteWithCompany[]>;
    findUserEmailById(userId: string): Promise<UserEmail | null>;
    findUserByIdWithEmail(userId: string): Promise<UserWithEmail | null>;
    findInviteById(inviteId: string): Promise<InviteDetails | null>;
    findMembershipByUserAndCompany(userId: string, companyId: string): Promise<{
        id: string;
    } | null>;
    createMembership(userId: string, companyId: string, role: Role): Promise<void>;
    markInviteAccepted(inviteId: string): Promise<void>;
    findUserActiveCompanyId(userId: string): Promise<UserActiveCompany | null>;
    updateUserActiveCompany(userId: string, companyId: string): Promise<void>;
    deleteInvite(inviteId: string): Promise<void>;
    executeInTransaction<T>(callback: (prisma: any) => Promise<T>): Promise<T>;
}
