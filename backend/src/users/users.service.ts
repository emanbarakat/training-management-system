import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../auth/dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await this.authService.hashPassword(
      createUserDto.password,
    );

    const user = this.usersRepository.create({
      email: createUserDto.email,
      password_hash: hashedPassword,
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      phone: createUserDto.phone,
      role: createUserDto.role as UserRole,
      status: UserStatus.ACTIVE,
    });

    return this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    role?: string,
    status?: string,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const query = this.usersRepository.createQueryBuilder('user');

    if (role) query.andWhere('user.role = :role', { role });
    if (status) query.andWhere('user.status = :status', { status });

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.findOne(id);
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.authService.verifyPassword(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    return user;
  }
}
