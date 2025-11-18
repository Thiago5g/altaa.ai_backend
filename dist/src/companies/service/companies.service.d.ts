import { CompaniesRepository } from '../repository/companies.repository';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CreateInviteDto } from '../dto/create-invite.dto';
import { Company, Role } from '@prisma/client';
export interface CompanyListResponse {
    data: Array<Company & {
        userRole: Role;
    }>;
    page: number;
    pageSize: number;
    total: number;
}
export interface CompanyMemberSummary {
    membershipId: string;
    userId: string;
    name: string | null;
    email: string;
    role: Role;
    createdAt: Date;
}
export interface CompanyMembersResponse {
    data: CompanyMemberSummary[];
    companyId: string;
    total: number;
    currentUserRole: Role;
}
export declare class CompaniesService {
    private readonly companiesRepository;
    constructor(companiesRepository: CompaniesRepository);
    createCompany(userId: string, dto: CreateCompanyDto): Promise<Company>;
    listCompanies(userId: string, page?: number, pageSize?: number): Promise<CompanyListResponse>;
    inviteToCompany(requestorId: string, companyId: string, dto: CreateInviteDto): Promise<{
        inviteId: string;
        token: string;
    }>;
    selectActiveCompany(userId: string, companyId: string): Promise<{
        activeCompanyId: string;
    }>;
    listMembers(requestorId: string, companyId: string): Promise<CompanyMembersResponse>;
    updateCompany(userId: string, companyId: string, dto: UpdateCompanyDto): Promise<Company>;
    deleteCompany(userId: string, companyId: string): Promise<{
        message: string;
    }>;
    deleteMember(requestorId: string, companyId: string, membershipId: string): Promise<{
        message: string;
    }>;
}
