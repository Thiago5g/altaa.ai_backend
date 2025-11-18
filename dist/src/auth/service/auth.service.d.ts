import { AuthRepository } from '../repository/auth.repository';
import { SignupDto } from '../dto/signup.dto';
import { SigninDto } from '../dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { AcceptInviteDto } from '../dto/accept-invite.dto';
export declare class AuthService {
    private readonly authRepository;
    private jwt;
    constructor(authRepository: AuthRepository, jwt: JwtService);
    signup(dto: SignupDto): Promise<{
        access_token: string;
    }>;
    signin(dto: SigninDto): Promise<{
        access_token: string;
    }>;
    acceptInvite(userId: string, dto: AcceptInviteDto): Promise<{
        companyId: string;
    }>;
    private issueToken;
}
