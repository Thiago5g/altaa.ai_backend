import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { SigninDto } from '../dto/signin.dto';
import { AcceptInviteDto } from '../dto/accept-invite.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { CurrentUserId } from '../../common/user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Post('signin')
  signin(@Body() dto: SigninDto) {
    return this.auth.signin(dto);
  }

  @Post('accept-invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  acceptInvite(@CurrentUserId() userId: string, @Body() dto: AcceptInviteDto) {
    return this.auth.acceptInvite(userId, dto);
  }
}
