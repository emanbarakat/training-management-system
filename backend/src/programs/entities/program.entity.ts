import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Track } from '../../tracks/entities/track.entity';

export enum ProgramType {
  DIPLOMA = 'diploma',
  SHORT_COURSE = 'short_course',
  SUMMER_TRAINING = 'summer_training',
}

export enum ProgramStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Entity('programs')
@Index(['type'])
@Index(['status'])
@Index(['created_by'])
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProgramType,
  })
  type: ProgramType;

  @Column({ type: 'integer' })
  duration_months: number;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: ProgramStatus,
    default: ProgramStatus.DRAFT,
  })
  status: ProgramStatus;

  @Column({ type: 'uuid' })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.programs)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => Track, (track) => track.program, { cascade: true })
  tracks: Track[];
}
