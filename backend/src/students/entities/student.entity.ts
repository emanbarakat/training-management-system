import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { AttendanceRecord } from '../../attendance/entities/attendance-record.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { Evaluation } from '../../grades/entities/evaluation.entity';

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  GRADUATED = 'graduated',
}

@Entity('students')
@Index(['email'])
@Index(['status'])
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status: StudentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => Enrollment, (enrollment) => enrollment.student, {
    cascade: true,
  })
  enrollments: Enrollment[];

  @OneToMany(() => AttendanceRecord, (record) => record.student, {
    cascade: true,
  })
  attendance_records: AttendanceRecord[];

  @OneToMany(() => Grade, (grade) => grade.student, { cascade: true })
  grades: Grade[];

  @OneToMany(() => Evaluation, (evaluation) => evaluation.student, {
    cascade: true,
  })
  evaluations: Evaluation[];
}
