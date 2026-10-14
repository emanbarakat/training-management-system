import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgramsModule } from './programs/programs.module';
import { TracksModule } from './tracks/tracks.module';
import { StudentsModule } from './students/students.module';
import { AttendanceModule } from './attendance/attendance.module';
import { GradesModule } from './grades/grades.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProgramsModule,
    TracksModule,
    StudentsModule,
    AttendanceModule,
    GradesModule,
    ReportsModule,
  ],
})
export class AppModule {}
