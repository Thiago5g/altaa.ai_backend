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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const companies_service_1 = require("../service/companies.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const user_decorator_1 = require("../../common/user.decorator");
const create_company_dto_1 = require("../dto/create-company.dto");
const update_company_dto_1 = require("../dto/update-company.dto");
const create_invite_dto_1 = require("../dto/create-invite.dto");
const swagger_2 = require("@nestjs/swagger");
let CompaniesController = class CompaniesController {
    companies;
    constructor(companies) {
        this.companies = companies;
    }
    create(userId, dto) {
        return this.companies.createCompany(userId, dto);
    }
    list(userId, page, pageSize) {
        return this.companies.listCompanies(userId, page ?? 1, pageSize ?? 10);
    }
    invite(userId, companyId, dto) {
        return this.companies.inviteToCompany(userId, companyId, dto);
    }
    select(userId, companyId) {
        return this.companies.selectActiveCompany(userId, companyId);
    }
    members(userId, companyId) {
        return this.companies.listMembers(userId, companyId);
    }
    update(userId, companyId, dto) {
        return this.companies.updateCompany(userId, companyId, dto);
    }
    delete(userId, companyId) {
        return this.companies.deleteCompany(userId, companyId);
    }
    deleteMember(userId, companyId, membershipId) {
        return this.companies.deleteMember(userId, companyId, membershipId);
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Post)('company'),
    __param(0, (0, user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_company_dto_1.CreateCompanyDto]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('companies'),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    __param(0, (0, user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('pageSize', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('company/:id/invite'),
    __param(0, (0, user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_invite_dto_1.CreateInviteDto]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "invite", null);
__decorate([
    (0, common_1.Post)('company/:id/select'),
    __param(0, (0, user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "select", null);
__decorate([
    (0, common_1.Get)('company/:id/members'),
    (0, swagger_2.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "members", null);
__decorate([
    (0, common_1.Patch)('company/:id'),
    (0, swagger_2.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_company_dto_1.UpdateCompanyDto]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('company/:id'),
    (0, swagger_2.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "delete", null);
__decorate([
    (0, common_1.Delete)('company/:companyId/member/:membershipId'),
    (0, swagger_2.ApiParam)({ name: 'companyId', type: String }),
    (0, swagger_2.ApiParam)({ name: 'membershipId', type: String }),
    __param(0, (0, user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('companyId')),
    __param(2, (0, common_1.Param)('membershipId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "deleteMember", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, swagger_1.ApiTags)('companies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService])
], CompaniesController);
//# sourceMappingURL=companies.controller.js.map