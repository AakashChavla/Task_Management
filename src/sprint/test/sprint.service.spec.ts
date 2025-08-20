import { SprintService } from "../sprint.service";
import { ResponseService } from "src/common/services/response.service";
import { DatabaseService } from "src/database/database.service";
import { CreateSprintDto, UpdateSprintDto } from "../dto/sprint.dto";

describe("SprintService", () => {
  let service: SprintService;
  let db: any;
  let responseService: any;

  beforeEach(() => {
    db = {
      sprint: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
      },
      task: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    responseService = {
      sendSuccess: jest.fn(),
      sendError: jest.fn(),
    };
    service = new SprintService(db, responseService);
  });

  describe("createSprint", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      const dto = { name: "" } as CreateSprintDto;
      await service.createSprint(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Validation failed",
        expect.any(Array)
      );
    });

    it("should return error if project not found", async () => {
      db.project.findUnique.mockResolvedValue(null);
      const res = {} as any;
      const dto = { name: "Sprint", projectId: "pid", startDate: "2025-09-01", endDate: "2025-09-15" } as CreateSprintDto;
      await service.createSprint(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project not found"
      );
    });

    it("should create sprint and return success", async () => {
      db.project.findUnique.mockResolvedValue({ id: "pid" });
      db.sprint.create.mockResolvedValue({ id: "sid", name: "Sprint" });
      const res = {} as any;
      const dto = { name: "Sprint", projectId: "pid", startDate: "2025-09-01", endDate: "2025-09-15" } as CreateSprintDto;
      await service.createSprint(res, dto);
      expect(db.sprint.create).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Sprint created",
        expect.objectContaining({ id: "sid" })
      );
    });

    it("should handle errors", async () => {
      db.project.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      const dto = { name: "Sprint", projectId: "pid", startDate: "2025-09-01", endDate: "2025-09-15" } as CreateSprintDto;
      await service.createSprint(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Create failed",
        expect.any(String)
      );
    });
  });

  describe("getSprintById", () => {
    it("should return error if sprint not found", async () => {
      db.sprint.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.getSprintById(res, "sid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Sprint not found"
      );
    });

    it("should fetch sprint and return success", async () => {
      db.sprint.findUnique.mockResolvedValue({ id: "sid", name: "Sprint", tasks: [] });
      const res = {} as any;
      await service.getSprintById(res, "sid");
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Sprint fetched",
        expect.objectContaining({ id: "sid" })
      );
    });

    it("should handle errors", async () => {
      db.sprint.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.getSprintById(res, "sid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Fetch failed",
        expect.any(String)
      );
    });
  });

  describe("updateSprint", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      await service.updateSprint(res, "sid", { name: "" } as UpdateSprintDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Validation failed",
        expect.any(Array)
      );
    });

    it("should return error if sprint not found", async () => {
      db.sprint.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.updateSprint(res, "sid", { name: "Sprint" } as UpdateSprintDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Sprint not found"
      );
    });

    it("should update sprint and return success", async () => {
      db.sprint.findUnique.mockResolvedValue({ id: "sid" });
      db.sprint.update.mockResolvedValue({ id: "sid", name: "Sprint Updated" });
      const res = {} as any;
      await service.updateSprint(res, "sid", { name: "Sprint Updated" } as UpdateSprintDto);
      expect(db.sprint.update).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Sprint updated",
        expect.objectContaining({ id: "sid" })
      );
    });

    it("should handle errors", async () => {
      db.sprint.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.updateSprint(res, "sid", { name: "Sprint Updated" } as UpdateSprintDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Update failed",
        expect.any(String)
      );
    });
  });

  describe("deleteSprint", () => {
    it("should return error if sprint not found", async () => {
      db.sprint.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.deleteSprint(res, "sid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Sprint not found"
      );
    });

    it("should delete sprint and return success", async () => {
      db.sprint.findUnique.mockResolvedValue({ id: "sid" });
      db.sprint.delete.mockResolvedValue({});
      const res = {} as any;
      await service.deleteSprint(res, "sid");
      expect(db.sprint.delete).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Sprint deleted"
      );
    });

    it("should handle errors", async () => {
      db.sprint.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.deleteSprint(res, "sid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Delete failed",
        expect.any(String)
      );
    });
  });

  describe("listSprints", () => {
    it("should return paginated sprints", async () => {
      db.sprint.count.mockResolvedValue(2);
      db.sprint.findMany.mockResolvedValue([
        { id: "s1", name: "Sprint 1", tasks: [] },
        { id: "s2", name: "Sprint 2", tasks: [] },
      ]);
      const res = {} as any;
      await service.listSprints(res, "pid", { limit: 10, page: 1 });
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Sprints fetched",
        expect.objectContaining({
          sprints: expect.any(Array),
          pagination: expect.any(Object),
        })
      );
    });

    it("should handle errors", async () => {
      db.sprint.count.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.listSprints(res, "pid", { limit: 10, page: 1 });
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Fetch failed",
        expect.any(String)
      );
    });
  });

  describe("listSprintTasks", () => {
    it("should return error if sprint not found", async () => {
      db.sprint.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.listSprintTasks(res, "sid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Sprint not found"
      );
    });

    it("should list tasks and return success", async () => {
      db.sprint.findUnique.mockResolvedValue({ id: "sid", tasks: [{ id: "tid" }] });
      const res = {} as any;
      await service.listSprintTasks(res, "sid");
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Tasks fetched",
        expect.any(Array)
      );
    });

    it("should handle errors", async () => {
      db.sprint.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.listSprintTasks(res, "sid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Fetch failed",
        expect.any(String)
      );
    });
  });

  describe("assignTaskToSprint", () => {
    it("should return error if sprint not found", async () => {
      db.sprint.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.assignTaskToSprint(res, "sid", "tid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Sprint not found"
      );
    });

    it("should return error if task not found", async () => {
      db.sprint.findUnique.mockResolvedValue({ id: "sid" });
      db.task.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.assignTaskToSprint(res, "sid", "tid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task not found"
      );
    });

    it("should assign task and return success", async () => {
      db.sprint.findUnique.mockResolvedValue({ id: "sid" });
      db.task.findUnique.mockResolvedValue({ id: "tid" });
      db.task.update.mockResolvedValue({ id: "tid", sprintId: "sid" });
      const res = {} as any;
      await service.assignTaskToSprint(res, "sid", "tid");
      expect(db.task.update).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task assigned to sprint",
        expect.objectContaining({ id: "tid" })
      );
    });

    it("should handle errors", async () => {
      db.sprint.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.assignTaskToSprint(res, "sid", "tid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Assign failed",
        expect.any(String)
      );
    });
  });

  describe("removeTaskFromSprint", () => {
    it("should return error if sprint not found", async () => {
      db.sprint.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.removeTaskFromSprint(res, "sid", "tid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Sprint not found"
      );
    });

    it("should return error if task not found in sprint", async () => {
      db.sprint.findUnique.mockResolvedValue({ id: "sid" });
      db.task.findUnique.mockResolvedValue({ id: "tid", sprintId: "otherSid" });
      const res = {} as any;
      await service.removeTaskFromSprint(res, "sid", "tid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task not found in sprint"
      );
    });

    it("should remove task and return success", async () => {
      db.sprint.findUnique.mockResolvedValue({ id: "sid" });
      db.task.findUnique.mockResolvedValue({ id: "tid", sprintId: "sid" });
      db.task.update.mockResolvedValue({ id: "tid", sprintId: null });
      const res = {} as any;
      await service.removeTaskFromSprint(res, "sid", "tid");
      expect(db.task.update).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task removed from sprint",
        expect.objectContaining({ id: "tid" })
      );
    });

    it("should handle errors", async () => {
      db.sprint.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.removeTaskFromSprint(res, "sid", "tid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Remove failed",
        expect.any(String)
      );
    });
  });
});