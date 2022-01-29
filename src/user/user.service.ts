import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';

import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from '@app/user/dto/loginUser.dto';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async createUser(createdUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({ email: createdUserDto.email});
    const userByuserName = await this.userRepository.findOne({ username: createdUserDto.username});

    if (userByEmail || userByuserName) {
      throw new HttpException('Email or username are taken', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createdUserDto);

    return await this.userRepository.save(newUser);
  }

  async findById(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne(id);
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity | undefined> {
    const userByEmail = await this.userRepository.findOne(
      { email: loginUserDto.email },
      { select: ['id', 'bio', 'email', 'username', 'image', 'password']}
    );

    if (userByEmail && await compare(loginUserDto.password, userByEmail.password)) {
      delete userByEmail.password;
      return userByEmail;
    } else {
      throw new HttpException('Email or password are not correct', HttpStatus.FORBIDDEN);
    }
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user)
      }
    };
  }

  private generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET
    );
  }
}
