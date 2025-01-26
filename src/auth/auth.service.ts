import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async signup(signupDto: SignupDto): Promise<{ message: string }> {
        const { email, username, password, ...otherDetails } = signupDto;

        const emailExists = await this.userRepository.findOne({ where: { email } });
        if (emailExists) {
            throw new ConflictException({
                field: 'email',
                message: 'Email already exists',
            });
        }

        const usernameExists = await this.userRepository.findOne({ where: { username } });
        if (usernameExists) {
            throw new ConflictException({
                field: 'username',
                message: 'Username already exists',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.userRepository.create({
            ...otherDetails,
            email,
            username,
            password: hashedPassword,
        });

        await this.userRepository.save(user);

        return { message: 'User Registered Successfully' };
    }
}
