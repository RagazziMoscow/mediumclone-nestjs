import {
  Get,
  Body,
  Controller,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';

import { UserService } from '@app/user/user.service';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from '@app/user/dto/loginUser.dto';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new ValidationPipe())
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInterface> {
     const newUser = await this.userService.createUser(createUserDto);

     return this.userService.buildUserResponse(newUser);
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);

    return this.userService.buildUserResponse(user);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  currentUser(@User() user: UserEntity): UserResponseInterface {
    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User('id') currentUserId: number,
    @Body('user') updateUserDto: UpdateUserDto
  ): Promise<UserResponseInterface> {
    const user = await this.userService.updateUser(currentUserId, updateUserDto);

    return this.userService.buildUserResponse(user);
  }
}
