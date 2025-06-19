
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'jeet', description: 'user name' })
  @IsString()
  userName!: string;

  @ApiProperty({ example: 'abc@gmail.com', description: 'email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin123', description: 'password ' })
  @IsString()
  @MinLength(6)
  password!: string;
}
