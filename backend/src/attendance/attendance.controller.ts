import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AttendanceService,
  CreateAttendanceSessionDto,
  BulkAttendanceDto,
} from './attendance.service';
import { AttendanceSession } from './entities/attendance-session.entity';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Attendance')
@ApiBearerAuth('access-token')
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('sessions')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('student_affairs', 'admin')
  @ApiOperation({ summary: 'Create a new attendance session' })
  @ApiResponse({ status: 201, description: 'Attendance session created', type: AttendanceSession })
  async createSession(
    @Body() createSessionDto: CreateAttendanceSessionDto,
    @Request() req: any,
  ): Promise<AttendanceSession> {
    return this.attendanceService.createSession(createSessionDto, req.user.sub);
  }

  @Get('sessions')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'List attendance sessions' })
  @ApiResponse({ status: 200, description: 'Attendance sessions list' })
  async getSessions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('track_id') trackId?: string,
    @Query('date') date?: string,
  ): Promise<any> {
    return this.attendanceService.findSessions(page, limit, trackId, date);
  }

  @Post('records/bulk')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('student_affairs', 'admin')
  @ApiTags('Attendance', 'Records')
  @ApiOperation({ summary: 'Record attendance in bulk for a session' })
  @ApiResponse({ status: 200, description: 'Attendance records created' })
  async bulkRecord(
    @Body() bulkDto: BulkAttendanceDto,
    @Request() req: any,
  ): Promise<any> {
    return this.attendanceService.bulkRecordAttendance(bulkDto, req.user.sub);
  }

  @Get('sessions/:sessionId/records')
  @UseGuards(JwtGuard)
  @ApiTags('Attendance', 'Records')
  @ApiOperation({ summary: 'Get attendance records for a session' })
  @ApiResponse({ status: 200, description: 'List of attendance records' })
  async getRecords(
    @Param('sessionId') sessionId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ): Promise<any> {
    return this.attendanceService.getAttendanceRecords(sessionId, page, limit);
  }
}
