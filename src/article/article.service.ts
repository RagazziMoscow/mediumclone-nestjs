import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import slugify from 'slugify';

import { ArticleEntity } from '@app/article/article.entity';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { UpdateArticleDto } from '@app/article/dto/updateArticle.dto';
import { ArticlesQueryInterface } from '@app/article/types/articlesQuery.interface';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';
import { ArticleType } from '@app/article/types/article.type';


@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findAll(query: ArticlesQueryInterface, currentUserId: number): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .orderBy('articles.createdAt');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author
      });

      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id
      });
    }

    if (query.favorited) {
      const user = await this.userRepository.findOne(
        { username: query.favorited },
        { relations: ['favorites'] }
      );
      const likedArticledIds = user?.favorites.map(article => article.id);

      if (likedArticledIds?.length) {
        queryBuilder.andWhere(
          'articles.id IN (:...ids)',
          { ids: likedArticledIds }
        );
      } else {
        queryBuilder.andWhere('1=0');
      }

    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const favoritesIds = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne(
        currentUserId,
        { relations: ['favorites'] });
      favoritesIds.push(...currentUser.favorites.map((article) => article.id));
    }

    const articles = await queryBuilder.getMany();
    const articlesCount = await queryBuilder.getCount();
    const articlesWithFavorites = articles.map((article: ArticleType) => {
      article.favorited = favoritesIds.includes(article.id);
      return article;
    });

    return { articles: articlesWithFavorites, articlesCount };
  }


  async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!createArticleDto.tagList) {
      article.tagList = [];
    }
    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;

    return this.articleRepository.save(article);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ slug });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  async updateArticle(
    slug: string,
    currentUserId: number,
    updateArticleDto: UpdateArticleDto
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (this.checkIfIsAuthor(article, currentUserId)) {
      const dataToBeUpdated = {
        ...article,
        ...updateArticleDto,
        ...{ slug: this.getSlug(updateArticleDto.title) }
      };

      return await this.articleRepository.save(dataToBeUpdated);
    }
  }

  async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (this.checkIfIsAuthor(article, currentUserId)) {
      return this.articleRepository.delete({ slug });
    }
  }

  async favoriteArticle(currentUserId: number, slug: string): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(currentUserId, { relations: ['favorites'] });
    const isInFavorites = user.favorites.map(article => article.id).includes(article.id);

    if (!isInFavorites) {
      user.favorites.push(article);
      article.favoritesCount++;

      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async unfavoriteArticle(currentUserId: number, slug: string): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(currentUserId, { relations: ['favorites'] });
    const articleIndex = user.favorites.findIndex(favoriteArticle => favoriteArticle.id === article.id);
    const isInFavorites = articleIndex >= 0;

    if (isInFavorites) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;

      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }


  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article }
  }

  private checkIfIsAuthor(article: ArticleEntity, currentUserId: number): boolean {
    if (article.author?.id !== currentUserId) {
      return true;
    }

    throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
        '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}