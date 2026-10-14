import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  StudentsService,
  CreateStudentDto,
  CreateEnrollmentDto,
} from './students.service';
import { Student } from './entities/student.entity';
import { Enrollment } from './entities/enrollment.entity';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Students')
@ApiBearerAuth('access-token')
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('student_affairs', 'admin')
  @ApiOperation({ summary: 'Create a new student record' })
  @ApiResponse({ status: 201, description: 'Student created successfully', type: Student })
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<Student> {
    return this.studentsService.createStudent(createStudentDto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Retrieve student list with optional filters' })
  @ApiResponse({ status: 200, description: 'List of students' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('track_id') trackId?: string,
    @Query('status') status?: string,
  ): Promise<any> {
    return this.studentsService.findAllStudents(page, limit, trackId, status as any);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiResponse({ status: 200, description: 'Student details', type: Student })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findOne(@Param('id') id: string): Promise<Student> {
    return this.studentsService.findStudentById(id);
  }

  @Post('/:id/enroll')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('student_affairs', 'admin')
  @ApiTags('Students', 'Enrollments')
  @ApiOperation({ summary: 'Enroll a student in a program track' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully', type: Enrollment })
  async enrollStudent(
    @Param('id') studentId: string,
    @Body() enrollmentDto: Omit<CreateEnrollmentDto, 'student_id'>,
  ): Promise<Enrollment> {
    return this.studentsService.enrollStudent({
      student_id: studentId,
      ...enrollmentDto,
    });
  }

  @Get(':id/enrollments')
  @UseGuards(JwtGuard)
  @ApiTags('Students', 'Enrollments')
  @ApiOperation({ summary: 'Get enrollments for a student' })
  @ApiResponse({ status: 200, description: 'Student enrollment records', type: [Enrollment] })
  async getEnrollments(@Param('id') id: string): Promise<Enrollment[]> {
    return this.studentsService.getStudentEnrollments(id);
  }

  @Post('import')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('student_affairs', 'admin')
  @ApiTags('Students', 'Imports')
  @ApiOperation({ summary: 'Import students from a CSV file' })
  @ApiResponse({ status: 200, description: 'Students imported successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(
    @UploadedFile() file: any,
    @Body() body: { programId: string; trackId: string },
  ): Promise<any> {
    return this.studentsService.importStudentsFromCSV(file, body.programId, body.trackId);
  }
}
