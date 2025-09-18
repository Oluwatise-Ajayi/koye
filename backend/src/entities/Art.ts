import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
@Entity()
export class Art {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() title!: string;
  @Column({nullable:true}) description?: string;
  @Column() fileUrl!: string;
  @Column({nullable:true}) ipfsMetadataCid?: string;
  @Column('simple-json', {nullable:true}) metadataJson?: any;
  @Column({default:'pending'}) aiStatus!: string;
  @Column({default:'queued'}) nftStatus!: string;
  @Column({nullable:true}) nftTokenId?: string;
  @Column({nullable:true}) nftTxHash?: string;
  @ManyToOne(()=>User, {nullable:true}) artist?: User;
  @CreateDateColumn() createdAt!: Date;
}
