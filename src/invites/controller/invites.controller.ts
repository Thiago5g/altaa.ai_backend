import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUserId } from '../../common/user.decorator';
import { InvitesService } from '../service/invites.service';

@ApiTags('invites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('invites')
export class InvitesController {
  constructor(private readonly invites: InvitesService) {}

  @Get('pending')
  pending(@CurrentUserId() userId: string) {
    return this.invites.listPending(userId);
  }

  @Post(':id/accept')
  accept(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.invites.accept(userId, id);
  }

  @Post(':id/decline')
  decline(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.invites.decline(userId, id);
  }
}
