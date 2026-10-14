import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track, TrackStatus } from './entities/track.entity';
import { TrackSupervisor } from './entities/track-supervisor.entity';
import { Program } from '../programs/entities/program.entity';

export class CreateTrackDto {
  program_id: string;
  name: string;
  description?: string;
  curriculum_outline?: string;
  start_date?: Date;
  end_date?: Date;
}

export class AssignSupervisorDto {
  supervisor_id: string;
}

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private tracksRepository: Repository<Track>,
    @InjectRepository(TrackSupervisor)
    private supervisorsRepository: Repository<TrackSupervisor>,
    @InjectRepository(Program)
    private programsRepository: Repository<Program>,
  ) {}

  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    const program = await this.programsRepository.findOne({
      where: { id: createTrackDto.program_id },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const track = this.tracksRepository.create({
      ...createTrackDto,
      status: TrackStatus.ACTIVE,
    });

    return this.tracksRepository.save(track);
  }

  async findOne(id: string): Promise<Track> {
    const track = await this.tracksRepository.findOne({
      where: { id },
      relations: ['supervisors', 'supervisors.supervisor', 'enrollments'],
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return track;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    programId?: string,
    status?: TrackStatus,
  ): Promise<{ data: Track[]; total: number; page: number }> {
    const query = this.tracksRepository.createQueryBuilder('track');

    if (programId) {
      query.andWhere('track.program_id = :programId', { programId });
    }

    if (status) {
      query.andWhere('track.status = :status', { status });
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .leftJoinAndSelect('track.supervisors', 'supervisors')
      .getMany();

    return { data, total, page };
  }

  async update(id: string, updateData: Partial<Track>): Promise<Track> {
    await this.findOne(id);
    await this.tracksRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const track = await this.findOne(id);
    await this.tracksRepository.remove(track);
  }

  async assignSupervisor(
    trackId: string,
    supervisorId: string,
    assignedBy?: string,
  ): Promise<TrackSupervisor> {
    const track = await this.findOne(trackId);

    const existingSupervisor = await this.supervisorsRepository.findOne({
      where: { track_id: trackId, supervisor_id: supervisorId },
    });

    if (existingSupervisor) {
      throw new BadRequestException(
        'Supervisor already assigned to this track',
      );
    }

    const supervisor = this.supervisorsRepository.create({
      track_id: trackId,
      supervisor_id: supervisorId,
      assigned_by: assignedBy,
    });

    return this.supervisorsRepository.save(supervisor);
  }

  async removeSupervisor(trackId: string, supervisorId: string): Promise<void> {
    const supervisor = await this.supervisorsRepository.findOne({
      where: { track_id: trackId, supervisor_id: supervisorId },
    });

    if (!supervisor) {
      throw new NotFoundException('Supervisor assignment not found');
    }

    await this.supervisorsRepository.remove(supervisor);
  }
}
