import { Test, TestingModule } from "@nestjs/testing";
import { LabelController } from "../label.controller";
import { LabelService } from "../label.service";
import { CreateLabelDto, UpdateLabelDto } from "../dto/label.dto";
import { PaginationQuery } from "src/common/interfaces/pagination";
import { AuthGuard } from "src/auth/guards/auth.guard";

describe("LabelController", () => {
  let controller: LabelController;
  let service: LabelService;

  const mockLabelService = {
    createLabel: jest.fn(),
    getLabelById: jest.fn(),
    updateLabel: jest.fn(),
    deleteLabel: jest.fn(),
    listLabels: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelController],
      providers: [{ provide: LabelService, useValue: mockLabelService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LabelController>(LabelController);
    service = module.get<LabelService>(LabelService);

    jest.clearAllMocks();
  });

  describe("createLabel", () => {
    it("should call service and return creation result", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: CreateLabelDto = { name: "Bug" };
      mockLabelService.createLabel.mockResolvedValue("created");
      const result = await controller.createLabel(res, dto);
      expect(service.createLabel).toHaveBeenCalledWith(res, dto);
      expect(result).toBe("created");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: CreateLabelDto = { name: "Bug" };
      mockLabelService.createLabel.mockRejectedValue(new Error("fail"));
      await expect(controller.createLabel(res, dto)).rejects.toThrow("fail");
    });
  });

  describe("getLabelById", () => {
    it("should call service and return label", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockLabelService.getLabelById.mockResolvedValue("label");
      const result = await controller.getLabelById(res, "lid");
      expect(service.getLabelById).toHaveBeenCalledWith(res, "lid");
      expect(result).toBe("label");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockLabelService.getLabelById.mockRejectedValue(new Error("fail"));
      await expect(controller.getLabelById(res, "lid")).rejects.toThrow("fail");
    });
  });

  describe("updateLabel", () => {
    it("should call service and return update result", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: UpdateLabelDto = { name: "Feature" };
      mockLabelService.updateLabel.mockResolvedValue("updated");
      const result = await controller.updateLabel(res, "lid", dto);
      expect(service.updateLabel).toHaveBeenCalledWith(res, "lid", dto);
      expect(result).toBe("updated");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const dto: UpdateLabelDto = { name: "Feature" };
      mockLabelService.updateLabel.mockRejectedValue(new Error("fail"));
      await expect(controller.updateLabel(res, "lid", dto)).rejects.toThrow("fail");
    });
  });

  describe("deleteLabel", () => {
    it("should call service and return delete result", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockLabelService.deleteLabel.mockResolvedValue("deleted");
      const result = await controller.deleteLabel(res, "lid");
      expect(service.deleteLabel).toHaveBeenCalledWith(res, "lid");
      expect(result).toBe("deleted");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      mockLabelService.deleteLabel.mockRejectedValue(new Error("fail"));
      await expect(controller.deleteLabel(res, "lid")).rejects.toThrow("fail");
    });
  });

  describe("listLabels", () => {
    it("should call service and return labels", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const pagination: PaginationQuery = { limit: 10, page: 1 };
      mockLabelService.listLabels.mockResolvedValue("labels");
      const result = await controller.listLabels(res, pagination);
      expect(service.listLabels).toHaveBeenCalledWith(res, pagination);
      expect(result).toBe("labels");
    });

    it("should handle service error", async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const pagination: PaginationQuery = { limit: 10, page: 1 };
      mockLabelService.listLabels.mockRejectedValue(new Error("fail"));
      await expect(controller.listLabels(res, pagination)).rejects.toThrow("fail");
    });
  });
});