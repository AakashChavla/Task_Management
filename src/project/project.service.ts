import { Injectable, HttpStatus } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { CreateProjectDto, UpdateProjectDto } from "./dto/project.dto";
import { ResponseService } from "src/common/services/response.service";
import { Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  PaginationMeta,
  PaginationQuery,
} from "src/common/interfaces/pagination";

@Injectable()
export class ProjectService {
  constructor(
    private readonly db: DatabaseService,
    private readonly responseService: ResponseService
  ) {}

  async createProject(
    res: Response,
    dto: CreateProjectDto,
    userId: string,
    companyId: string
  ) {
    try {
      // Validate DTO
      const dtoInstance = plainToInstance(CreateProjectDto, dto);
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

      const project = await this.db.project.create({
        data: {
          name: dto.name,
          description: dto.description,
          createdById: userId,
          companyId: companyId, // <-- Use companyId from req.user
        },
      });
      return this.responseService.sendSuccess(
        res,
        HttpStatus.CREATED,
        "Project created",
        project
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

  async getCompanyProjects(
    res: Response,
    companyId: string,
    query: PaginationQuery
  ) {
    try {
      const {
        limit = 10,
        page = 1,
        orderBy = "asc",
        orderField = "name",
        query: search,
      } = query;

      // Validate pagination params
      if (limit <= 0 || page <= 0) {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          "Invalid pagination parameters"
        );
      }

      // Build filter
      const where: any = { companyId };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      // Count total projects for pagination meta
      const totalItems = await this.db.project.count({ where });

      // If no projects found, return empty array with meta
      if (totalItems === 0) {
        return this.responseService.sendSuccess(
          res,
          HttpStatus.OK,
          "No projects found for this company",
          {
            projects: [],
            pagination: {
              totalItems,
              totalPages: 0,
              currentPage: page,
              itemsPerPage: limit,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          }
        );
      }

      // Fetch projects with pagination and filter
      const projects = await this.db.project.findMany({
        where,
        orderBy: { [orderField]: orderBy },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          createdById: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const pagination: PaginationMeta = {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page * limit < totalItems,
        hasPreviousPage: page > 1,
      };

      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Projects fetched successfully",
        { projects, pagination }
      );
    } catch (error) {
      // Prisma error handling
      if (error.code === "P2021" || error.code === "P2022") {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          "Invalid company ID"
        );
      }
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Failed to fetch projects",
        error.message || error
      );
    }
  }

  async updateProject(res: Response, id: string, dto: UpdateProjectDto) {
    try {
      // Validate DTO
      const dtoInstance = plainToInstance(UpdateProjectDto, dto);
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

      // Check if project exists
      const existing = await this.db.project.findUnique({ where: { id } });
      if (!existing) {
        return this.responseService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          "Project not found"
        );
      }

      const project = await this.db.project.update({
        where: { id },
        data: { ...dto },
      });
      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Project updated",
        project
      );
    } catch (error) {
      if (error.code === "P2021" || error.code === "P2022") {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          "Invalid project ID"
        );
      }
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Update failed",
        error.message || error
      );
    }
  }

  async deleteProject(res: Response, id: string) {
    try {
      // Check if project exists
      const existing = await this.db.project.findUnique({ where: { id } });
      if (!existing) {
        return this.responseService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          "Project not found"
        );
      }

      await this.db.project.delete({ where: { id } });
      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Project deleted"
      );
    } catch (error) {
      if (error.code === "P2021" || error.code === "P2022") {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          "Invalid project ID"
        );
      }
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Delete failed",
        error.message || error
      );
    }
  }

  async getProjectById(res: Response, id: string) {
    try {
      const project = await this.db.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          createdById: true,
          companyId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!project) {
        return this.responseService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          "Project not found"
        );
      }

      return this.responseService.sendSuccess(
        res,
        HttpStatus.OK,
        "Project fetched successfully",
        project
      );
    } catch (error) {
      if (error.code === "P2021" || error.code === "P2022") {
        return this.responseService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          "Invalid project ID"
        );
      }
      return this.responseService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Failed to fetch project",
        error.message || error
      );
    }
  }
}
