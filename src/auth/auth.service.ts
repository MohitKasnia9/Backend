import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async signup(signupDto: SignupDto): Promise<{ message: string }> {
    const { email, username, password, ...otherDetails } = signupDto;

    const emailExists = await this.userRepository.findOne({ where: { email } });
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    const usernameExists = await this.userRepository.findOne({ where: { username } });
    if (usernameExists) {
      throw new ConflictException('Username already exists');
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

  async login(loginDto: LoginDto): Promise<{ message: string , access_token: string}> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email };

    return { message: 'Login successful', access_token: await this.jwtService.signAsync(payload)};
  }

  async logout(): Promise<{ message: string }> {
    
    localStorage.clear();

    return { message: 'Logout successful' };
  }

  async getProfile(session: Record<string, any>): Promise<{ id: number; username: string; email: string }> {
    if (!session.user) {
      throw new BadRequestException('No active session');
    }
    return session.user;
  }
  async getTable(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id','firstname' ,'lastname','username', 'email', 'country_code','mobile_number'],  // Specify the columns you want
    });

    
  }

  
}
