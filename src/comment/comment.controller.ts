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
import { CommentService } from "./comment.service";
import { CreateCommentDto, UpdateCommentDto } from "./dto/comment.dto";
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

@ApiTags("comment")
@Controller("comment")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new comment." })
  @ApiResponse({ status: 201, description: "Comment created" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  @ApiResponse({ status: 404, description: "Task or author not found" })
  @ApiResponse({ status: 500, description: "Create failed" })
  async createComment(@Res() res: Response, @Body() dto: CreateCommentDto) {
    return this.commentService.createComment(res, dto);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get comment by ID." })
  @ApiResponse({ status: 200, description: "Comment fetched" })
  @ApiResponse({ status: 404, description: "Comment not found" })
  @ApiResponse({ status: 500, description: "Fetch failed" })
  async getCommentById(@Res() res: Response, @Param("id") id: string) {
    return this.commentService.getCommentById(res, id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update comment by ID." })
  @ApiResponse({ status: 200, description: "Comment updated" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  @ApiResponse({ status: 404, description: "Comment not found" })
  @ApiResponse({ status: 500, description: "Update failed" })
  async updateComment(
    @Res() res: Response,
    @Param("id") id: string,
    @Body() dto: UpdateCommentDto
  ) {
    return this.commentService.updateComment(res, id, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete comment by ID." })
  @ApiResponse({ status: 200, description: "Comment deleted" })
  @ApiResponse({ status: 404, description: "Comment not found" })
  @ApiResponse({ status: 500, description: "Delete failed" })
  async deleteComment(@Res() res: Response, @Param("id") id: string) {
    return this.commentService.deleteComment(res, id);
  }

  @Get("task/:taskId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List comments for a task with pagination and search." })
  @ApiQuery({ name: "query", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "orderBy", required: false, type: String })
  @ApiQuery({ name: "orderField", required: false, type: String })
  @ApiResponse({ status: 200, description: "Comments fetched" })
  @ApiResponse({ status: 500, description: "Fetch failed" })
  async listComments(
    @Res() res: Response,
    @Param("taskId") taskId: string,
    @Query() pagination: PaginationQuery
  ) {
    return this.commentService.listComments(res, taskId, pagination);
  }
}