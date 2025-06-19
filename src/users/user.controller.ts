import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.getAllUsers();
  }

  @Public()
  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    return { message: 'User created successfully', user };
  }
}
