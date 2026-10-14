import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade, AssessmentType } from './entities/grade.entity';
import { Evaluation, CompetencyLevel } from './entities/evaluation.entity';
import { Student } from '../students/entities/student.entity';
import { Enrollment } from '../students/entities/enrollment.entity';

export class CreateGradeDto {
  student_id: string;
  enrollment_id: string;
  subject: string;
  assessment_type: AssessmentType;
  score: number;
  max_score?: number;
  feedback?: string;
}

export class CreateEvaluationDto {
  student_id: string;
  enrollment_id: string;
  competency: string;
  level: CompetencyLevel;
  comments?: string;
}

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Evaluation)
    private evaluationsRepository: Repository<Evaluation>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
  ) {}

  async createGrade(
    createGradeDto: CreateGradeDto,
    userId: string,
  ): Promise<Grade> {
    const [student, enrollment] = await Promise.all([
      this.studentsRepository.findOne({
        where: { id: createGradeDto.student_id },
      }),
      this.enrollmentsRepository.findOne({
        where: { id: createGradeDto.enrollment_id },
      }),
    ]);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (createGradeDto.max_score && createGradeDto.score > createGradeDto.max_score) {
      throw new BadRequestException('Score cannot exceed max_score');
    }

    const grade = this.gradesRepository.create({
      ...createGradeDto,
      graded_by: userId,
    });

    return this.gradesRepository.save(grade);
  }

  async getStudentGrades(studentId: string): Promise<Grade[]> {
    return this.gradesRepository.find({
      where: { student_id: studentId },
      order: { created_at: 'DESC' },
    });
  }

  async getEnrollmentGrades(enrollmentId: string): Promise<Grade[]> {
    return this.gradesRepository.find({
      where: { enrollment_id: enrollmentId },
    });
  }

  async createEvaluation(
    createEvaluationDto: CreateEvaluationDto,
    userId: string,
  ): Promise<Evaluation> {
    const [student, enrollment] = await Promise.all([
      this.studentsRepository.findOne({
        where: { id: createEvaluationDto.student_id },
      }),
      this.enrollmentsRepository.findOne({
        where: { id: createEvaluationDto.enrollment_id },
      }),
    ]);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const evaluation = this.evaluationsRepository.create({
      ...createEvaluationDto,
      evaluator: userId,
    });

    return this.evaluationsRepository.save(evaluation);
  }

  async getStudentEvaluations(studentId: string): Promise<Evaluation[]> {
    return this.evaluationsRepository.find({
      where: { student_id: studentId },
    });
  }
}
