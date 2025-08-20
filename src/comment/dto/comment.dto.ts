import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, MinLength, IsOptional } from "class-validator";

export class CreateCommentDto {
  @ApiProperty({ example: "This is a comment." })
  @IsString({ message: "Content must be a string" })
  @MinLength(2, { message: "Content must be at least 2 characters" })
  content: string;

  @ApiProperty({ example: "task-uuid" })
  @IsString({ message: "Task ID must be a string" })
  taskId: string;

  @ApiProperty({ example: "user-uuid" })
  @IsString({ message: "Author ID must be a string" })
  authorId: string;
}

export class UpdateCommentDto {
  @ApiPropertyOptional({ example: "Updated comment." })
  @IsOptional()
  @IsString({ message: "Content must be a string" })
  @MinLength(2, { message: "Content must be at least 2 characters" })
  content?: string;
}