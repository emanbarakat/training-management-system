import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { Track } from './entities/track.entity';
import { TrackSupervisor } from './entities/track-supervisor.entity';
import { Program } from '../programs/entities/program.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Track, TrackSupervisor, Program])],
  providers: [TracksService],
  controllers: [TracksController],
  exports: [TracksService],
})
export class TracksModule {}
