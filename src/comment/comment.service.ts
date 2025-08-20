import { Injectable, HttpStatus } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { ResponseService } from "src/common/services/response.service";
import { CreateCommentDto, UpdateCommentDto } from "./dto/comment.dto";
import { Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PaginationQuery, PaginationMeta } from "src/common/interfaces/pagination";

@Injectable()
export class CommentService {
  constructor(
    private readonly db: DatabaseService,
    private readonly responseService: ResponseService
  ) {}

  async createComment(res: Response, dto: CreateCommentDto) {
    try {
      const dtoInstance = plainToInstance(CreateCommentDto, dto);
      const errors = await validate(dtoInstance);
      if (errors.length > 0) {
        const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
        return this.responseService.sendError(res, HttpStatus.BAD_REQUEST, "Validation failed", messages);
      }
      // Validate task and author exist
      const task = await this.db.task.findUnique({ where: { id: dto.taskId } });
      if (!task) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Task not found");
      }
      const author = await this.db.user.findUnique({ where: { id: dto.authorId } });
      if (!author) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Author not found");
      }
      const comment = await this.db.comment.create({ data: { ...dto } });
      return this.responseService.sendSuccess(res, HttpStatus.CREATED, "Comment created", comment);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Create failed", error.message || error);
    }
  }

  async getCommentById(res: Response, id: string) {
    try {
      const comment = await this.db.comment.findUnique({ where: { id }, include: { author: true, task: true } });
      if (!comment) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Comment not found");
      }
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Comment fetched", comment);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Fetch failed", error.message || error);
    }
  }

  async updateComment(res: Response, id: string, dto: UpdateCommentDto) {
    try {
      const dtoInstance = plainToInstance(UpdateCommentDto, dto);
      const errors = await validate(dtoInstance);
      if (errors.length > 0) {
        const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
        return this.responseService.sendError(res, HttpStatus.BAD_REQUEST, "Validation failed", messages);
      }
      const comment = await this.db.comment.findUnique({ where: { id } });
      if (!comment) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Comment not found");
      }
      const updated = await this.db.comment.update({ where: { id }, data: { ...dto } });
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Comment updated", updated);
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Update failed", error.message || error);
    }
  }

  async deleteComment(res: Response, id: string) {
    try {
      const comment = await this.db.comment.findUnique({ where: { id } });
      if (!comment) {
        return this.responseService.sendError(res, HttpStatus.NOT_FOUND, "Comment not found");
      }
      await this.db.comment.delete({ where: { id } });
      return this.responseService.sendSuccess(res, HttpStatus.OK, "Comment deleted");
    } catch (error) {
      return this.responseService.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Delete failed", error.message || error);
    }
  }

  async listComments(res: Response, taskId: string, pagination: PaginationQuery = {}) {
    try {
      const {
        query,
        limit = 10,
        page = 1,
        orderBy = "desc",
        orderField = "createdAt",
      } = pagination;

      const where: any = { taskId };
      if (query) {
        where.content = { contains: query, mode: "insensitive" };
      }

      const totalItems = await this.db.comment.count({ where });
      const totalPages = Math.ceil(totalItems / limit);
      const skip = (page - 1) * limit;

      const comments = await this.db.comment.findMany({
        where,
        orderBy: { [orderField]: orderBy },
        skip,
        take: limit,
        include: { author: true },
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
        "Comments fetched",
        { comments, pagination: paginationMeta }
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