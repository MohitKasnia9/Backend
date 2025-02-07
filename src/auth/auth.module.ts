import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { JwtAuthStrategy } from './jwt.strategy'; // Import JWT Strategy
import { jwtConstants } from './constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: jwtConstants.secret, // use environment variable for better security
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtAuthStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
