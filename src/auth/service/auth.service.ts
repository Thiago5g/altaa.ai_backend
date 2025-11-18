/* eslint-disable prettier/prettier */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { SignupDto } from '../dto/signup.dto';
import { SigninDto } from '../dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AcceptInviteDto } from '../dto/accept-invite.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ access_token: string }> {
    const existsCount = await this.authRepository.countUsersByEmail(dto.email);
    if (existsCount > 0) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = await this.authRepository.createUser({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });
    return this.issueToken(created.id);
  }

  async signin(dto: SigninDto): Promise<{ access_token: string }> {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueToken(user.id);
  }

  async acceptInvite(userId: string, dto: AcceptInviteDto): Promise<{ companyId: string }> {
    const invite = await this.authRepository.findInviteByToken(dto.token);
    if (!invite) throw new UnauthorizedException('Invalid invite');
    if (invite.acceptedAt)
      throw new ForbiddenException('Invite already accepted');

    const exists = await this.authRepository.findMembershipByUserAndCompany(
      userId,
      invite.companyId,
    );
    if (!exists) {
      await this.authRepository.createMembership(
        userId,
        invite.companyId,
        invite.role,
      );
    }
    await this.authRepository.markInviteAsAccepted(invite.id);
    return { companyId: invite.companyId };
  }

  private async issueToken(userId: string): Promise<{ access_token: string }> {
    const access_token = await this.jwt.signAsync({ sub: userId });
    return { access_token };
  }
}
