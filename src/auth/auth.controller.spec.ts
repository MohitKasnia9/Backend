import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '../gaurd/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';  // Import JwtService
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
 
describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;
 
  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    dashboard: jest.fn(),
    getTable: jest.fn(),
    logout:jest.fn()
  };

  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  const mockJwtService = {
    sign: jest.fn(),
  };
 
  const mockAuthGuard = {
    canActivate: jest.fn().mockImplementation(() => true), // Always return true to bypass auth guard in tests
  };
  // beforeAll(() => {
  //   global.localStorage = {
  //     getItem: jest.fn(),
  //     setItem: jest.fn(),
  //     removeItem: jest.fn(),
  //     clear: jest.fn(),
  //   } as any;
  // });
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,  
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard,  
        },
      ],
    }).compile();
    
    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);  // Get JwtService from the module
  });
 
  it('should be defined', () => {
    expect(authController).toBeDefined();
  });
 
  describe('signup', () => {
    it('should call authService.signup and return response', async () => {
      const signupDto: SignupDto = {
        firstname: 'John', 
        lastname: 'Doe', 
        email: 'john@example.com', 
        username: 'johndoe', 
        password: 'password', 
        country_code: '+1', 
        mobile_number: '1234567890' 
      };
 
      mockAuthService.signup.mockResolvedValue({ message: 'User Registered Successfully' });
 
      const result = await authController.signup(signupDto);
 
      expect(result).toEqual({ message: 'User Registered Successfully' });
      expect(mockAuthService.signup).toHaveBeenCalledWith(signupDto);
    });
  });
 
  describe('login', () => {
    it('should call authService.login and return access token', async () => {
      const loginDto: LoginDto = {
        email: 'john.doe@example.com',
        password: 'Password123',
      };
 
      mockAuthService.login.mockResolvedValue({
        message: 'User Logged In Successfully',
        access_token: 'mocked.jwt.token',
      });
 
      const result = await authController.login(loginDto);
 
      expect(result).toEqual({
        message: 'User Logged In Successfully',
        access_token: 'mocked.jwt.token',
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  
  describe('dashboard', () => {
    it('should call authService.dashboard and return user data', async () => {
      
      
      
      const mockUserData = [
        {
          firstname: 'John', 
          lastname: 'Doe', 
          email: 'john@example.com', 
          username: 'johndoe', 
          country_code: '+1', 
          mobile_number: '1234567890' 
        },        
      ];
 
      mockAuthService.getTable.mockResolvedValue(mockUserData);
 
      const result = await authController.dashboard();
 
      expect(result).toEqual(mockUserData);
      expect(mockAuthService.getTable).toHaveBeenCalled();
    });
  });


  describe('logout',()=>{
    
    it('should remove item from local storage on logout',async ()=>{
      localStorageMock.setItem('token','mocktoken');
      const result=await localStorageMock.clear();
      mockAuthService.logout.mockResolvedValue({
        message :'Logout Successful'
      });

      expect(localStorageMock.getItem('token')).toBeNull();

      const res=await authController.logout();
      await expect(mockAuthService.logout()).resolves.toEqual({ message: 'Logout Successful' });
    
    })
  })
 
 
});
 

