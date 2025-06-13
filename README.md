## 🖊️ 리포지토리 개요
이 리포지토리는 세션 방식의 로그인과 회원가입을 Nest js로 구현한 프로젝트 리포지토리 입니다.


## 🛠️ 기술 스택 (Tech Stack)  
Backend Framework
- NestJS
 
Database
- PostgreSQL
- TypeORM
 
Authentication & Security
- bcrypt
- crypto

Validation & Transformation
- class-validator
- class-transformer

Redis (세션 관리 등)
- ioredis

기타
- TypeScript
- Nest CLI & Build

## 🗒️ 구현된 기능
- 회원가입
- 로그인
- 단일 기기 로그인 정책(계정당 1개의 세션만 가능하도록)
- 클라이언트 요청에 대해 봇 감지 기능 추가

## 📅 구현중인 기능
- 로그아웃
- 회원 정보 수정
- 법인 회원 가입 기능 (多 회원 종류 구현)
