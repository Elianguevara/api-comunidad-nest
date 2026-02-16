import { IsEmail, IsNotEmpty, IsString, IsIn } from 'class-validator';

// Equivalente a RegisterRequest.java
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // Forzamos a que solo acepte estos dos roles como en tu comentario de Java
  @IsString()
  @IsIn(['PROVIDER', 'CUSTOMER'])
  role: string;
}

// Equivalente a AuthenticationRequest.java
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

// Equivalente a AuthenticationResponse.java
export class AuthResponseDto {
  token: string;
  role: string;
  name: string;
  email: string;
}