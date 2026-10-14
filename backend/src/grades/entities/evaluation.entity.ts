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

export enum CompetencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Entity('evaluations')
@Index(['student_id'])
@Index(['enrollment_id'])
@Index(['created_at'])
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  enrollment_id: string;

  @Column({ type: 'uuid' })
  evaluator: string;

  @Column({ type: 'varchar', length: 255 })
  competency: string;

  @Column({
    type: 'enum',
    enum: CompetencyLevel,
  })
  level: CompetencyLevel;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Student, (student) => student.evaluations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.evaluations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'evaluator' })
  evaluator_user: User;
}
