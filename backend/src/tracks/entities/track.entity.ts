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
import { Program } from '../../programs/entities/program.entity';
import { TrackSupervisor } from './track-supervisor.entity';
import { Enrollment } from '../../students/entities/enrollment.entity';
import { AttendanceSession } from '../../attendance/entities/attendance-session.entity';
import { TrackKPI } from '../../reports/entities/track-kpi.entity';

export enum TrackStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('tracks')
@Index(['program_id'])
@Index(['status'])
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  program_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  curriculum_outline: string;

  @Column({
    type: 'enum',
    enum: TrackStatus,
    default: TrackStatus.ACTIVE,
  })
  status: TrackStatus;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Program, (program) => program.tracks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @OneToMany(() => TrackSupervisor, (supervisor) => supervisor.track, {
    cascade: true,
  })
  supervisors: TrackSupervisor[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.track, {
    cascade: true,
  })
  enrollments: Enrollment[];

  @OneToMany(() => AttendanceSession, (session) => session.track, {
    cascade: true,
  })
  attendance_sessions: AttendanceSession[];

  @OneToMany(() => TrackKPI, (kpi) => kpi.track, { cascade: true })
  kpis: TrackKPI[];
}
