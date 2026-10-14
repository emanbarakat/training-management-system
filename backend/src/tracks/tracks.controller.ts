import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TracksService, CreateTrackDto, AssignSupervisorDto } from './tracks.service';
import { Track } from './entities/track.entity';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Tracks')
@ApiBearerAuth('access-token')
@Controller('tracks')
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'admin')
  @ApiOperation({ summary: 'Create a new track' })
  @ApiResponse({ status: 201, description: 'Track created successfully', type: Track })
  async create(@Body() createTrackDto: CreateTrackDto): Promise<Track> {
    return this.tracksService.create(createTrackDto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Retrieve tracks with optional filters' })
  @ApiResponse({ status: 200, description: 'List of tracks' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('program_id') programId?: string,
    @Query('status') status?: string,
  ): Promise<any> {
    return this.tracksService.findAll(page, limit, programId, status as any);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get a track by ID' })
  @ApiResponse({ status: 200, description: 'Track details', type: Track })
  @ApiResponse({ status: 404, description: 'Track not found' })
  async findOne(@Param('id') id: string): Promise<Track> {
    return this.tracksService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'admin')
  @ApiOperation({ summary: 'Update a track' })
  @ApiResponse({ status: 200, description: 'Track updated', type: Track })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Track>,
  ): Promise<Track> {
    return this.tracksService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'admin')
  @ApiOperation({ summary: 'Delete a track' })
  @ApiResponse({ status: 200, description: 'Track deleted' })
  async delete(@Param('id') id: string): Promise<any> {
    await this.tracksService.delete(id);
    return { message: 'Track deleted successfully' };
  }

  @Post(':id/supervisors')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'admin')
  @ApiTags('Tracks', 'Supervisors')
  @ApiOperation({ summary: 'Assign a supervisor to a track' })
  @ApiResponse({ status: 200, description: 'Supervisor assigned successfully' })
  async assignSupervisor(
    @Param('id') id: string,
    @Body() assignSupervisorDto: AssignSupervisorDto,
  ): Promise<any> {
    return this.tracksService.assignSupervisor(
      id,
      assignSupervisorDto.supervisor_id,
    );
  }

  @Delete(':id/supervisors/:supervisorId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'admin')
  @ApiTags('Tracks', 'Supervisors')
  @ApiOperation({ summary: 'Remove a supervisor from a track' })
  @ApiResponse({ status: 200, description: 'Supervisor removed successfully' })
  async removeSupervisor(
    @Param('id') id: string,
    @Param('supervisorId') supervisorId: string,
  ): Promise<any> {
    await this.tracksService.removeSupervisor(id, supervisorId);
    return { message: 'Supervisor removed successfully' };
  }
}
