import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/auth/public.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'List of users returned successfully.' })
  async findAll() {
    return this.userService.getAllUsers();
  }

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'User signup' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  async signup(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    return { message: 'User created successfully', user };
  }
}
