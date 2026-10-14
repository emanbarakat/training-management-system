import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { AttendanceSession } from './attendance-session.entity';
import { Student } from '../../students/entities/student.entity';
import { Enrollment } from '../../students/entities/enrollment.entity';
import { User } from '../../users/entities/user.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  SIGNED_OUT = 'signed_out',
}

@Entity('attendance_records')
@Index(['session_id'])
@Index(['student_id'])
@Index(['enrollment_id'])
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  session_id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  enrollment_id: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
  })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'uuid' })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => AttendanceSession, (session) => session.records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: AttendanceSession;

  @ManyToOne(() => Student, (student) => student.attendance_records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.attendance_records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updated_by_user: User;
}
