import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceSession } from './entities/attendance-session.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { Enrollment } from '../students/entities/enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceSession, AttendanceRecord, Enrollment]),
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController],
  exports: [AttendanceService],
})
export class AttendanceModule {}
