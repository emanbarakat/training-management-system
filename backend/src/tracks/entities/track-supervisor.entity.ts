import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Track } from './track.entity';
import { User } from '../../users/entities/user.entity';

@Entity('track_supervisors')
@Unique(['track_id', 'supervisor_id'])
@Index(['track_id'])
@Index(['supervisor_id'])
export class TrackSupervisor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  track_id: string;

  @Column({ type: 'uuid' })
  supervisor_id: string;

  @Column({ type: 'uuid', nullable: true })
  assigned_by: string;

  @CreateDateColumn()
  assigned_at: Date;

  // Relations
  @ManyToOne(() => Track, (track) => track.supervisors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'track_id' })
  track: Track;

  @ManyToOne(() => User, (user) => user.supervised_tracks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: User;
}
