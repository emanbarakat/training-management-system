import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Program } from '../programs/entities/program.entity';
import { Track } from '../tracks/entities/track.entity';
import { TrackSupervisor } from '../tracks/entities/track-supervisor.entity';
import { Student } from '../students/entities/student.entity';
import { Enrollment } from '../students/entities/enrollment.entity';
import { AttendanceSession } from '../attendance/entities/attendance-session.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Evaluation } from '../grades/entities/evaluation.entity';
import { TrackKPI } from '../reports/entities/track-kpi.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'postgres'),
        database: configService.get('DATABASE_NAME', 'training_db'),
        entities: [
          User,
          Program,
          Track,
          TrackSupervisor,
          Student,
          Enrollment,
          AttendanceSession,
          AttendanceRecord,
          Grade,
          Evaluation,
          TrackKPI,
        ],
        synchronize: configService.get('DATABASE_SYNCHRONIZE', false),
        logging: configService.get('DATABASE_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
