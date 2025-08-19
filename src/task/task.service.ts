import { Injectable, HttpStatus } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";
import { ResponseService } from "src/common/services/response.service";
import { Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PaginationMeta, PaginationQuery } from "src/common/interfaces/pagination";

@Injectable()
export class TaskService {
  constructor(
    private readonly db: DatabaseService,
    private readonly responseService: ResponseService
  ) {}

  async createTask(res: Response, dto: CreateTaskDto) {
    try {
      const dtoInstance = plainToInstance(CreateTaskDto, dto);
      const errors = await validate(dtoInstance);
      if (errors.length > 0) {
        const messages = errors
          .map((err) => Object.values(err.constraints || {}))
          .flat();
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          "Validation failed",
          messages
        );
      }

      // Check project exists
      const project = await this.db.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project) {
        return this.responseService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          "Project not found"
        );
      }

      // Optionally check assigned user exists
      if (dto.assignedToId) {
        const user = await this.db.user.findUnique({
          where: { id: dto.assignedToId },
        });
        if (!user) {
          return this.responseService.sendError(
            res,
            HttpStatus.NOT_FOUND,
            "Assigned user not found"
          );
        }
      }

      const task = await this.db.task.create({
        data: {
          ...dto,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        },
      });
      return this.responseService.sendSuccess(
        res,
        HttpStatus.CREATED,
        "Task created",
        task
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Create failed",
        error.message || error
      );
    }
  }

  async getTaskById(res: Response, id: string) {
    try {
      const task = await this.db.task.findUnique({ where: { id } });
      if (!task) {
        return this.responseService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          "Task not found"
        );
      }
      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Task fetched",
        task
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Fetch failed",
        error.message || error
      );
    }
  }

  async updateTask(res: Response, id: string, dto: UpdateTaskDto) {
    try {
      const dtoInstance = plainToInstance(UpdateTaskDto, dto);
      const errors = await validate(dtoInstance);
      if (errors.length > 0) {
        const messages = errors
          .map((err) => Object.values(err.constraints || {}))
          .flat();
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          "Validation failed",
          messages
        );
      }

      const existing = await this.db.task.findUnique({ where: { id } });
      if (!existing) {
        return this.responseService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          "Task not found"
        );
      }

      const task = await this.db.task.update({
        where: { id },
        data: {
          ...dto,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        },
      });
      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Task updated",
        task
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Update failed",
        error.message || error
      );
    }
  }

  async deleteTask(res: Response, id: string) {
    try {
      const existing = await this.db.task.findUnique({ where: { id } });
      if (!existing) {
        return this.responseService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          "Task not found"
        );
      }
      await this.db.task.delete({ where: { id } });
      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Task deleted"
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Delete failed",
        error.message || error
      );
    }
  }

  async listTasks(res: Response, projectId: string) {
    try {
      const tasks = await this.db.task.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
      });
      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Tasks fetched",
        tasks
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Fetch failed",
        error.message || error
      );
    }
  }

  async getTasks(res: Response, query: ListTasksQuery = {}) {
    try {
      const {
        projectId,
        parentId,
        assignedToId,
        query: search,
        limit = 10,
        page = 1,
        orderBy = "desc",
        orderField = "createdAt",
      } = query;

      const where: any = {};
      if (projectId) where.projectId = projectId;
      if (parentId) where.parentId = parentId;
      if (assignedToId) where.assignedToId = assignedToId;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const totalItems = await this.db.task.count({ where });
      const totalPages = Math.ceil(totalItems / limit);
      const skip = (page - 1) * limit;

      const tasks = await this.db.task.findMany({
        where,
        orderBy: { [orderField]: orderBy },
        skip,
        take: limit,
      });

      const pagination: PaginationMeta = {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Tasks fetched",
        { tasks, pagination }
      );
    } catch (error) {
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Fetch failed",
        error.message || error
      );
    }
  }
}

export interface ListTasksQuery extends PaginationQuery {
  projectId?: string;
  parentId?: string;
  assignedToId?: string;
}
