import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({unique:true, nullable:true}) username?: string;
  @Column({nullable:true}) walletAddress?: string;
  @CreateDateColumn() createdAt!: Date;
}
