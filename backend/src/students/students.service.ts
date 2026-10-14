import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse';
import { Student, StudentStatus } from './entities/student.entity';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { Track } from '../tracks/entities/track.entity';

export class CreateStudentDto {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  date_of_birth?: Date;
}

export class CreateEnrollmentDto {
  student_id: string;
  track_id: string;
  instructor_id?: string;
  enrollment_date: Date;
}

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(Track)
    private tracksRepository: Repository<Track>,
  ) {}

  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const existingStudent = await this.studentsRepository.findOne({
      where: { email: createStudentDto.email },
    });

    if (existingStudent) {
      throw new BadRequestException('Student with this email already exists');
    }

    const student = this.studentsRepository.create(createStudentDto);
    return this.studentsRepository.save(student);
  }

  async findStudentById(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['enrollments', 'enrollments.track', 'enrollments.instructor'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async findAllStudents(
    page: number = 1,
    limit: number = 20,
    trackId?: string,
    status?: StudentStatus,
  ): Promise<{ data: Student[]; total: number; page: number }> {
    const query = this.studentsRepository.createQueryBuilder('student');

    if (trackId) {
      query
        .innerJoin('student.enrollments', 'enrollment')
        .andWhere('enrollment.track_id = :trackId', { trackId });
    }

    if (status) {
      query.andWhere('student.status = :status', { status });
    }

    const total = await query.getCount();
    const students = await query
      .leftJoinAndSelect('student.enrollments', 'enrollment')
      .leftJoinAndSelect('enrollment.track', 'track')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Add enrollmentDate to each student
    const data = students.map(student => ({
      ...student,
      enrollmentDate: student.enrollments?.[0]?.enrollment_date || null,
    }));

    return { data, total, page };
  }

  async enrollStudent(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const [student, track] = await Promise.all([
      this.studentsRepository.findOne({
        where: { id: createEnrollmentDto.student_id },
      }),
      this.tracksRepository.findOne({
        where: { id: createEnrollmentDto.track_id },
      }),
    ]);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    const existingEnrollment = await this.enrollmentsRepository.findOne({
      where: {
        student_id: createEnrollmentDto.student_id,
        track_id: createEnrollmentDto.track_id,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException(
        'Student is already enrolled in this track',
      );
    }

    const enrollment = this.enrollmentsRepository.create({
      ...createEnrollmentDto,
      status: EnrollmentStatus.ENROLLED,
    });

    return this.enrollmentsRepository.save(enrollment);
  }

  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { student_id: studentId },
      relations: ['track', 'track.program', 'instructor'],
    });
  }

  async updateEnrollmentStatus(
    enrollmentId: string,
    status: EnrollmentStatus,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.status = status;
    if (status === EnrollmentStatus.COMPLETED) {
      enrollment.completion_date = new Date();
    }

    return this.enrollmentsRepository.save(enrollment);
  }

  async bulkImportStudents(students: CreateStudentDto[]): Promise<{
    imported: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  }> {
    const results: { imported: number; failed: number; errors: Array<{ email: string; error: string }> } = {
      imported: 0,
      failed: 0,
      errors: [],
    };

    for (const studentData of students) {
      try {
        await this.createStudent(studentData);
        results.imported++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({ email: studentData.email, error: error.message });
      }
    }

    return results;
  }

  async importStudentsFromCSV(
    file: any,
    programId: string,
    trackId: string,
  ): Promise<{
    imported: number;
    failed: number;
    errors: Array<{ row: any; error: string }>;
    createdStudents: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      enrollmentId: string;
    }>;
  }> {
    const results: {
      imported: number;
      failed: number;
      errors: Array<{ row: any; error: string }>;
      createdStudents: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        enrollmentId: string;
      }>;
    } = {
      imported: 0,
      failed: 0,
      errors: [],
      createdStudents: [],
    };

    // Verify track exists
    const track = await this.tracksRepository.findOne({
      where: { id: trackId },
      relations: ['program'],
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    if (track.program.id !== programId) {
      throw new BadRequestException('Track does not belong to the specified program');
    }

    // Parse CSV
    const csvData: any[] = await new Promise((resolve, reject) => {
      parse(file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });

    // Process each row
    for (const row of csvData) {
      try {
        const studentData: CreateStudentDto = {
          email: row.email,
          first_name: row.first_name,
          last_name: row.last_name,
          phone: row.phone || undefined,
          address: row.address || undefined,
          city: row.city || undefined,
          country: row.country || undefined,
          date_of_birth: row.dob ? new Date(row.dob) : undefined,
        };

        // Validate required fields
        if (!studentData.email || !studentData.first_name || !studentData.last_name) {
          throw new BadRequestException('Missing required fields: email, first_name, last_name');
        }

        // Create student
        const student = await this.createStudent(studentData);

        // Create enrollment
        const enrollment = await this.enrollStudent({
          student_id: student.id,
          track_id: trackId,
          enrollment_date: new Date(),
        });

        results.imported++;
        results.createdStudents.push({
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          email: student.email,
          enrollmentId: enrollment.id,
        });
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: row,
          error: error.message,
        });
      }
    }

    return results;
  }
}
