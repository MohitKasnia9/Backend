// import { JwtService } from '@nestjs/jwt';
// import { AuthGuard } from './auth.guard';
// import { TestingModule, Test } from '@nestjs/testing';
// import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';



// describe('AuthGuard', () => {
//   let authGuard: AuthGuard;
//   let jwtService: JwtService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthGuard,
//         {
//           provide: JwtService,
//           useValue: {
//             verify: jest.fn().mockReturnValue({ user: 'mockUser' }),  
//           },
//         },
//       ],
//     }).compile();

//     authGuard = module.get<AuthGuard>(AuthGuard);
//     jwtService = module.get<JwtService>(JwtService);
//   });

//   it('should be defined', () => {
//     expect(authGuard).toBeDefined();
//   });

//   describe('canActivate', () => {
//     let context: ExecutionContext;

//     beforeEach(() => {
//       context = {
//         switchToHttp: jest.fn().mockReturnValue({
//           getRequest: jest.fn().mockReturnValue({
//             headers: { authorization: 'Bearer mock-token' },
//           }),
//         }),
//       } as unknown as ExecutionContext;
//     });

//     it('should call the JwtService verify method', async () => {
//       await authGuard.canActivate(context);
//       expect(jwtService.verify).toHaveBeenCalledWith('mock-token');  
//     });

//     it('should return true if the token is valid', async () => {
//       const result = await authGuard.canActivate(context);
//       expect(result).toBe(true);  
//     });

//     it('should throw ForbiddenException if token is invalid', async () => {
//       jwtService.verify = jest.fn().mockImplementation(() => {
//         throw new UnauthorizedException('Invalid token');
//       });

//       try {
//         await authGuard.canActivate(context);
//       } catch (error) {
//         expect(error).toBeInstanceOf(UnauthorizedException);
//       }
//     });
//   });
// });


import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { jwtConstants } from '../../auth/constants';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;

  beforeEach(async () => {
    authGuard = new AuthGuard(null as any); // No need to mock JwtService if using jsonwebtoken.verify
  });

  const mockRequest = (token: string | null) => ({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });

  const mockExecutionContext = (token: string | null) =>
    ({
      switchToHttp: () => ({
        getRequest: () => mockRequest(token),
      }),
    } as unknown as ExecutionContext);

  it('should throw UnauthorizedException if no token is provided', async () => {
    await expect(authGuard.canActivate(mockExecutionContext(null))).rejects.toThrowError(
      new UnauthorizedException('No token provided'),
    );
  });

  it('should verify the token successfully when valid token is provided', async () => {
    const payload = { userId: 1, email: 'user@example.com' };
    jest.spyOn(jwt, 'verify').mockReturnValue(payload as any); // ✅ Mock jsonwebtoken.verify

    const result = await authGuard.canActivate(mockExecutionContext('validToken'));
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if the token is invalid', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(authGuard.canActivate(mockExecutionContext('invalidToken'))).rejects.toThrowError(
      new UnauthorizedException('Invalid token'),
    );
  });
});
