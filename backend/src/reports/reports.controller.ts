import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('track/:trackId/dashboard')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'instructor', 'admin')
  @ApiOperation({ summary: 'Get dashboard metrics for a track' })
  @ApiResponse({ status: 200, description: 'Track dashboard metrics' })
  async getTrackDashboard(@Param('trackId') trackId: string): Promise<any> {
    return this.reportsService.getTrackDashboard(trackId);
  }

  @Get('track/:trackId/attendance')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'student_affairs', 'admin')
  @ApiOperation({ summary: 'Get attendance report for a track' })
  @ApiResponse({ status: 200, description: 'Track attendance report' })
  async getAttendanceReport(
    @Param('trackId') trackId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.reportsService.getAttendanceReport(
      trackId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('enrollment/:enrollmentId/grades')
  @UseGuards(JwtGuard)
  @ApiTags('Reports', 'Grades')
  @ApiOperation({ summary: 'Get grade report for an enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment grade report' })
  async getGradeReport(@Param('enrollmentId') enrollmentId: string): Promise<any> {
    return this.reportsService.getGradeReport(enrollmentId);
  }

  @Get('program/:programId/metrics')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'admin')
  @ApiOperation({ summary: 'Get program metrics' })
  @ApiResponse({ status: 200, description: 'Program metrics report' })
  async getProgramMetrics(@Param('programId') programId: string): Promise<any> {
    return this.reportsService.getProgramMetrics(programId);
  }
}
