import {
  Controller,
  Post,
  Body,
  Session,
  Get,
  HttpCode,
  UseGuards
} from '@nestjs/common';
// import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import { AuthGuard } from '../gaurd/auth/auth.guard';
import { AuthService } from './../auth/auth.service';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(201)
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(200)
  async logout() {
    return this.authService.logout();
  }

  
  // @Get('profile')
  // @HttpCode(200)
  // async getProfile(@Session() session: Record<string, any>) {
  //   return this.authService.getProfile(session);
  // }

  @UseGuards(AuthGuard)
  @Get('dashboard')
  async dashboard(): Promise<User[]> {
    return this.authService.getTable();
  }


}
