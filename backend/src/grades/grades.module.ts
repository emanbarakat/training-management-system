import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesService } from './grades.service';
import { GradesController, EvaluationsController } from './grades.controller';
import { Grade } from './entities/grade.entity';
import { Evaluation } from './entities/evaluation.entity';
import { Student } from '../students/entities/student.entity';
import { Enrollment } from '../students/entities/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grade, Evaluation, Student, Enrollment])],
  providers: [GradesService],
  controllers: [GradesController, EvaluationsController],
  exports: [GradesService],
})
export class GradesModule {}
