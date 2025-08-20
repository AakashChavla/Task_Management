import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, MinLength, IsOptional } from "class-validator";

export class CreateLabelDto {
  @ApiProperty({ example: "Bug" })
  @IsString({ message: "Label name must be a string" })
  @MinLength(2, { message: "Label name must be at least 2 characters" })
  name: string;
}

export class UpdateLabelDto {
  @ApiPropertyOptional({ example: "Feature" })
  @IsOptional()
  @IsString({ message: "Label name must be a string" })
  @MinLength(2, { message: "Label name must be at least 2 characters" })
  name?: string;
}