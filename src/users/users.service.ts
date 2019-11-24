import { Injectable, Inject } from '@nestjs/common';
import { Repository, Equal } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, verify } from 'argon2';
import { AuthRegisterDto } from '../auth/auth.register.dto';
import { Profile } from './profile.entity';
import { EditUserInput } from './edit.user.input';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}
  async getAll(): Promise<User[]> {
    return await this.usersRepository.find({
      relations: ['reviews', 'profile', 'profile.rank'],
    });
  }

  async findById(id: number) {
    return await this.usersRepository.findOne(id, {
      relations: ['reviews', 'profile', 'profile.rank'],
    });
  }

  async createUser(createUserDto: AuthRegisterDto) {
    const password = await this.hashPassword(createUserDto.password);
    const profile = await this.profileRepository.create();
    await this.profileRepository.save(profile);
    console.log(profile);
    const user = this.usersRepository.create({
      username: createUserDto.username,
      password,
      mail: createUserDto.email,
    });
    return await this.usersRepository.save(user);
  }

  async findByUsername(username: string) {
    return await this.usersRepository.findOne({ where: { username } });
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password);
  }

  async verifyUser(user: User, password: string): Promise<boolean> {
    return await verify(user.password, password);
  }

  async editUser(userId: number, editUserInput: EditUserInput) {
    const user = await this.usersRepository.findOne(userId, {
      relations: ['profile'],
    });
    const profile = await this.profileRepository.findOne(user.profile.id);
    Object.assign(profile, editUserInput);
    await this.profileRepository.update(user.profile.id, profile);
    user.profile = profile;
    user.avatarUrl = editUserInput.photoUrl;
    user.country = editUserInput.country;
    await this.usersRepository.update(userId, user);
    return user;
  }
}
