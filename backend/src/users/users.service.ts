import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmail(email);
  }

  create(email: string, passwordHash: string): Promise<UserDocument> {
    return this.usersRepository.create(email, passwordHash);
  }
}
