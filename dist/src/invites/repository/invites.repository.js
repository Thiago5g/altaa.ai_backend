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
exports.InvitesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let InvitesRepository = class InvitesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findPendingInvitesByEmail(email) {
        return this.prisma.invite.findMany({
            where: {
                email,
                acceptedAt: null,
                declinedAt: null,
                expiresAt: { gt: new Date() },
            },
            select: {
                id: true,
                companyId: true,
                role: true,
                email: true,
                createdAt: true,
                company: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findUserEmailById(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });
    }
    async findUserByIdWithEmail(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, activeCompanyId: true },
        });
    }
    async findInviteById(inviteId) {
        return this.prisma.invite.findUnique({
            where: { id: inviteId },
            select: {
                id: true,
                email: true,
                companyId: true,
                role: true,
                acceptedAt: true,
                expiresAt: true,
            },
        });
    }
    async findMembershipByUserAndCompany(userId, companyId) {
        return this.prisma.membership.findUnique({
            where: { userId_companyId: { userId, companyId } },
            select: { id: true },
        });
    }
    async createMembership(userId, companyId, role) {
        await this.prisma.membership.create({
            data: { userId, companyId, role },
        });
    }
    async markInviteAccepted(inviteId) {
        await this.prisma.invite.update({
            where: { id: inviteId },
            data: { acceptedAt: new Date() },
        });
    }
    async findUserActiveCompanyId(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { activeCompanyId: true },
        });
    }
    async updateUserActiveCompany(userId, companyId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { activeCompanyId: companyId },
        });
    }
    async deleteInvite(inviteId) {
        await this.prisma.invite.delete({ where: { id: inviteId } });
    }
    async executeInTransaction(callback) {
        return this.prisma.$transaction(callback);
    }
};
exports.InvitesRepository = InvitesRepository;
exports.InvitesRepository = InvitesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvitesRepository);
//# sourceMappingURL=invites.repository.js.map