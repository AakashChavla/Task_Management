import { Test, TestingModule } from "@nestjs/testing";
import { CommentController } from "../comment.controller";
import { CommentService } from "../comment.service";
import { CreateCommentDto, UpdateCommentDto } from "../dto/comment.dto";
import { PaginationQuery } from "src/common/interfaces/pagination";
import { AuthGuard } from "src/auth/guards/auth.guard";

describe("CommentController", () => {
  let controller: CommentController;
  let service: CommentService;

  const mockCommentService = {
    createComment: jest.fn(),
    getCommentById: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    listComments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [{ provide: CommentService, useValue: mockCommentService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get<CommentService>(CommentService);

    jest.clearAllMocks();
  });

  describe("createComment", () => {
    it("should call service and return creation result", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: CreateCommentDto = { content: "Comment", taskId: "tid", authorId: "uid" };
      mockCommentService.createComment.mockResolvedValue("created");
      const result = await controller.createComment(res, dto);
      expect(service.createComment).toHaveBeenCalledWith(res, dto);
      expect(result).toBe("created");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: CreateCommentDto = { content: "Comment", taskId: "tid", authorId: "uid" };
      mockCommentService.createComment.mockRejectedValue(new Error("fail"));
      await expect(controller.createComment(res, dto)).rejects.toThrow("fail");
    });
  });

  describe("getCommentById", () => {
    it("should call service and return comment", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockCommentService.getCommentById.mockResolvedValue("comment");
      const result = await controller.getCommentById(res, "cid");
      expect(service.getCommentById).toHaveBeenCalledWith(res, "cid");
      expect(result).toBe("comment");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockCommentService.getCommentById.mockRejectedValue(new Error("fail"));
      await expect(controller.getCommentById(res, "cid")).rejects.toThrow("fail");
    });
  });

  describe("updateComment", () => {
    it("should call service and return update result", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: UpdateCommentDto = { content: "Updated" };
      mockCommentService.updateComment.mockResolvedValue("updated");
      const result = await controller.updateComment(res, "cid", dto);
      expect(service.updateComment).toHaveBeenCalledWith(res, "cid", dto);
      expect(result).toBe("updated");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: UpdateCommentDto = { content: "Updated" };
      mockCommentService.updateComment.mockRejectedValue(new Error("fail"));
      await expect(controller.updateComment(res, "cid", dto)).rejects.toThrow("fail");
    });
  });

  describe("deleteComment", () => {
    it("should call service and return delete result", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockCommentService.deleteComment.mockResolvedValue("deleted");
      const result = await controller.deleteComment(res, "cid");
      expect(service.deleteComment).toHaveBeenCalledWith(res, "cid");
      expect(result).toBe("deleted");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockCommentService.deleteComment.mockRejectedValue(new Error("fail"));
      await expect(controller.deleteComment(res, "cid")).rejects.toThrow("fail");
    });
  });

  describe("listComments", () => {
    it("should call service and return comments", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const taskId = "tid";
      const pagination: PaginationQuery = { limit: 10, page: 1 };
      mockCommentService.listComments.mockResolvedValue("comments");
      const result = await controller.listComments(res, taskId, pagination);
      expect(service.listComments).toHaveBeenCalledWith(res, taskId, pagination);
      expect(result).toBe("comments");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const taskId = "tid";
      const pagination: PaginationQuery = { limit: 10, page: 1 };
      mockCommentService.listComments.mockRejectedValue(new Error("fail"));
      await expect(controller.listComments(res, taskId, pagination)).rejects.toThrow("fail");
    });
  });
});