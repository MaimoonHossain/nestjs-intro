import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { postStatus } from './enums/postStatus.enum';
import { CreatePostMetaOptionsDto } from './dtos/create-post-meta-options.dto';
import { postType } from './enums/postType.enum';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: false,
  })
  title: string;
  @Column({
    type: 'enum',
    enum: postType,
    nullable: false,
    default: postType.POST,
  })
  postType: postType;
  @Column({
    type: 'varchar',
    length: 236,
    nullable: false,
  })
  description: string;
  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
    unique: true,
  })
  slug: string;
  @Column({
    type: 'enum',
    enum: postStatus,
    nullable: false,
    default: postStatus.DRAFT,
  })
  status: postStatus;
  @Column({
    type: 'text',
    nullable: true,
  })
  content?: string;
  @Column({
    type: 'text',
    nullable: true,
  })
  schema?: string;
  @Column({
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  featuredImageUrl?: string;
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  publishOn: Date;
  // @Column({
  //   type: 'varchar',
  //   length: 96,
  //   nullable: true,
  // })
  tags: string[];
  // @Column({
  //   type: 'varchar',
  //   length: 96,
  //   nullable: false,
  // })
  metaOptions: CreatePostMetaOptionsDto[];
}
