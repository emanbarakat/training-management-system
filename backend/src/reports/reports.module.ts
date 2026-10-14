import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Track } from '../tracks/entities/track.entity';
import { TrackKPI } from './entities/track-kpi.entity';
import { Enrollment } from '../students/entities/enrollment.entity';
import { Grade } from '../grades/entities/grade.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Track,
      TrackKPI,
      Enrollment,
      Grade,
      AttendanceRecord,
    ]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
