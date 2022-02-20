import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards
} from '@nestjs/common';

import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { ProfileService } from '@app/profile/profile.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @Param('username') profileUserName: string,
    @User('id') currentUserId: number
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfile(profileUserName);
    return this.profileService.buildProfileResponse(profile, currentUserId);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @Param('username') profileUserName: string,
    @User('id') currentUserId: number
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followProfile(profileUserName, currentUserId);
    return this.profileService.buildProfileResponse(profile, currentUserId);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowProfile(
    @Param('username') profileUserName: string,
    @User('id') currentUserId: number
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.unfollowProfile(profileUserName, currentUserId);
    return this.profileService.buildProfileResponse(profile, currentUserId);
  }
}
