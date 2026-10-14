import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AttendanceSession,
  SessionType,
} from './entities/attendance-session.entity';
import {
  AttendanceRecord,
  AttendanceStatus,
} from './entities/attendance-record.entity';
import { Enrollment } from '../students/entities/enrollment.entity';

export class CreateAttendanceSessionDto {
  track_id: string;
  program_id: string;
  date: Date;
  session_type: SessionType;
}

export class CreateAttendanceRecordDto {
  session_id: string;
  student_id: string;
  enrollment_id: string;
  status: AttendanceStatus;
  note?: string;
}

export class BulkAttendanceDto {
  session_id: string;
  records: Array<{
    student_id: string;
    enrollment_id: string;
    status: AttendanceStatus;
    note?: string;
  }>;
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceSession)
    private sessionsRepository: Repository<AttendanceSession>,
    @InjectRepository(AttendanceRecord)
    private recordsRepository: Repository<AttendanceRecord>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
  ) {}

  async createSession(
    createSessionDto: CreateAttendanceSessionDto,
    userId: string,
  ): Promise<AttendanceSession> {
    const session = this.sessionsRepository.create({
      ...createSessionDto,
      created_by: userId,
    });

    return this.sessionsRepository.save(session);
  }

  async findSessions(
    page: number = 1,
    limit: number = 20,
    trackId?: string,
    date?: string,
  ): Promise<{ data: AttendanceSession[]; total: number; page: number }> {
    const query = this.sessionsRepository.createQueryBuilder('session');

    if (trackId) {
      query.andWhere('session.track_id = :trackId', { trackId });
    }

    if (date) {
      query.andWhere('session.date = :date', { date });
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .leftJoinAndSelect('session.records', 'records')
      .getMany();

    return { data, total, page };
  }

  async recordAttendance(
    createRecordDto: CreateAttendanceRecordDto,
    userId: string,
  ): Promise<AttendanceRecord> {
    const [session, enrollment] = await Promise.all([
      this.sessionsRepository.findOne({
        where: { id: createRecordDto.session_id },
      }),
      this.enrollmentsRepository.findOne({
        where: { id: createRecordDto.enrollment_id },
      }),
    ]);

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const record = this.recordsRepository.create({
      ...createRecordDto,
      updated_by: userId,
    });

    return this.recordsRepository.save(record);
  }

  async bulkRecordAttendance(
    bulkDto: BulkAttendanceDto,
    userId: string,
  ): Promise<{ recorded: number; failed: number; errors: Array<{ student_id: string; error: string }> }> {
    const session = await this.sessionsRepository.findOne({
      where: { id: bulkDto.session_id },
    });

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    const results: { recorded: number; failed: number; errors: Array<{ student_id: string; error: string }> } = {
      recorded: 0,
      failed: 0,
      errors: [],
    };

    for (const record of bulkDto.records) {
      try {
        await this.recordAttendance(
          { session_id: bulkDto.session_id, ...record },
          userId,
        );
        results.recorded++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          student_id: record.student_id,
          error: error.message,
        });
      }
    }

    return results;
  }

  async getAttendanceRecords(
    sessionId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: AttendanceRecord[]; total: number; page: number }> {
    const query = this.recordsRepository.createQueryBuilder('record');
    query.andWhere('record.session_id = :sessionId', { sessionId });

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .leftJoinAndSelect('record.student', 'student')
      .getMany();

    return { data, total, page };
  }
}
