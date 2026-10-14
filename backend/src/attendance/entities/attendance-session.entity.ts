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
import { Track } from '../../tracks/entities/track.entity';
import { User } from '../../users/entities/user.entity';
import { AttendanceRecord } from './attendance-record.entity';

export enum SessionType {
  MORNING = 'morning',
  EVENING = 'evening',
}

@Entity('attendance_sessions')
@Index(['track_id'])
@Index(['date'])
@Index(['session_type'])
export class AttendanceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  track_id: string;

  @Column({ type: 'uuid' })
  program_id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: SessionType,
  })
  session_type: SessionType;

  @Column({ type: 'uuid' })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Track, (track) => track.attendance_sessions)
  @JoinColumn({ name: 'track_id' })
  track: Track;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => AttendanceRecord, (record) => record.session, {
    cascade: true,
  })
  records: AttendanceRecord[];
}
