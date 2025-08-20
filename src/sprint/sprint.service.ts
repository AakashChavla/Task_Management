import { Injectable, HttpStatus } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { ResponseService } from "src/common/services/response.service";
import { CreateSprintDto, UpdateSprintDto } from "./dto/sprint.dto";
import { Response } from "express";
import { PaginationQuery, PaginationMeta } from "src/common/interfaces/pagination";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class SprintService {
  constructor(
    private readonly db: DatabaseService,
    private readonly responseService: ResponseService
  ) {}

  async createSprint(res: Response, dto: CreateSprintDto) {
    try {
      // Validate DTO
      const dtoInstance = plainToInstance(CreateSprintDto, dto);
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

      // Validate project exists
      const project = await this.db.project.findUnique({ where: { id: dto.projectId } });
      if (!project) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Project not found");
      }
      const sprint = await this.db.sprint.create({ data: { ...dto } });
      return this.responseService.sendSuccess(res, HttpStatus.CREATED, "Sprint created", sprint);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Create failed", error.message || error);
    }
  }

  async getSprintById(res: Response, id: string) {
    try {
      const sprint = await this.db.sprint.findUnique({ where: { id }, include: { tasks: true } });
      if (!sprint) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Sprint not found");
      }
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Sprint fetched", sprint);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Fetch failed", error.message || error);
    }
  }

  async updateSprint(res: Response, id: string, dto: UpdateSprintDto) {
    try {
      // Validate DTO
      const dtoInstance = plainToInstance(UpdateSprintDto, dto);
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

      const sprint = await this.db.sprint.findUnique({ where: { id } });
      if (!sprint) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Sprint not found");
      }
      const updated = await this.db.sprint.update({ where: { id }, data: { ...dto } });
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Sprint updated", updated);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Update failed", error.message || error);
    }
  }

  async deleteSprint(res: Response, id: string) {
    try {
      const sprint = await this.db.sprint.findUnique({ where: { id } });
      if (!sprint) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Sprint not found");
      }
      await this.db.sprint.delete({ where: { id } });
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Sprint deleted");
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Delete failed", error.message || error);
    }
  }

  async listSprints(
    res: Response,
    projectId: string,
    pagination: PaginationQuery = {}
  ) {
    try {
      const {
        query,
        limit = 10,
        page = 1,
        orderBy = "desc",
        orderField = "startDate",
      } = pagination;

      const where: any = { projectId };
      if (query) {
        where.OR = [
          { name: { contains: query, mode: "insensitive" } },
          { goal: { contains: query, mode: "insensitive" } },
        ];
      }

      const totalItems = await this.db.sprint.count({ where });
      const totalPages = Math.ceil(totalItems / limit);
      const skip = (page - 1) * limit;

      const sprints = await this.db.sprint.findMany({
        where,
        orderBy: { [orderField]: orderBy },
        skip,
        take: limit,
        include: { tasks: true },
      });

      const paginationMeta: PaginationMeta = {
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
        "Sprints fetched",
        { sprints, pagination: paginationMeta }
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

  async listSprintTasks(res: Response, sprintId: string) {
    try {
      const sprint = await this.db.sprint.findUnique({
        where: { id: sprintId },
        include: { tasks: true },
      });
      if (!sprint) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Sprint not found");
      }
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Tasks fetched", sprint.tasks);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Fetch failed", error.message || error);
    }
  }

  async assignTaskToSprint(res: Response, sprintId: string, taskId: string) {
    try {
      const sprint = await this.db.sprint.findUnique({ where: { id: sprintId } });
      if (!sprint) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Sprint not found");
      }
      const task = await this.db.task.findUnique({ where: { id: taskId } });
      if (!task) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Task not found");
      }
      const updated = await this.db.task.update({
        where: { id: taskId },
        data: { sprintId },
      });
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Task assigned to sprint", updated);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Assign failed", error.message || error);
    }
  }

  async removeTaskFromSprint(res: Response, sprintId: string, taskId: string) {
    try {
      const sprint = await this.db.sprint.findUnique({ where: { id: sprintId } });
      if (!sprint) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Sprint not found");
      }
      const task = await this.db.task.findUnique({ where: { id: taskId } });
      if (!task || task.sprintId !== sprintId) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Task not found in sprint");
      }
      const updated = await this.db.task.update({
        where: { id: taskId },
        data: { sprintId: null },
      });
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Task removed from sprint", updated);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Remove failed", error.message || error);
    }
  }
}