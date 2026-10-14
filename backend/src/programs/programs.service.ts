import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Program, ProgramStatus, ProgramType } from './entities/program.entity';
import { Track } from '../tracks/entities/track.entity';

export class CreateProgramDto {
  @ApiProperty({ description: 'Name of the program' })
  name: string;

  @ApiProperty({ description: 'Description of the program', required: false })
  description?: string;

  @ApiProperty({ enum: ProgramType, description: 'Type of the program' })
  type: ProgramType;

  @ApiProperty({ description: 'Duration in months' })
  duration_months: number;

  @ApiProperty({ description: 'Start date', required: false })
  start_date?: Date;

  @ApiProperty({ description: 'End date', required: false })
  end_date?: Date;
}

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private programsRepository: Repository<Program>,
    @InjectRepository(Track)
    private tracksRepository: Repository<Track>,
  ) {}

  async create(
    createProgramDto: CreateProgramDto,
    userId: string,
  ): Promise<Program> {
    const program = this.programsRepository.create({
      ...createProgramDto,
      created_by: userId,
      status: ProgramStatus.DRAFT,
    });

    return this.programsRepository.save(program);
  }

  async findOne(id: string): Promise<Program> {
    const program = await this.programsRepository.findOne({
      where: { id },
      relations: ['tracks', 'tracks.supervisors'],
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return program;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    type?: ProgramType,
    status?: ProgramStatus,
  ): Promise<{ data: Program[]; total: number; page: number }> {
    const query = this.programsRepository.createQueryBuilder('program');

    if (type) {
      query.andWhere('program.type = :type', { type });
    }

    if (status) {
      query.andWhere('program.status = :status', { status });
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .leftJoinAndSelect('program.tracks', 'tracks')
      .getMany();

    return { data, total, page };
  }

  async update(id: string, updateData: Partial<Program>): Promise<Program> {
    await this.findOne(id);

    await this.programsRepository.update(id, updateData);

    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const program = await this.findOne(id);
    await this.programsRepository.remove(program);
  }

  async activateProgram(id: string): Promise<Program> {
    const program = await this.findOne(id);

    if (program.tracks.length === 0) {
      throw new BadRequestException(
        'Program must have at least one track before activation',
      );
    }

    return this.update(id, { status: ProgramStatus.ACTIVE });
  }

  async getTracksByProgram(programId: string): Promise<Track[]> {
    const program = await this.findOne(programId);
    return program.tracks;
  }
}
