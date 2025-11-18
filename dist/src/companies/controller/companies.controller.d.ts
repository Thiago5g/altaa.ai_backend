import { CompaniesService } from '../service/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CreateInviteDto } from '../dto/create-invite.dto';
export declare class CompaniesController {
    private readonly companies;
    constructor(companies: CompaniesService);
    create(userId: string, dto: CreateCompanyDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
    }>;
    list(userId: string, page?: number, pageSize?: number): Promise<import("../service/companies.service").CompanyListResponse>;
    invite(userId: string, companyId: string, dto: CreateInviteDto): Promise<{
        inviteId: string;
        token: string;
    }>;
    select(userId: string, companyId: string): Promise<{
        activeCompanyId: string;
    }>;
    members(userId: string, companyId: string): Promise<import("../service/companies.service").CompanyMembersResponse>;
    update(userId: string, companyId: string, dto: UpdateCompanyDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
    }>;
    delete(userId: string, companyId: string): Promise<{
        message: string;
    }>;
    deleteMember(userId: string, companyId: string, membershipId: string): Promise<{
        message: string;
    }>;
}
