// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { JwtStrategy } from 'passport-jwt';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secretKey', // Use an environment variable for security
    });
  }

  async validate(payload: any) {
    // This function will be called when the token is verified
    return { username: payload.username, email: payload.email };
  }
}
