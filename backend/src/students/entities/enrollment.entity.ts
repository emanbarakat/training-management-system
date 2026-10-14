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
import { Student } from './student.entity';
import { Track } from '../../tracks/entities/track.entity';
import { User } from '../../users/entities/user.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { Evaluation } from '../../grades/entities/evaluation.entity';
import { AttendanceRecord } from '../../attendance/entities/attendance-record.entity';

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn',
  SUSPENDED = 'suspended',
}

@Entity('enrollments')
@Index(['student_id'])
@Index(['track_id'])
@Index(['status'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  track_id: string;

  @Column({ type: 'uuid', nullable: true })
  instructor_id: string;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ENROLLED,
  })
  status: EnrollmentStatus;

  @Column({ type: 'date' })
  enrollment_date: Date;

  @Column({ type: 'date', nullable: true })
  completion_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Student, (student) => student.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Track, (track) => track.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'track_id' })
  track: Track;

  @ManyToOne(() => User, (user) => user.enrollments, { nullable: true })
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @OneToMany(() => Grade, (grade) => grade.enrollment, { cascade: true })
  grades: Grade[];

  @OneToMany(() => Evaluation, (evaluation) => evaluation.enrollment, {
    cascade: true,
  })
  evaluations: Evaluation[];

  @OneToMany(() => AttendanceRecord, (record) => record.enrollment, {
    cascade: true,
  })
  attendance_records: AttendanceRecord[];
}
