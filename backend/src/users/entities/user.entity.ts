import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Program } from '../../programs/entities/program.entity';
import { Track } from '../../tracks/entities/track.entity';
import { TrackSupervisor } from '../../tracks/entities/track-supervisor.entity';
import { Enrollment } from '../../students/entities/enrollment.entity';
import { AttendanceSession } from '../../attendance/entities/attendance-session.entity';
import { AttendanceRecord } from '../../attendance/entities/attendance-record.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { Evaluation } from '../../grades/entities/evaluation.entity';

export enum UserRole {
  ADMIN = 'admin',
  TRAINING_MANAGER = 'training_manager',
  INSTRUCTOR = 'instructor',
  STUDENT_AFFAIRS = 'student_affairs',
  STUDENT = 'student',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('users')
@Index(['email'])
@Index(['role'])
@Index(['status'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  // Relations
  @OneToMany(() => Program, (program) => program.created_by)
  programs: Program[];

  @OneToMany(() => TrackSupervisor, (supervisor) => supervisor.supervisor)
  supervised_tracks: TrackSupervisor[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.instructor)
  enrollments: Enrollment[];

  @OneToMany(() => AttendanceSession, (session) => session.created_by)
  attendance_sessions: AttendanceSession[];

  @OneToMany(() => AttendanceRecord, (record) => record.updated_by)
  attendance_records: AttendanceRecord[];

  @OneToMany(() => Grade, (grade) => grade.graded_by)
  grades: Grade[];

  @OneToMany(() => Evaluation, (evaluation) => evaluation.evaluator)
  evaluations: Evaluation[];
}
