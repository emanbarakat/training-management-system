import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Track } from '../tracks/entities/track.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Enrollment, Track])],
  providers: [StudentsService],
  controllers: [StudentsController],
  exports: [StudentsService],
})
export class StudentsModule {}
