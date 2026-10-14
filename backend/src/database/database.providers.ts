import { DataSource } from 'typeorm';
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

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
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
        synchronize: configService.get('DATABASE_SYNCHRONIZE') === 'true',
        logging: configService.get('DATABASE_LOGGING') === 'true',
        migrations: ['src/database/migrations/*.ts'],
      });

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
