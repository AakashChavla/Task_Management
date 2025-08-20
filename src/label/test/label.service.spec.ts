import { LabelService } from "../label.service";
import { CreateLabelDto, UpdateLabelDto } from "../dto/label.dto";

describe("LabelService", () => {
  let service: LabelService;
  let db: any;
  let responseService: any;

  beforeEach(() => {
    db = {
      label: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };
    responseService = {
      sendSuccess: jest.fn(),
      sendError: jest.fn(),
    };
    service = new LabelService(db, responseService);
  });

  describe("createLabel", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      const dto = { name: "" } as CreateLabelDto;
      await service.createLabel(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Validation failed",
        expect.any(Array)
      );
    });

    it("should create label and return success", async () => {
      db.label.create.mockResolvedValue({ id: "lid", name: "Bug" });
      const res = {} as any;
      const dto = { name: "Bug" } as CreateLabelDto;
      await service.createLabel(res, dto);
      expect(db.label.create).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Label created",
        expect.objectContaining({ id: "lid" })
      );
    });

    it("should handle errors", async () => {
      db.label.create.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      const dto = { name: "Bug" } as CreateLabelDto;
      await service.createLabel(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Create failed",
        expect.any(String)
      );
    });
  });

  describe("getLabelById", () => {
    it("should return error if label not found", async () => {
      db.label.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.getLabelById(res, "lid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Label not found"
      );
    });

    it("should fetch label and return success", async () => {
      db.label.findUnique.mockResolvedValue({ id: "lid", name: "Bug", tasks: [] });
      const res = {} as any;
      await service.getLabelById(res, "lid");
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Label fetched",
        expect.objectContaining({ id: "lid" })
      );
    });

    it("should handle errors", async () => {
      db.label.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.getLabelById(res, "lid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Fetch failed",
        expect.any(String)
      );
    });
  });

  describe("updateLabel", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      await service.updateLabel(res, "lid", { name: "" } as UpdateLabelDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Validation failed",
        expect.any(Array)
      );
    });

    it("should return error if label not found", async () => {
      db.label.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.updateLabel(res, "lid", { name: "Bug" } as UpdateLabelDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Label not found"
      );
    });

    it("should update label and return success", async () => {
      db.label.findUnique.mockResolvedValue({ id: "lid" });
      db.label.update.mockResolvedValue({ id: "lid", name: "Feature" });
      const res = {} as any;
      await service.updateLabel(res, "lid", { name: "Feature" } as UpdateLabelDto);
      expect(db.label.update).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Label updated",
        expect.objectContaining({ id: "lid" })
      );
    });

    it("should handle errors", async () => {
      db.label.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.updateLabel(res, "lid", { name: "Feature" } as UpdateLabelDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Update failed",
        expect.any(String)
      );
    });
  });

  describe("deleteLabel", () => {
    it("should return error if label not found", async () => {
      db.label.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.deleteLabel(res, "lid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Label not found"
      );
    });

    it("should delete label and return success", async () => {
      db.label.findUnique.mockResolvedValue({ id: "lid" });
      db.label.delete.mockResolvedValue({});
      const res = {} as any;
      await service.deleteLabel(res, "lid");
      expect(db.label.delete).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Label deleted"
      );
    });

    it("should handle errors", async () => {
      db.label.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.deleteLabel(res, "lid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Delete failed",
        expect.any(String)
      );
    });
  });

  describe("listLabels", () => {
    it("should return paginated labels", async () => {
      db.label.count.mockResolvedValue(2);
      db.label.findMany.mockResolvedValue([
        { id: "l1", name: "Bug", tasks: [] },
        { id: "l2", name: "Feature", tasks: [] },
      ]);
      const res = {} as any;
      await service.listLabels(res, { limit: 10, page: 1 });
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Labels fetched",
        expect.objectContaining({
          labels: expect.any(Array),
          pagination: expect.any(Object),
        })
      );
    });

    it("should handle errors", async () => {
      db.label.count.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.listLabels(res, { limit: 10, page: 1 });
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Fetch failed",
        expect.any(String)
      );
    });
  });
});