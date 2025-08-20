import { CommentService } from "../comment.service";
import { CreateCommentDto, UpdateCommentDto } from "../dto/comment.dto";

describe("CommentService", () => {
  let service: CommentService;
  let db: any;
  let responseService: any;

  beforeEach(() => {
    db = {
      comment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      task: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };
    responseService = {
      sendSuccess: jest.fn(),
      sendError: jest.fn(),
    };
    service = new CommentService(db, responseService);
  });

  describe("createComment", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      const dto = { content: "" } as CreateCommentDto;
      await service.createComment(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Validation failed",
        expect.any(Array)
      );
    });

    it("should return error if task not found", async () => {
      db.task.findUnique.mockResolvedValue(null);
      const res = {} as any;
      const dto = { content: "Comment", taskId: "tid", authorId: "uid" } as CreateCommentDto;
      await service.createComment(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task not found"
      );
    });

    it("should return error if author not found", async () => {
      db.task.findUnique.mockResolvedValue({ id: "tid" });
      db.user.findUnique.mockResolvedValue(null);
      const res = {} as any;
      const dto = { content: "Comment", taskId: "tid", authorId: "uid" } as CreateCommentDto;
      await service.createComment(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Author not found"
      );
    });

    it("should create comment and return success", async () => {
      db.task.findUnique.mockResolvedValue({ id: "tid" });
      db.user.findUnique.mockResolvedValue({ id: "uid" });
      db.comment.create.mockResolvedValue({ id: "cid", content: "Comment" });
      const res = {} as any;
      const dto = { content: "Comment", taskId: "tid", authorId: "uid" } as CreateCommentDto;
      await service.createComment(res, dto);
      expect(db.comment.create).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Comment created",
        expect.objectContaining({ id: "cid" })
      );
    });

    it("should handle errors", async () => {
      db.task.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      const dto = { content: "Comment", taskId: "tid", authorId: "uid" } as CreateCommentDto;
      await service.createComment(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Create failed",
        expect.any(String)
      );
    });
  });

  describe("getCommentById", () => {
    it("should return error if comment not found", async () => {
      db.comment.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.getCommentById(res, "cid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Comment not found"
      );
    });

    it("should fetch comment and return success", async () => {
      db.comment.findUnique.mockResolvedValue({ id: "cid", content: "Comment" });
      const res = {} as any;
      await service.getCommentById(res, "cid");
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Comment fetched",
        expect.objectContaining({ id: "cid" })
      );
    });

    it("should handle errors", async () => {
      db.comment.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.getCommentById(res, "cid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Fetch failed",
        expect.any(String)
      );
    });
  });

  describe("updateComment", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      await service.updateComment(res, "cid", { content: "" } as UpdateCommentDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Validation failed",
        expect.any(Array)
      );
    });

    it("should return error if comment not found", async () => {
      db.comment.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.updateComment(res, "cid", { content: "Updated" } as UpdateCommentDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Comment not found"
      );
    });

    it("should update comment and return success", async () => {
      db.comment.findUnique.mockResolvedValue({ id: "cid" });
      db.comment.update.mockResolvedValue({ id: "cid", content: "Updated" });
      const res = {} as any;
      await service.updateComment(res, "cid", { content: "Updated" } as UpdateCommentDto);
      expect(db.comment.update).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Comment updated",
        expect.objectContaining({ id: "cid" })
      );
    });

    it("should handle errors", async () => {
      db.comment.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.updateComment(res, "cid", { content: "Updated" } as UpdateCommentDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Update failed",
        expect.any(String)
      );
    });
  });

  describe("deleteComment", () => {
    it("should return error if comment not found", async () => {
      db.comment.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.deleteComment(res, "cid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Comment not found"
      );
    });

    it("should delete comment and return success", async () => {
      db.comment.findUnique.mockResolvedValue({ id: "cid" });
      db.comment.delete.mockResolvedValue({});
      const res = {} as any;
      await service.deleteComment(res, "cid");
      expect(db.comment.delete).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Comment deleted"
      );
    });

    it("should handle errors", async () => {
      db.comment.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.deleteComment(res, "cid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Delete failed",
        expect.any(String)
      );
    });
  });

  describe("listComments", () => {
    it("should return paginated comments", async () => {
      db.comment.count.mockResolvedValue(2);
      db.comment.findMany.mockResolvedValue([
        { id: "c1", content: "A" },
        { id: "c2", content: "B" },
      ]);
      const res = {} as any;
      await service.listComments(res, "tid", { limit: 10, page: 1 });
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Comments fetched",
        expect.objectContaining({
          comments: expect.any(Array),
          pagination: expect.any(Object),
        })
      );
    });

    it("should handle errors", async () => {
      db.comment.count.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.listComments(res, "tid", { limit: 10, page: 1 });
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Fetch failed",
        expect.any(String)
      );
    });
  });
});