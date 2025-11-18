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
const invites_repository_1 = require("../repository/invites.repository");
let InvitesService = class InvitesService {
    invitesRepository;
    constructor(invitesRepository) {
        this.invitesRepository = invitesRepository;
    }
    async listPending(userId) {
        const user = await this.invitesRepository.findUserEmailById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const invites = (await this.invitesRepository.findPendingInvitesByEmail(user.email));
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
        const user = await this.invitesRepository.findUserByIdWithEmail(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const invite = await this.invitesRepository.findInviteById(inviteId);
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (invite.acceptedAt)
            throw new common_1.ForbiddenException('Invite already accepted');
        if (invite.email.toLowerCase() !== user.email.toLowerCase())
            throw new common_1.ForbiddenException('Invite not for this user');
        if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
            throw new common_1.ForbiddenException('Invite has expired');
        }
        await this.invitesRepository.executeInTransaction(async (tx) => {
            const existing = await tx.membership.findUnique({
                where: { userId_companyId: { userId, companyId: invite.companyId } },
            });
            if (!existing) {
                await tx.membership.create({
                    data: { userId, companyId: invite.companyId, role: invite.role },
                });
            }
            await tx.invite.update({
                where: { id: invite.id },
                data: { acceptedAt: new Date() },
            });
            const freshUser = await tx.user.findUnique({
                where: { id: userId },
                select: { activeCompanyId: true },
            });
            if (!freshUser?.activeCompanyId) {
                await tx.user.update({
                    where: { id: userId },
                    data: { activeCompanyId: invite.companyId },
                });
            }
        });
        return { status: 'accepted' };
    }
    async decline(userId, inviteId) {
        const user = await this.invitesRepository.findUserEmailById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const invite = await this.invitesRepository.findInviteById(inviteId);
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (invite.acceptedAt)
            throw new common_1.ForbiddenException('Invite not pending');
        if (invite.email.toLowerCase() !== user.email.toLowerCase())
            throw new common_1.ForbiddenException('Invite not for this user');
        await this.invitesRepository.deleteInvite(invite.id);
        return { status: 'declined' };
    }
};
exports.InvitesService = InvitesService;
exports.InvitesService = InvitesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [invites_repository_1.InvitesRepository])
], InvitesService);
//# sourceMappingURL=invites.service.js.map