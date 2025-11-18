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
export declare class CompaniesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createCompanyWithMembership(userId: string, companyData: CreateCompanyData): Promise<Company>;
    findMembershipsByUserId(userId: string, skip: number, take: number): Promise<MembershipWithCompany[]>;
    countMembershipsByUserId(userId: string): Promise<number>;
    findMembershipByUserAndCompany(userId: string, companyId: string): Promise<MembershipWithRole | null>;
    createInvite(companyId: string, email: string, role: Role, token: string): Promise<InviteCreated>;
    updateUserActiveCompany(userId: string, companyId: string | null): Promise<void>;
    findMembershipsByCompanyId(companyId: string): Promise<MembershipWithUser[]>;
    findCompanyById(companyId: string): Promise<Company | null>;
    updateCompany(companyId: string, data: CreateCompanyData): Promise<Company>;
    deleteCompany(companyId: string): Promise<void>;
    deleteMember(membershipId: string): Promise<void>;
    findMembershipById(membershipId: string): Promise<MembershipWithUser | null>;
    findUserActiveCompany(userId: string): Promise<{
        activeCompanyId: string | null;
    } | null>;
    findPendingInviteByEmailAndCompany(email: string, companyId: string): Promise<{
        id: string;
        expiresAt: Date;
    } | null>;
    invalidateInvite(inviteId: string): Promise<void>;
}
