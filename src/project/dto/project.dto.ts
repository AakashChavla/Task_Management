import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({   example: 'My Project', description: 'Project name' })
  @IsString({ message: 'Project name must be a string' })
  @MinLength(2, { message: 'Project name must be at least 2 characters' })
  name: string;

  @ApiPropertyOptional({ example: 'Project description' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
