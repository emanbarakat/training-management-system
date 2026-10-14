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
import { Student } from '../../students/entities/student.entity';
import { Enrollment } from '../../students/entities/enrollment.entity';
import { User } from '../../users/entities/user.entity';

export enum AssessmentType {
  EXAM = 'exam',
  ASSIGNMENT = 'assignment',
  PRACTICAL = 'practical',
  REVIEW = 'review',
}

@Entity('grades')
@Index(['student_id'])
@Index(['enrollment_id'])
@Index(['created_at'])
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  enrollment_id: string;

  @Column({ type: 'uuid' })
  graded_by: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({
    type: 'enum',
    enum: AssessmentType,
  })
  assessment_type: AssessmentType;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  max_score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Student, (student) => student.grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'graded_by' })
  grader: User;
}
