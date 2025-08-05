import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateUserDto {
  @ApiProperty({ example: "John Doe" })
  @IsString({ message: "Name must be a string" })
  @MinLength(2, { message: "Name must be at least 2 characters" })
  name: string;

  @ApiProperty({ example: "john@example.com" })
  @IsEmail({}, { message: "Invalid email address" })
  email: string;

  @ApiProperty({ example: "password123" })
  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;

  @ApiProperty({ example: "Acme Corp" })
  @IsString({ message: "Company name must be a string" })
  @MinLength(2, { message: "Company name must be at least 2 characters" })
  companyName: string;
}
