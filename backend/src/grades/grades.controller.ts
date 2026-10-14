import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  GradesService,
  CreateGradeDto,
  CreateEvaluationDto,
} from './grades.service';
import { Grade } from './entities/grade.entity';
import { Evaluation } from './entities/evaluation.entity';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Grades')
@ApiBearerAuth('access-token')
@Controller('grades')
export class GradesController {
  constructor(private gradesService: GradesService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Create a new grade record' })
  @ApiResponse({ status: 201, description: 'Grade created successfully', type: Grade })
  async createGrade(
    @Body() createGradeDto: CreateGradeDto,
    @Request() req: any,
  ): Promise<Grade> {
    return this.gradesService.createGrade(createGradeDto, req.user.sub);
  }

  @Get('student/:studentId')
  @UseGuards(JwtGuard)
  @ApiTags('Grades', 'Student Grades')
  @ApiOperation({ summary: 'Retrieve grades for a student' })
  @ApiResponse({ status: 200, description: 'Student grade list', type: [Grade] })
  async getStudentGrades(@Param('studentId') studentId: string): Promise<Grade[]> {
    return this.gradesService.getStudentGrades(studentId);
  }

  @Get('enrollment/:enrollmentId')
  @UseGuards(JwtGuard)
  @ApiTags('Grades', 'Enrollment Grades')
  @ApiOperation({ summary: 'Retrieve grades for an enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment grade list', type: [Grade] })
  async getEnrollmentGrades(
    @Param('enrollmentId') enrollmentId: string,
  ): Promise<Grade[]> {
    return this.gradesService.getEnrollmentGrades(enrollmentId);
  }
}

@ApiTags('Evaluations')
@ApiBearerAuth('access-token')
@Controller('evaluations')
export class EvaluationsController {
  constructor(private gradesService: GradesService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Create a new evaluation record' })
  @ApiResponse({ status: 201, description: 'Evaluation created successfully', type: Evaluation })
  async createEvaluation(
    @Body() createEvaluationDto: CreateEvaluationDto,
    @Request() req: any,
  ): Promise<Evaluation> {
    return this.gradesService.createEvaluation(createEvaluationDto, req.user.sub);
  }

  @Get('student/:studentId')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Retrieve evaluations for a student' })
  @ApiResponse({ status: 200, description: 'Student evaluation list', type: [Evaluation] })
  async getStudentEvaluations(
    @Param('studentId') studentId: string,
  ): Promise<Evaluation[]> {
    return this.gradesService.getStudentEvaluations(studentId);
  }
}
