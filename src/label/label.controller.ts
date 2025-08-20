import {
  Controller,
  Post,
  Body,
  Res,
  Patch,
  Get,
  Query,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { LabelService } from "./label.service";
import { CreateLabelDto, UpdateLabelDto } from "./dto/label.dto";
import { Response } from "express";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { PaginationQuery } from "src/common/interfaces/pagination";
import { AuthGuard } from "src/auth/guards/auth.guard";

@ApiTags("label")
@Controller("label")
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new label." })
  @ApiResponse({ status: 201, description: "Label created" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  @ApiResponse({ status: 500, description: "Create failed" })
  async createLabel(@Res() res: Response, @Body() dto: CreateLabelDto) {
    return this.labelService.createLabel(res, dto);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get label by ID." })
  @ApiResponse({ status: 200, description: "Label fetched" })
  @ApiResponse({ status: 404, description: "Label not found" })
  @ApiResponse({ status: 500, description: "Fetch failed" })
  async getLabelById(@Res() res: Response, @Param("id") id: string) {
    return this.labelService.getLabelById(res, id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update label by ID." })
  @ApiResponse({ status: 200, description: "Label updated" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  @ApiResponse({ status: 404, description: "Label not found" })
  @ApiResponse({ status: 500, description: "Update failed" })
  async updateLabel(
    @Res() res: Response,
    @Param("id") id: string,
    @Body() dto: UpdateLabelDto
  ) {
    return this.labelService.updateLabel(res, id, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete label by ID." })
  @ApiResponse({ status: 200, description: "Label deleted" })
  @ApiResponse({ status: 404, description: "Label not found" })
  @ApiResponse({ status: 500, description: "Delete failed" })
  async deleteLabel(@Res() res: Response, @Param("id") id: string) {
    return this.labelService.deleteLabel(res, id);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List labels with pagination and search." })
  @ApiQuery({ name: "query", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "orderBy", required: false, type: String })
  @ApiQuery({ name: "orderField", required: false, type: String })
  @ApiResponse({ status: 200, description: "Labels fetched" })
  @ApiResponse({ status: 500, description: "Fetch failed" })
  async listLabels(@Res() res: Response, @Query() pagination: PaginationQuery) {
    return this.labelService.listLabels(res, pagination);
  }
}