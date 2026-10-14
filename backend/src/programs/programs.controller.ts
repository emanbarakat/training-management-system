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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProgramsService, CreateProgramDto } from './programs.service';
import { Program } from './entities/program.entity';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Programs')
@ApiBearerAuth('access-token')
@Controller('programs')
export class ProgramsController {
  constructor(private programsService: ProgramsService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'admin')
  @ApiOperation({ summary: 'Create a new program' })
  @ApiResponse({ status: 201, description: 'Program created successfully', type: Program })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createProgramDto: CreateProgramDto,
    @Request() req: any,
  ): Promise<Program> {
    return this.programsService.create(createProgramDto, req.user.sub);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get all programs' })
  @ApiResponse({ status: 200, description: 'List of programs' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<any> {
    return this.programsService.findAll(page, limit, type as any, status as any);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get a program by ID' })
  @ApiResponse({ status: 200, description: 'Program details', type: Program })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async findOne(@Param('id') id: string): Promise<Program> {
    return this.programsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'admin')
  @ApiOperation({ summary: 'Update a program' })
  @ApiResponse({ status: 200, description: 'Program updated', type: Program })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Program>,
  ): Promise<Program> {
    return this.programsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'admin')
  @ApiOperation({ summary: 'Delete a program' })
  @ApiResponse({ status: 200, description: 'Program deleted' })
  async delete(@Param('id') id: string): Promise<any> {
    await this.programsService.delete(id);
    return { message: 'Program deleted successfully' };
  }

  @Post(':id/activate')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('training_manager', 'admin')
  @ApiOperation({ summary: 'Activate a program' })
  @ApiResponse({ status: 200, description: 'Program activated', type: Program })
  async activate(@Param('id') id: string): Promise<Program> {
    return this.programsService.activateProgram(id);
  }

  @Get(':id/tracks')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get tracks for a program' })
  @ApiResponse({ status: 200, description: 'List of tracks' })
  async getTracks(@Param('id') id: string): Promise<any> {
    return this.programsService.getTracksByProgram(id);
  }
}
