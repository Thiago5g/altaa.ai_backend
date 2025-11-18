import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptInviteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;
}
