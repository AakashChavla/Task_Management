import { Injectable, HttpStatus } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { ResponseService } from "src/common/services/response.service";
import { CreateLabelDto, UpdateLabelDto } from "./dto/label.dto";
import { Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PaginationQuery, PaginationMeta } from "src/common/interfaces/pagination";

@Injectable()
export class LabelService {
  constructor(
    private readonly db: DatabaseService,
    private readonly responseService: ResponseService
  ) {}

  async createLabel(res: Response, dto: CreateLabelDto) {
    try {
      const dtoInstance = plainToInstance(CreateLabelDto, dto);
      const errors = await validate(dtoInstance);
      if (errors.length > 0) {
        const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
        return this.responseService.sendError(res, HttpStatus.BAD_REQUEST, "Validation failed", messages);
      }
      const label = await this.db.label.create({ data: { ...dto } });
      return this.responseService.sendSuccess(res, HttpStatus.CREATED, "Label created", label);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Create failed", error.message || error);
    }
  }

  async getLabelById(res: Response, id: string) {
    try {
      const label = await this.db.label.findUnique({ where: { id }, include: { tasks: true } });
      if (!label) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Label not found");
      }
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Label fetched", label);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Fetch failed", error.message || error);
    }
  }

  async updateLabel(res: Response, id: string, dto: UpdateLabelDto) {
    try {
      const dtoInstance = plainToInstance(UpdateLabelDto, dto);
      const errors = await validate(dtoInstance);
      if (errors.length > 0) {
        const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
        return this.responseService.sendError(res, HttpStatus.BAD_REQUEST, "Validation failed", messages);
      }
      const label = await this.db.label.findUnique({ where: { id } });
      if (!label) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Label not found");
      }
      const updated = await this.db.label.update({ where: { id }, data: { ...dto } });
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Label updated", updated);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Update failed", error.message || error);
    }
  }

  async deleteLabel(res: Response, id: string) {
    try {
      const label = await this.db.label.findUnique({ where: { id } });
      if (!label) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Label not found");
      }
      await this.db.label.delete({ where: { id } });
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Label deleted");
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Delete failed", error.message || error);
    }
  }

  async listLabels(res: Response, pagination: PaginationQuery = {}) {
    try {
      const {
        query,
        limit = 10,
        page = 1,
        orderBy = "desc",
        orderField = "createdAt",
      } = pagination;

      const where: any = {};
      if (query) {
        where.name = { contains: query, mode: "insensitive" };
      }

      const totalItems = await this.db.label.count({ where });
      const totalPages = Math.ceil(totalItems / limit);
      const skip = (page - 1) * limit;

      const labels = await this.db.label.findMany({
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
        "Labels fetched",
        { labels, pagination: paginationMeta }
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