import { ArticleEntity } from '@app/article/article.entity';

export type ArticleType = ArticleEntity & { favorited?: boolean };
