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
exports.AuthRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthRepository = class AuthRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async countUsersByEmail(email) {
        return this.prisma.user.count({ where: { email } });
    }
    async createUser(data) {
        return this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                passwordHash: data.passwordHash,
            },
            select: { id: true },
        });
    }
    async findUserByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            select: { id: true, passwordHash: true },
        });
    }
    async findUserById(userId) {
        return this.prisma.user.findUnique({ where: { id: userId } });
    }
    async findInviteByToken(token) {
        return this.prisma.invite.findUnique({
            where: { token },
            select: { id: true, companyId: true, role: true, acceptedAt: true },
        });
    }
    async findMembershipByUserAndCompany(userId, companyId) {
        return this.prisma.membership.findUnique({
            where: { userId_companyId: { userId, companyId } },
        });
    }
    async createMembership(userId, companyId, role) {
        await this.prisma.membership.create({
            data: { userId, companyId, role },
        });
    }
    async markInviteAsAccepted(inviteId) {
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
    async executeInTransaction(callback) {
        return this.prisma.$transaction(async (tx) => {
            return callback(tx);
        });
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthRepository);
//# sourceMappingURL=auth.repository.js.map