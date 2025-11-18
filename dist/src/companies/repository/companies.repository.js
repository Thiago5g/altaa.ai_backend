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
exports.CompaniesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CompaniesRepository = class CompaniesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCompanyWithMembership(userId, companyData) {
        return this.prisma.$transaction(async (tx) => {
            const created = await tx.company.create({
                data: { name: companyData.name, logoUrl: companyData.logoUrl },
            });
            await tx.membership.create({
                data: { userId, companyId: created.id, role: client_1.Role.OWNER },
            });
            await tx.user.update({
                where: { id: userId },
                data: { activeCompanyId: created.id },
            });
            return created;
        });
    }
    async findMembershipsByUserId(userId, skip, take) {
        return this.prisma.membership.findMany({
            where: { userId },
            select: {
                role: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
            orderBy: { company: { createdAt: 'desc' } },
            skip,
            take,
        });
    }
    async countMembershipsByUserId(userId) {
        return this.prisma.membership.count({ where: { userId } });
    }
    async findMembershipByUserAndCompany(userId, companyId) {
        return this.prisma.membership.findUnique({
            where: { userId_companyId: { userId, companyId } },
            select: { id: true, role: true },
        });
    }
    async createInvite(companyId, email, role, token) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        return this.prisma.invite.create({
            data: { companyId, email, role, token, expiresAt },
            select: { id: true, token: true },
        });
    }
    async updateUserActiveCompany(userId, companyId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { activeCompanyId: companyId },
        });
    }
    async findMembershipsByCompanyId(companyId) {
        return this.prisma.membership.findMany({
            where: { companyId },
            select: {
                id: true,
                role: true,
                createdAt: true,
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { role: 'asc' },
        });
    }
    async findCompanyById(companyId) {
        return this.prisma.company.findUnique({
            where: { id: companyId },
        });
    }
    async updateCompany(companyId, data) {
        return this.prisma.company.update({
            where: { id: companyId },
            data: { name: data.name, logoUrl: data.logoUrl },
        });
    }
    async deleteCompany(companyId) {
        await this.prisma.company.delete({
            where: { id: companyId },
        });
    }
    async deleteMember(membershipId) {
        await this.prisma.membership.delete({
            where: { id: membershipId },
        });
    }
    async findMembershipById(membershipId) {
        return this.prisma.membership.findUnique({
            where: { id: membershipId },
            select: {
                id: true,
                role: true,
                createdAt: true,
                user: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async findUserActiveCompany(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { activeCompanyId: true },
        });
    }
    async findPendingInviteByEmailAndCompany(email, companyId) {
        return this.prisma.invite.findFirst({
            where: {
                email,
                companyId,
                acceptedAt: null,
                declinedAt: null,
                expiresAt: { gt: new Date() },
            },
            select: { id: true, expiresAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async invalidateInvite(inviteId) {
        await this.prisma.invite.update({
            where: { id: inviteId },
            data: { declinedAt: new Date() },
        });
    }
};
exports.CompaniesRepository = CompaniesRepository;
exports.CompaniesRepository = CompaniesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesRepository);
//# sourceMappingURL=companies.repository.js.map