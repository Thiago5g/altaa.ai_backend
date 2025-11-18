import { AuthService } from '../service/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { SigninDto } from '../dto/signin.dto';
import { AcceptInviteDto } from '../dto/accept-invite.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    signup(dto: SignupDto): Promise<{
        access_token: string;
    }>;
    signin(dto: SigninDto): Promise<{
        access_token: string;
    }>;
    acceptInvite(userId: string, dto: AcceptInviteDto): Promise<{
        companyId: string;
    }>;
}
