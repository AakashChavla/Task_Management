import { Test, TestingModule } from "@nestjs/testing";
import { SprintController } from "../sprint.controller";
import { SprintService } from "../sprint.service";
import { CreateSprintDto, UpdateSprintDto } from "../dto/sprint.dto";
import { PaginationQuery } from "src/common/interfaces/pagination";
import { AuthGuard } from "src/auth/guards/auth.guard";

// Mock custom decorator (if needed)
// jest.mock("src/common/decorators/get-user.decorator", () => ({
//   GetUser: () => () => undefined,
// }));

describe("SprintController", () => {
  let controller: SprintController;
  let service: SprintService;

  const mockSprintService = {
    createSprint: jest.fn(),
    getSprintById: jest.fn(),
    updateSprint: jest.fn(),
    deleteSprint: jest.fn(),
    listSprints: jest.fn(),
    listSprintTasks: jest.fn(),
    assignTaskToSprint: jest.fn(),
    removeTaskFromSprint: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SprintController],
      providers: [{ provide: SprintService, useValue: mockSprintService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SprintController>(SprintController);
    service = module.get<SprintService>(SprintService);

    jest.clearAllMocks();
  });

  describe("createSprint", () => {
    it("should call service and return creation result", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: CreateSprintDto = {
        name: "Sprint 1",
        projectId: "pid",
        startDate: "2025-09-01T00:00:00.000Z",
        endDate: "2025-09-15T00:00:00.000Z",
      } as any;
      mockSprintService.createSprint.mockResolvedValue("created");
      const result = await controller.createSprint(res, dto);
      expect(service.createSprint).toHaveBeenCalledWith(res, dto);
      expect(result).toBe("created");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: CreateSprintDto = {
        name: "Sprint 1",
        projectId: "pid",
        startDate: "2025-09-01T00:00:00.000Z",
        endDate: "2025-09-15T00:00:00.000Z",
      } as any;
      mockSprintService.createSprint.mockRejectedValue(new Error("fail"));
      await expect(controller.createSprint(res, dto)).rejects.toThrow("fail");
    });
  });

  describe("getSprintById", () => {
    it("should call service and return sprint", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockSprintService.getSprintById.mockResolvedValue("sprint");
      const result = await controller.getSprintById(res, "sid");
      expect(service.getSprintById).toHaveBeenCalledWith(res, "sid");
      expect(result).toBe("sprint");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockSprintService.getSprintById.mockRejectedValue(new Error("fail"));
      await expect(controller.getSprintById(res, "sid")).rejects.toThrow("fail");
    });
  });

  describe("updateSprint", () => {
    it("should call service and return update result", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: UpdateSprintDto = { name: "Sprint Updated" };
      mockSprintService.updateSprint.mockResolvedValue("updated");
      const result = await controller.updateSprint(res, "sid", dto);
      expect(service.updateSprint).toHaveBeenCalledWith(res, "sid", dto);
      expect(result).toBe("updated");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: UpdateSprintDto = { name: "Sprint Updated" };
      mockSprintService.updateSprint.mockRejectedValue(new Error("fail"));
      await expect(controller.updateSprint(res, "sid", dto)).rejects.toThrow("fail");
    });
  });

  describe("deleteSprint", () => {
    it("should call service and return delete result", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockSprintService.deleteSprint.mockResolvedValue("deleted");
      const result = await controller.deleteSprint(res, "sid");
      expect(service.deleteSprint).toHaveBeenCalledWith(res, "sid");
      expect(result).toBe("deleted");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockSprintService.deleteSprint.mockRejectedValue(new Error("fail"));
      await expect(controller.deleteSprint(res, "sid")).rejects.toThrow("fail");
    });
  });

  describe("listSprints", () => {
    it("should call service and return sprints", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const projectId = "pid";
      const pagination: PaginationQuery = { limit: 10, page: 1 };
      mockSprintService.listSprints.mockResolvedValue("sprints");
      const result = await controller.listSprints(res, projectId, pagination);
      expect(service.listSprints).toHaveBeenCalledWith(res, projectId, pagination);
      expect(result).toBe("sprints");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const projectId = "pid";
      const pagination: PaginationQuery = { limit: 10, page: 1 };
      mockSprintService.listSprints.mockRejectedValue(new Error("fail"));
      await expect(controller.listSprints(res, projectId, pagination)).rejects.toThrow("fail");
    });
  });

  describe("listSprintTasks", () => {
    it("should call service and return sprint tasks", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockSprintService.listSprintTasks.mockResolvedValue("tasks");
      const result = await controller.listSprintTasks(res, "sid");
      expect(service.listSprintTasks).toHaveBeenCalledWith(res, "sid");
      expect(result).toBe("tasks");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockSprintService.listSprintTasks.mockRejectedValue(new Error("fail"));
      await expect(controller.listSprintTasks(res, "sid")).rejects.toThrow("fail");
    });
  });

  describe("assignTaskToSprint", () => {
    it("should call service and return assign result", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockSprintService.assignTaskToSprint.mockResolvedValue("assigned");
      const result = await controller.assignTaskToSprint(res, "sid", "tid");
      expect(service.assignTaskToSprint).toHaveBeenCalledWith(res, "sid", "tid");
      expect(result).toBe("assigned");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockSprintService.assignTaskToSprint.mockRejectedValue(new Error("fail"));
      await expect(controller.assignTaskToSprint(res, "sid", "tid")).rejects.toThrow("fail");
    });
  });

  describe("removeTaskFromSprint", () => {
    it("should call service and return remove result", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockSprintService.removeTaskFromSprint.mockResolvedValue("removed");
      const result = await controller.removeTaskFromSprint(res, "sid", "tid");
      expect(service.removeTaskFromSprint).toHaveBeenCalledWith(res, "sid", "tid");
      expect(result).toBe("removed");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockSprintService.removeTaskFromSprint.mockRejectedValue(new Error("fail"));
      await expect(controller.removeTaskFromSprint(res, "sid", "tid")).rejects.toThrow("fail");
    });
  });
});