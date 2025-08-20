import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsDateString, MinLength } from "class-validator";

export class CreateSprintDto {
  @ApiProperty({ example: "Sprint 1" })
  @IsString({ message: "Sprint name must be a string" })
  @MinLength(2, { message: "Sprint name must be at least 2 characters" })
  name: string;

  @ApiPropertyOptional({ example: "Complete authentication module" })
  @IsOptional()
  @IsString({ message: "Goal must be a string" })
  goal?: string;

  @ApiProperty({ example: "2025-09-01T00:00:00.000Z" })
  @IsDateString({}, { message: "Start date must be a valid ISO date string" })
  startDate: string;

  @ApiProperty({ example: "2025-09-15T00:00:00.000Z" })
  @IsDateString({}, { message: "End date must be a valid ISO date string" })
  endDate: string;

  @ApiProperty({ example: "project-uuid" })
  @IsString({ message: "Project ID must be a string" })
  projectId: string;
}

export class UpdateSprintDto {
  @ApiPropertyOptional({ example: "Sprint 1 Updated" })
  @IsOptional()
  @IsString({ message: "Sprint name must be a string" })
  @MinLength(2, { message: "Sprint name must be at least 2 characters" })
  name?: string;

  @ApiPropertyOptional({ example: "Updated goal" })
  @IsOptional()
  @IsString({ message: "Goal must be a string" })
  goal?: string;

  @ApiPropertyOptional({ example: "2025-09-02T00:00:00.000Z" })
  @IsOptional()
  @IsDateString({}, { message: "Start date must be a valid ISO date string" })
  startDate?: string;

  @ApiPropertyOptional({ example: "2025-09-16T00:00:00.000Z" })
  @IsOptional()
  @IsDateString({}, { message: "End date must be a valid ISO date string" })
  endDate?: string;
}