import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    console.log('🔐 JWT Guard - Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      console.log('✅ JWT Guard - Payload:', payload);

      // Map 'sub' to 'id' for compatibility with @GetUser('id')
      request.user = {
        ...payload,
        id: payload.sub,
      };

      console.log('✅ JWT Guard - User set with id:', request.user.id);
    } catch (error) {
      console.log('❌ JWT Guard - Error:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
