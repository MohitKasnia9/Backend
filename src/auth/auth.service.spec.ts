import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
  };

  const mockSignupDto: SignupDto = {
   
    email: 'test@example.com',
      password: 'validPass123', 
      firstname: 'John',
      lastname: 'Doe',
      username: 'johndoe',
      country_code: '+91',
      mobile_number: '9876543210',

  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully register a user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.create.mockReturnValue(mockSignupDto);
      mockUserRepository.save.mockResolvedValue(mockSignupDto);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');

      const result = await authService.signup(mockSignupDto);

      expect(result).toEqual({ message: 'User Registered Successfully' });
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      await expect(authService.signup(mockSignupDto)).rejects.toThrow(
        new ConflictException({ field: 'email', message: 'Email already exists' }),
      );
    });

    it('should throw ConflictException if username exists', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      await expect(authService.signup(mockSignupDto)).rejects.toThrow(
        new ConflictException({ field: 'username', message: 'Username already exists' }),
      );
    });
  });

  describe('login', () => {
    it('should successfully log in a user and return access token', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      mockJwtService.signAsync.mockResolvedValue('mockedAccessToken');

      const result = await authService.login(mockLoginDto);

      expect(result).toEqual({
        message: 'Login successful',
        access_token: 'mockedAccessToken',
      });
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        new NotFoundException({ field: 'email', message: 'Invalid credentials' }),
      );
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        new BadRequestException({ field: 'password', message: 'Invalid credentials' }),
      );
    });
  });

  describe('getTable', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { firstname: 'John', lastname: 'Doe', username: 'johndoe', email: 'john@example.com', mobile_number: '12345' },
      ];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await authService.getTable();

      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalled();
    });

    it('should throw an error if unable to fetch users', async () => {
      mockUserRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(authService.getTable()).rejects.toThrow('Database error');
    });
  });
});
