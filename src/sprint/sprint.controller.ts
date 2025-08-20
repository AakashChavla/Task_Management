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
import { SprintService } from "./sprint.service";
import { CreateSprintDto, UpdateSprintDto } from "./dto/sprint.dto";
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

@ApiTags("sprint")
@Controller("sprint")
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new sprint." })
  @ApiResponse({ status: 201, description: "Sprint created" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  @ApiResponse({ status: 404, description: "Project not found" })
  @ApiResponse({ status: 500, description: "Create failed" })
  async createSprint(@Res() res: Response, @Body() dto: CreateSprintDto) {
    return this.sprintService.createSprint(res, dto);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get sprint by ID." })
  @ApiResponse({ status: 200, description: "Sprint fetched" })
  @ApiResponse({ status: 404, description: "Sprint not found" })
  @ApiResponse({ status: 500, description: "Fetch failed" })
  async getSprintById(@Res() res: Response, @Param("id") id: string) {
    return this.sprintService.getSprintById(res, id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update sprint by ID." })
  @ApiResponse({ status: 200, description: "Sprint updated" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  @ApiResponse({ status: 404, description: "Sprint not found" })
  @ApiResponse({ status: 500, description: "Update failed" })
  async updateSprint(
    @Res() res: Response,
    @Param("id") id: string,
    @Body() dto: UpdateSprintDto
  ) {
    return this.sprintService.updateSprint(res, id, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete sprint by ID." })
  @ApiResponse({ status: 200, description: "Sprint deleted" })
  @ApiResponse({ status: 404, description: "Sprint not found" })
  @ApiResponse({ status: 500, description: "Delete failed" })
  async deleteSprint(@Res() res: Response, @Param("id") id: string) {
    return this.sprintService.deleteSprint(res, id);
  }

  @Get("project/:projectId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List sprints for a project with pagination and search." })
  @ApiQuery({ name: "query", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "orderBy", required: false, type: String })
  @ApiQuery({ name: "orderField", required: false, type: String })
  @ApiResponse({ status: 200, description: "Sprints fetched" })
  @ApiResponse({ status: 500, description: "Fetch failed" })
  async listSprints(
    @Res() res: Response,
    @Param("projectId") projectId: string,
    @Query() pagination: PaginationQuery
  ) {
    return this.sprintService.listSprints(res, projectId, pagination);
  }

  @Get(":id/tasks")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List tasks in a sprint." })
  @ApiResponse({ status: 200, description: "Tasks fetched" })
  @ApiResponse({ status: 404, description: "Sprint not found" })
  @ApiResponse({ status: 500, description: "Fetch failed" })
  async listSprintTasks(@Res() res: Response, @Param("id") sprintId: string) {
    return this.sprintService.listSprintTasks(res, sprintId);
  }

  @Post(":id/tasks/:taskId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Assign a task to a sprint." })
  @ApiResponse({ status: 200, description: "Task assigned to sprint" })
  @ApiResponse({ status: 404, description: "Sprint or task not found" })
  @ApiResponse({ status: 500, description: "Assign failed" })
  async assignTaskToSprint(
    @Res() res: Response,
    @Param("id") sprintId: string,
    @Param("taskId") taskId: string
  ) {
    return this.sprintService.assignTaskToSprint(res, sprintId, taskId);
  }

  @Delete(":id/tasks/:taskId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove a task from a sprint." })
  @ApiResponse({ status: 200, description: "Task removed from sprint" })
  @ApiResponse({ status: 404, description: "Sprint or task not found" })
  @ApiResponse({ status: 500, description: "Remove failed" })
  async removeTaskFromSprint(
    @Res() res: Response,
    @Param("id") sprintId: string,
    @Param("taskId") taskId: string
  ) {
    return this.sprintService.removeTaskFromSprint(res, sprintId, taskId);
  }
}