import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Res,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ListTasksQuery, TaskService } from "./task.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";
import { Response } from "express";
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guards/auth.guard";

@ApiTags("task")
@Controller("task")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new task." })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: "Task created" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  @ApiResponse({ status: 404, description: "Project or user not found" })
  @ApiResponse({ status: 500, description: "Create failed" })
  async createTask(@Res() res: Response, @Body() dto: CreateTaskDto) {
    return this.taskService.createTask(res, dto);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a task by its ID." })
  @ApiResponse({ status: 200, description: "Task fetched" })
  @ApiResponse({ status: 404, description: "Task not found" })
  @ApiResponse({ status: 500, description: "Fetch failed" })
  async getTaskById(@Res() res: Response, @Param("id") id: string) {
    return this.taskService.getTaskById(res, id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a task by its ID." })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: "Task updated" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  @ApiResponse({ status: 404, description: "Task not found" })
  @ApiResponse({ status: 500, description: "Update failed" })
  async updateTask(
    @Res() res: Response,
    @Param("id") id: string,
    @Body() dto: UpdateTaskDto
  ) {
    return this.taskService.updateTask(res, id, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a task by its ID." })
  @ApiResponse({ status: 200, description: "Task deleted" })
  @ApiResponse({ status: 404, description: "Task not found" })
  @ApiResponse({ status: 500, description: "Delete failed" })
  async deleteTask(@Res() res: Response, @Param("id") id: string) {
    return this.taskService.deleteTask(res, id);
  }

  @Get("project/:projectId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all tasks for a project." })
  @ApiResponse({ status: 200, description: "Tasks fetched" })
  @ApiResponse({ status: 500, description: "Fetch failed" })
  async listTasks(@Res() res: Response, @Param("projectId") projectId: string) {
    return this.taskService.listTasks(res, projectId);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get tasks with filters, pagination, and search." })
  @ApiQuery({ name: "projectId", required: false, type: String })
  @ApiQuery({ name: "parentId", required: false, type: String })
  @ApiQuery({ name: "assignedToId", required: false, type: String })
  @ApiQuery({
    name: "query",
    required: false,
    type: String,
    description: "Search text",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number",
  })
  @ApiQuery({
    name: "orderBy",
    required: false,
    type: String,
    description: "Order direction (asc/desc)",
  })
  @ApiQuery({
    name: "orderField",
    required: false,
    type: String,
    description: "Order by field (e.g. createdAt)",
  })
  @ApiResponse({ status: 200, description: "Tasks fetched" })
  @ApiResponse({ status: 500, description: "Fetch failed" })
  async getTasks(@Res() res: Response, @Query() query: ListTasksQuery) {
    return this.taskService.getTasks(res, query);
  }
}

