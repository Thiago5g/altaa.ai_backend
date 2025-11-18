import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InvitesController } from './controller/invites.controller';
import { InvitesService } from './service/invites.service';
import { InvitesRepository } from './repository/invites.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InvitesController],
  providers: [InvitesService, InvitesRepository],
  exports: [InvitesService],
})
export class InvitesModule {}
