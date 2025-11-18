import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from '../service/companies.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUserId } from '../../common/user.decorator';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CreateInviteDto } from '../dto/create-invite.dto';

import { ApiParam } from '@nestjs/swagger';

@ApiTags('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller()
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Post('company')
  create(@CurrentUserId() userId: string, @Body() dto: CreateCompanyDto) {
    return this.companies.createCompany(userId, dto);
  }

  @Get('companies')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  list(
    @CurrentUserId() userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    return this.companies.listCompanies(userId, page ?? 1, pageSize ?? 10);
  }

  @Post('company/:id/invite')
  invite(
    @CurrentUserId() userId: string,
    @Param('id') companyId: string,
    @Body() dto: CreateInviteDto,
  ) {
    return this.companies.inviteToCompany(userId, companyId, dto);
  }

  @Post('company/:id/select')
  select(@CurrentUserId() userId: string, @Param('id') companyId: string) {
    return this.companies.selectActiveCompany(userId, companyId);
  }

  @Get('company/:id/members')
  @ApiParam({ name: 'id', type: String })
  members(@CurrentUserId() userId: string, @Param('id') companyId: string) {
    return this.companies.listMembers(userId, companyId);
  }

  @Patch('company/:id')
  @ApiParam({ name: 'id', type: String })
  update(
    @CurrentUserId() userId: string,
    @Param('id') companyId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companies.updateCompany(userId, companyId, dto);
  }

  @Delete('company/:id')
  @ApiParam({ name: 'id', type: String })
  delete(@CurrentUserId() userId: string, @Param('id') companyId: string) {
    return this.companies.deleteCompany(userId, companyId);
  }

  @Delete('company/:companyId/member/:membershipId')
  @ApiParam({ name: 'companyId', type: String })
  @ApiParam({ name: 'membershipId', type: String })
  deleteMember(
    @CurrentUserId() userId: string,
    @Param('companyId') companyId: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.companies.deleteMember(userId, companyId, membershipId);
  }
}
