// src/app/dtos/auth.dto.ts
export interface LoginDto {
    email: string;
    password: string;
  }
  
  export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
  }
  