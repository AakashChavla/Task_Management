import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, MinLength } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({ example: "My Project" })
  @IsString({ message: "Project name must be a string" })
  @MinLength(2, { message: "Project name must be at least 2 characters" })
  name: string;

  @ApiPropertyOptional({ example: "Project description" })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: "Updated Project Name" })
  @IsOptional()
  @IsString({ message: "Project name must be a string" })
  @MinLength(2, { message: "Project name must be at least 2 characters" })
  name?: string;

  @ApiPropertyOptional({ example: "Updated description" })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string;
}