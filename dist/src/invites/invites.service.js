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
exports.InvitesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InvitesService = class InvitesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPending(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const invites = (await this.prisma.invite.findMany({
            where: { email: user.email, acceptedAt: null },
            select: {
                id: true,
                companyId: true,
                role: true,
                email: true,
                createdAt: true,
                company: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        }));
        return invites.map((i) => ({
            id: i.id,
            companyId: i.companyId,
            companyName: i.company.name,
            email: i.email,
            role: i.role,
            createdAt: i.createdAt,
        }));
    }
    async accept(userId, inviteId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const invite = await this.prisma.invite.findUnique({ where: { id: inviteId } });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (invite.acceptedAt)
            throw new common_1.ForbiddenException('Invite not pending');
        if (invite.email.toLowerCase() !== user.email.toLowerCase())
            throw new common_1.ForbiddenException('Invite not for this user');
        await this.prisma.$transaction(async (tx) => {
            const existing = await tx.membership.findUnique({
                where: { userId_companyId: { userId, companyId: invite.companyId } },
            });
            if (!existing) {
                await tx.membership.create({ data: { userId, companyId: invite.companyId, role: invite.role } });
            }
            await tx.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
            const freshUser = await tx.user.findUnique({ where: { id: userId }, select: { activeCompanyId: true } });
            if (!freshUser?.activeCompanyId) {
                await tx.user.update({ where: { id: userId }, data: { activeCompanyId: invite.companyId } });
            }
        });
        return { status: 'accepted' };
    }
    async decline(userId, inviteId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const invite = await this.prisma.invite.findUnique({ where: { id: inviteId } });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (invite.acceptedAt)
            throw new common_1.ForbiddenException('Invite not pending');
        if (invite.email.toLowerCase() !== user.email.toLowerCase())
            throw new common_1.ForbiddenException('Invite not for this user');
        await this.prisma.invite.delete({ where: { id: invite.id } });
        return { status: 'declined' };
    }
};
exports.InvitesService = InvitesService;
exports.InvitesService = InvitesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvitesService);
//# sourceMappingURL=invites.service.js.map