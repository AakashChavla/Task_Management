import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum, IsInt, Min } from "class-validator";
import { Status, Priority, TaskType } from "@prisma/client";

export class CreateTaskDto {
  @ApiProperty({ example: "Implement login" })
  @IsString({ message: "Title must be a string" })
  title: string;

  @ApiPropertyOptional({ example: "Implement JWT login for users" })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string;

  @ApiPropertyOptional({ enum: TaskType, default: "TASK" })
  @IsOptional()
  @IsEnum(TaskType, { message: "Type must be a valid TaskType" })
  type?: TaskType = "TASK";

  @ApiPropertyOptional({ enum: Status, default: "TODO" })
  @IsOptional()
  @IsEnum(Status, { message: "Status must be a valid Status" })
  status?: Status = "TODO";

  @ApiPropertyOptional({ enum: Priority, default: "MEDIUM" })
  @IsOptional()
  @IsEnum(Priority, { message: "Priority must be a valid Priority" })
  priority?: Priority = "MEDIUM";

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt({ message: "Story points must be an integer" })
  @Min(1, { message: "Story points must be at least 1" })
  storyPoints?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt({ message: "Estimate must be an integer" })
  @Min(0, { message: "Estimate must be at least 0" })
  estimate?: number;

  @ApiPropertyOptional({ example: "2025-08-10T12:00:00.000Z" })
  @IsOptional()
  @IsString({ message: "Due date must be a string" })
  dueDate?: string;

  @ApiProperty({ example: "project-uuid" })
  @IsString({ message: "Project ID must be a string" })
  projectId: string;

  @ApiPropertyOptional({ example: "user-uuid" })
  @IsOptional()
  @IsString({ message: "Assigned user ID must be a string" })
  assignedToId?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: "Update login logic" })
  @IsOptional()
  @IsString({ message: "Title must be a string" })
  title?: string;

  @ApiPropertyOptional({ example: "Change JWT secret" })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string;

  @ApiPropertyOptional({ enum: TaskType })
  @IsOptional()
  @IsEnum(TaskType, { message: "Type must be a valid TaskType" })
  type?: TaskType;

  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status, { message: "Status must be a valid Status" })
  status?: Status;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority, { message: "Priority must be a valid Priority" })
  priority?: Priority;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt({ message: "Story points must be an integer" })
  @Min(1, { message: "Story points must be at least 1" })
  storyPoints?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt({ message: "Estimate must be an integer" })
  @Min(0, { message: "Estimate must be at least 0" })
  estimate?: number;

  @ApiPropertyOptional({ example: "2025-08-10T12:00:00.000Z" })
  @IsOptional()
  @IsString({ message: "Due date must be a string" })
  dueDate?: string;

  @ApiPropertyOptional({ example: "user-uuid" })
  @IsOptional()
  @IsString({ message: "Assigned user ID must be a string" })
  assignedToId?: string;
}
