import { Module } from '@nestjs/common';
import { CompaniesController } from './controller/companies.controller';
import { CompaniesService } from './service/companies.service';
import { CompaniesRepository } from './repository/companies.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
})
export class CompaniesModule {}
