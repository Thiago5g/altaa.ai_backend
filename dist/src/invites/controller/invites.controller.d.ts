import { InvitesService } from '../service/invites.service';
export declare class InvitesController {
    private readonly invites;
    constructor(invites: InvitesService);
    pending(userId: string): Promise<import("../service/invites.service").PendingInviteDto[]>;
    accept(userId: string, id: string): Promise<{
        status: "accepted";
    }>;
    decline(userId: string, id: string): Promise<{
        status: "declined";
    }>;
}
