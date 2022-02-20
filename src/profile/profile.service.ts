import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '@app/user/user.entity';
import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { FollowEntity } from '@app/profile/follow.entity';
import { CustomHttpException } from '@app/shared/customHttp.exception';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>
  ) {}

  async getProfile(profileUserName: string): Promise<UserEntity> {
    return this.getUserByUserName(profileUserName);
  }

  async followProfile(profileUserName: string, currentUserId: number): Promise<UserEntity> {
    const userToBeFollowed = await this.getUserByUserName(profileUserName);

    if (this.canBeFollower(userToBeFollowed.id, currentUserId)) {
      const follow = await this.followRepository.findOne({
        followerId: currentUserId,
        followingId: userToBeFollowed.id
      });

      if (!follow) {
        const followToBeCreated = new FollowEntity();
        followToBeCreated.followerId = currentUserId;
        followToBeCreated.followingId = userToBeFollowed.id;

        await this.followRepository.save(followToBeCreated);
      }

    }

    return userToBeFollowed;
  }

  async unfollowProfile(profileUserName: string, currentUserId: number): Promise<UserEntity> {
    const userToBeUnfollowed = await this.getUserByUserName(profileUserName);

    if (this.canBeFollower(userToBeUnfollowed.id, currentUserId)) {
      await this.followRepository.delete({
        followerId: currentUserId,
        followingId: userToBeUnfollowed.id
      });
    }

    return userToBeUnfollowed;
  }

  async buildProfileResponse(
    user: UserEntity,
    currentUserId: number
  ): Promise<ProfileResponseInterface> {
    const following = await this.checkIsFollowing(user, currentUserId);

    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following
      }
    };
  }

  private async checkIsFollowing(targetUser: UserEntity, currentUserId: number): Promise<boolean> {
    if (!currentUserId) return false;

    const follow = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: targetUser.id
    });

    return !!follow;
  }

  private canBeFollower(targetUserId: number, currentUserId: number): boolean {
    if (targetUserId === currentUserId) {
      throw new CustomHttpException(
        'Follower and following cant be equal',
        HttpStatus.BAD_REQUEST
      )
    }

    return true;
  }

  private async getUserByUserName(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ username: username });

    if (!user) {
      throw new CustomHttpException('Profile not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}