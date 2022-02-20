import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes
} from '@nestjs/common';

import { ArticleService } from '@app/article/article.service';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { UpdateArticleDto } from '@app/article/dto/updateArticle.dto';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';
import { ArticlesQueryInterface } from '@app/article/types/articlesQuery.interface';
import { FeedQueryInterface } from '@app/article/types/feedQuery.interface';
import { CustomValidationPipe } from '@app/shared/customValidation.pipe';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll(
    @Query() query: ArticlesQueryInterface,
    @User('id') currentUserId: number
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(query, currentUserId);
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @User('id') currentUserId: number,
    @Query() query: FeedQueryInterface
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.getFeed(currentUserId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new CustomValidationPipe())
  async createArticle(
    @Body('article') createArticleDto: CreateArticleDto,
    @User() currentUser: UserEntity
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(currentUser, createArticleDto);
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.findBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new CustomValidationPipe())
  async updateArticle(
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
    @User('id') currentUserId: number
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticle(slug, currentUserId, updateArticleDto);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number
  ) {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async favoriteArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.favoriteArticle(currentUserId, slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async unfavoriteArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.unfavoriteArticle(currentUserId, slug);
    return this.articleService.buildArticleResponse(article);
  }
}
