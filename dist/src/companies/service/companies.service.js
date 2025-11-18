"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const companies_repository_1 = require("../repository/companies.repository");
const node_crypto_1 = require("node:crypto");
const client_1 = require("@prisma/client");
let CompaniesService = class CompaniesService {
    companiesRepository;
    constructor(companiesRepository) {
        this.companiesRepository = companiesRepository;
    }
    async createCompany(userId, dto) {
        return this.companiesRepository.createCompanyWithMembership(userId, {
            name: dto.name,
            logoUrl: dto.logoUrl,
        });
    }
    async listCompanies(userId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const memberships = await this.companiesRepository.findMembershipsByUserId(userId, skip, pageSize);
        const companies = memberships.map((m) => ({
            ...m.company,
            userRole: m.role,
        }));
        const total = await this.companiesRepository.countMembershipsByUserId(userId);
        return { data: companies, page, pageSize, total };
    }
    async inviteToCompany(requestorId, companyId, dto) {
        const member = await this.companiesRepository.findMembershipByUserAndCompany(requestorId, companyId);
        if (!member)
            throw new common_1.ForbiddenException('Not a member');
        if (member.role === client_1.Role.MEMBER)
            throw new common_1.ForbiddenException('Only OWNER/ADMIN can invite');
        const existingInvite = await this.companiesRepository.findPendingInviteByEmailAndCompany(dto.email, companyId);
        if (existingInvite) {
            return {
                inviteId: existingInvite.id,
                token: 'Invite already exists and is still valid',
            };
        }
        const token = (0, node_crypto_1.randomUUID)();
        const invite = await this.companiesRepository.createInvite(companyId, dto.email, dto.role, token);
        console.log(`[EMAIL SIMULATION] Sending invite to ${dto.email} for company ${companyId}`);
        console.log(`Invite token: ${invite.token}`);
        console.log(`Invite expires in 7 days`);
        return { inviteId: invite.id, token: invite.token };
    }
    async selectActiveCompany(userId, companyId) {
        const member = await this.companiesRepository.findMembershipByUserAndCompany(userId, companyId);
        if (!member)
            throw new common_1.NotFoundException('Not a member of this company');
        await this.companiesRepository.updateUserActiveCompany(userId, companyId);
        return { activeCompanyId: companyId };
    }
    async listMembers(requestorId, companyId) {
        const requesterMembership = await this.companiesRepository.findMembershipByUserAndCompany(requestorId, companyId);
        if (!requesterMembership)
            throw new common_1.ForbiddenException('Not a member of this company');
        const memberships = await this.companiesRepository.findMembershipsByCompanyId(companyId);
        const data = memberships.map((m) => ({
            membershipId: m.id,
            userId: m.user.id,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
            createdAt: m.createdAt,
        }));
        return {
            data,
            companyId,
            total: data.length,
            currentUserRole: requesterMembership.role,
        };
    }
    async updateCompany(userId, companyId, dto) {
        const member = await this.companiesRepository.findMembershipByUserAndCompany(userId, companyId);
        if (!member)
            throw new common_1.ForbiddenException('Not a member of this company');
        if (member.role !== client_1.Role.OWNER && member.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only OWNER/ADMIN can update company');
        }
        const company = await this.companiesRepository.findCompanyById(companyId);
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        return this.companiesRepository.updateCompany(companyId, {
            name: dto.name,
            logoUrl: dto.logoUrl,
        });
    }
    async deleteCompany(userId, companyId) {
        const member = await this.companiesRepository.findMembershipByUserAndCompany(userId, companyId);
        if (!member)
            throw new common_1.ForbiddenException('Not a member of this company');
        if (member.role !== client_1.Role.OWNER) {
            throw new common_1.ForbiddenException('Only OWNER can delete company');
        }
        const company = await this.companiesRepository.findCompanyById(companyId);
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        await this.companiesRepository.deleteCompany(companyId);
        return { message: 'Company deleted successfully' };
    }
    async deleteMember(requestorId, companyId, membershipId) {
        const requesterMembership = await this.companiesRepository.findMembershipByUserAndCompany(requestorId, companyId);
        if (!requesterMembership)
            throw new common_1.ForbiddenException('Not a member of this company');
        if (requesterMembership.role !== client_1.Role.OWNER &&
            requesterMembership.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only OWNER/ADMIN can remove members');
        }
        const targetMembership = await this.companiesRepository.findMembershipById(membershipId);
        if (!targetMembership)
            throw new common_1.NotFoundException('Member not found');
        if (targetMembership.role === client_1.Role.OWNER) {
            throw new common_1.ForbiddenException('Cannot remove OWNER');
        }
        if (targetMembership.role === client_1.Role.ADMIN &&
            requesterMembership.role !== client_1.Role.OWNER) {
            throw new common_1.ForbiddenException('Only OWNER can remove ADMIN members');
        }
        const user = await this.companiesRepository.findUserActiveCompany(targetMembership.user.id);
        if (user && user.activeCompanyId === companyId) {
            await this.companiesRepository.updateUserActiveCompany(targetMembership.user.id, null);
        }
        await this.companiesRepository.deleteMember(membershipId);
        return { message: 'Member removed successfully' };
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [companies_repository_1.CompaniesRepository])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map