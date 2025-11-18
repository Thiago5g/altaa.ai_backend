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
export declare class AuthRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    countUsersByEmail(email: string): Promise<number>;
    createUser(data: CreateUserData): Promise<Pick<User, 'id'>>;
    findUserByEmail(email: string): Promise<UserWithPasswordHash | null>;
    findUserById(userId: string): Promise<User | null>;
    findInviteByToken(token: string): Promise<InviteWithDetails | null>;
    findMembershipByUserAndCompany(userId: string, companyId: string): Promise<Membership | null>;
    createMembership(userId: string, companyId: string, role: Role): Promise<void>;
    markInviteAsAccepted(inviteId: string): Promise<void>;
    findUserActiveCompanyId(userId: string): Promise<{
        activeCompanyId: string | null;
    } | null>;
    updateUserActiveCompany(userId: string, companyId: string): Promise<void>;
    executeInTransaction<T>(callback: (prisma: PrismaService) => Promise<T>): Promise<T>;
}
