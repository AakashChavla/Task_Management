import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsEnum,
  ValidateNested,
  MinLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER',
}

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Company name' })
  @IsString({ message: 'Company name must be a string' })
  @MinLength(2, { message: 'Company name must be at least 2 characters' })
  companyName: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @ApiProperty({ example: 'akash.cilans+test@gmail.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 6 characters)',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'isApproved must be a boolean' })
  isApproved?: boolean;

  @ApiPropertyOptional({ enum: Role, example: Role.MANAGER })
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be ADMIN, USER, or MANAGER' })
  role?: Role;

  @ApiProperty({ type: CreateCompanyDto })
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  company: CreateCompanyDto;
}

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 6 characters)',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  oldPassword: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 6 characters)',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  newPassword: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 6 characters)',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  confirmPassword: string;
}
