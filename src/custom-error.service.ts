import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class CustomError {
  /**
   * 500에러 던질때 쓰십쇼
   * @param action - 에러가 발생한 액션의 이름 (예: '회원가입', '로그인' 등).
   * @returns never - 이 메서드는 항상 예외를 던지므로 반환하지 않습니다.
   */
  internalserverException(action: string): never {
    throw new HttpException(
      {
        status: 500,
        error: 'Internal Server Error',
        message: `${action} 중 오류가 발생했습니다. 이용에 불편을 드려 죄송합니다. 잠시 후 다시 이용해 주시거나 관리자에게 문의해 주시기 바랍니다.`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
