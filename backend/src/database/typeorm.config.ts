import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
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

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DATABASE_HOST', 'localhost'),
      port: this.configService.get('DATABASE_PORT', 5432),
      username: this.configService.get('DATABASE_USER', 'postgres'),
      password: this.configService.get('DATABASE_PASSWORD', 'password'),
      database: this.configService.get('DATABASE_NAME', 'training_db'),
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
      ],
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
      migrations: ['src/migrations/**/*{.ts,.js}'],
      migrationsRun: true,
    };
  }
}
