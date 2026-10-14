import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Track } from '../../tracks/entities/track.entity';

export enum KPIType {
  PROJECT_COMPLETION = 'project_completion',
  JOB_PLACEMENT = 'job_placement',
  CERTIFICATE_ISSUANCE = 'certificate_issuance',
}

@Entity('track_kpis')
@Index(['track_id'])
@Index(['kpi_type'])
export class TrackKPI {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  track_id: string;

  @Column({
    type: 'enum',
    enum: KPIType,
  })
  kpi_type: KPIType;

  @Column({ type: 'integer', default: 0 })
  target: number;

  @Column({ type: 'integer', default: 0 })
  achieved: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  percentage: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Track, (track) => track.kpis, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'track_id' })
  track: Track;
}
