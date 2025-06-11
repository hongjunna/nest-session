import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class BotDetectionGuard implements CanActivate {
  private readonly logger: Logger = new Logger(BotDetectionGuard.name);
  constructor() {}
  canActivate(context: ExecutionContext): boolean {
    const requestHeader = context.switchToHttp().getRequest();
    const headerScore = this.getBotScoreFromHeader(requestHeader);
    return this.checkBelowBotThreshold(headerScore);
  }

  private getBotScoreFromHeader(clientRequest: any): number {
    const botScore = clientRequest.headers['x-bot-score'];
    if (!botScore) {
      this.logger.error(`[BotDetection] No bot score header found.`);
      this.throwManyRequestsException();
    }
    const headerScore = parseFloat(botScore);
    return headerScore;
  }

  private checkBelowBotThreshold(headerScore: number): boolean {
    const botScoreThreshold = 30;
    if (headerScore > botScoreThreshold) {
      this.logger.warn(
        `[BotDetection] Blocked request with score: ${headerScore}`,
      );
      this.throwManyRequestsException();
    }
    this.logger.log(
      `[BotDetection] Bot check passed with score : ${headerScore}`,
    );
    return true;
  }

  private throwManyRequestsException() {
    throw new HttpException(
      {
        status: 429,
        error: 'Too Many Requests',
        message:
          '서비스 요청량이 많아 일시적으로 접근이 차단되었습니다. 잠시 후 다시 시도해 주시기 바랍니다. 이용에 불편을 드려 죄송합니다.',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
