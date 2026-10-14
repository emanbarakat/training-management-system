import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from '../tracks/entities/track.entity';
import { TrackKPI } from './entities/track-kpi.entity';
import { Enrollment } from '../students/entities/enrollment.entity';
import { Grade } from '../grades/entities/grade.entity';
import { AttendanceRecord, AttendanceStatus } from '../attendance/entities/attendance-record.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Track)
    private tracksRepository: Repository<Track>,
    @InjectRepository(TrackKPI)
    private kpisRepository: Repository<TrackKPI>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(AttendanceRecord)
    private attendanceRepository: Repository<AttendanceRecord>,
  ) {}

  async getTrackDashboard(trackId: string): Promise<any> {
    const track = await this.tracksRepository.findOne({
      where: { id: trackId },
      relations: ['enrollments', 'kpis'],
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    const enrollmentCount = track.enrollments.length;
    const completedCount = track.enrollments.filter(
      (e) => e.status === 'completed',
    ).length;
    const activeCount = track.enrollments.filter(
      (e) => e.status === 'active',
    ).length;

    return {
      track_id: trackId,
      track_name: track.name,
      total_enrollments: enrollmentCount,
      completed: completedCount,
      active: activeCount,
      completion_rate: enrollmentCount > 0 ? (completedCount / enrollmentCount) * 100 : 0,
      kpis: track.kpis,
    };
  }

  async getAttendanceReport(
    trackId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const attendanceRecords = await this.attendanceRepository
      .createQueryBuilder('record')
      .innerJoinAndSelect('record.session', 'session')
      .innerJoinAndSelect('record.student', 'student')
      .where('session.track_id = :trackId', { trackId })
      .andWhere('session.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();

    const summary = {
      total_records: attendanceRecords.length,
      present: attendanceRecords.filter((r) => r.status === AttendanceStatus.PRESENT)
        .length,
      absent: attendanceRecords.filter((r) => r.status === AttendanceStatus.ABSENT)
        .length,
      late: attendanceRecords.filter((r) => r.status === AttendanceStatus.LATE)
        .length,
      signed_out: attendanceRecords.filter(
        (r) => r.status === AttendanceStatus.SIGNED_OUT,
      ).length,
      attendance_percentage:
        attendanceRecords.length > 0
          ? (attendanceRecords.filter((r) => r.status === AttendanceStatus.PRESENT)
              .length / attendanceRecords.length) *
            100
          : 0,
    };

    return { summary, records: attendanceRecords };
  }

  async getGradeReport(enrollmentId: string): Promise<any> {
    const grades = await this.gradesRepository.find({
      where: { enrollment_id: enrollmentId },
      relations: ['student'],
    });

    if (grades.length === 0) {
      return { enrollment_id: enrollmentId, grades: [], average: 0 };
    }

    const average = grades.reduce((sum, g) => sum + g.score, 0) / grades.length;

    return {
      enrollment_id: enrollmentId,
      total_grades: grades.length,
      average_score: average,
      grades,
    };
  }

  async getProgramMetrics(programId: string): Promise<any> {
    const tracks = await this.tracksRepository.find({
      where: { program_id: programId },
      relations: ['enrollments', 'kpis'],
    });

    const totalStudents = tracks.reduce((sum, t) => sum + t.enrollments.length, 0);
    const completedStudents = tracks.reduce(
      (sum, t) =>
        sum + t.enrollments.filter((e) => e.status === 'completed').length,
      0,
    );

    return {
      program_id: programId,
      total_tracks: tracks.length,
      total_students: totalStudents,
      completed_students: completedStudents,
      completion_rate:
        totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0,
      tracks_overview: tracks.map((t) => ({
        track_id: t.id,
        track_name: t.name,
        enrollment_count: t.enrollments.length,
        kpis: t.kpis,
      })),
    };
  }
}
