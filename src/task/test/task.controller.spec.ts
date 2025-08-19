import { TaskService, ListTasksQuery } from "../task.service";
import { CreateTaskDto, UpdateTaskDto } from "../dto/task.dto";

describe("TaskService", () => {
  let service: TaskService;
  let db: any;
  let responseService: any;

  beforeEach(() => {
    db = {
      task: {
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
      user: {
        findUnique: jest.fn(),
      },
    };
    responseService = {
      sendSuccess: jest.fn(),
      sendError: jest.fn(),
    };
    service = new TaskService(db, responseService);
  });

  describe("createTask", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      const dto = { title: "", projectId: "" } as CreateTaskDto;
      await service.createTask(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project not found"
      );
    });

    it("should return error if project not found", async () => {
      db.project.findUnique.mockResolvedValue(null);
      const res = {} as any;
      const dto = { title: "Task", projectId: "pid" } as CreateTaskDto;
      await service.createTask(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project not found"
      );
    });

    it("should return error if assigned user not found", async () => {
      db.project.findUnique.mockResolvedValue({ id: "pid" });
      db.user.findUnique.mockResolvedValue(null);
      const res = {} as any;
      const dto = {
        title: "Task",
        projectId: "pid",
        assignedToId: "uid",
      } as CreateTaskDto;
      await service.createTask(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Assigned user not found"
      );
    });

    it("should create task and return success", async () => {
      db.project.findUnique.mockResolvedValue({ id: "pid" });
      db.user.findUnique.mockResolvedValue({ id: "uid" });
      db.task.create.mockResolvedValue({ id: "tid", title: "Task" });
      const res = {} as any;
      const dto = {
        title: "Task",
        projectId: "pid",
        assignedToId: "uid",
      } as CreateTaskDto;
      await service.createTask(res, dto);
      expect(db.task.create).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task created",
        expect.objectContaining({ id: "tid" })
      );
    });

    it("should handle errors", async () => {
      db.project.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      const dto = { title: "Task", projectId: "pid" } as CreateTaskDto;
      await service.createTask(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Create failed",
        expect.any(String)
      );
    });
  });

  describe("getTaskById", () => {
    it("should return error if task not found", async () => {
      db.task.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.getTaskById(res, "tid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task not found"
      );
    });

    it("should fetch task and return success", async () => {
      db.task.findUnique.mockResolvedValue({ id: "tid", title: "Task" });
      const res = {} as any;
      await service.getTaskById(res, "tid");
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task fetched",
        expect.objectContaining({ id: "tid" })
      );
    });

    it("should handle errors", async () => {
      db.task.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.getTaskById(res, "tid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Fetch failed",
        expect.any(String)
      );
    });
  });

  describe("updateTask", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      await service.updateTask(res, "tid", { title: "" } as UpdateTaskDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task not found"
      );
    });

    it("should return error if task not found", async () => {
      db.task.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.updateTask(res, "tid", { title: "Task" } as UpdateTaskDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task not found"
      );
    });

    it("should update task and return success", async () => {
      db.task.findUnique.mockResolvedValue({ id: "tid" });
      db.task.update.mockResolvedValue({ id: "tid", title: "Task Updated" });
      const res = {} as any;
      await service.updateTask(res, "tid", {
        title: "Task Updated",
      } as UpdateTaskDto);
      expect(db.task.update).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task updated",
        expect.objectContaining({ id: "tid" })
      );
    });

    it("should handle errors", async () => {
      db.task.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.updateTask(res, "tid", {
        title: "Task Updated",
      } as UpdateTaskDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Update failed",
        expect.any(String)
      );
    });
  });

  describe("deleteTask", () => {
    it("should return error if task not found", async () => {
      db.task.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.deleteTask(res, "tid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task not found"
      );
    });

    it("should delete task and return success", async () => {
      db.task.findUnique.mockResolvedValue({ id: "tid" });
      db.task.delete.mockResolvedValue({});
      const res = {} as any;
      await service.deleteTask(res, "tid");
      expect(db.task.delete).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Task deleted"
      );
    });

    it("should handle errors", async () => {
      db.task.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.deleteTask(res, "tid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Delete failed",
        expect.any(String)
      );
    });
  });

  describe("listTasks", () => {
    it("should list tasks for a project", async () => {
      db.task.findMany.mockResolvedValue([{ id: "tid", title: "Task" }]);
      const res = {} as any;
      await service.listTasks(res, "pid");
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Tasks fetched",
        expect.any(Array)
      );
    });

    it("should handle errors", async () => {
      db.task.findMany.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.listTasks(res, "pid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Fetch failed",
        expect.any(String)
      );
    });
  });

  describe("getTasks", () => {
    it("should return paginated tasks with filters", async () => {
      db.task.count.mockResolvedValue(2);
      db.task.findMany.mockResolvedValue([
        { id: "t1", title: "A" },
        { id: "t2", title: "B" },
      ]);
      const res = {} as any;
      const query: ListTasksQuery = { projectId: "pid", limit: 10, page: 1 };
      await service.getTasks(res, query);
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Tasks fetched",
        expect.objectContaining({
          tasks: expect.any(Array),
          pagination: expect.any(Object),
        })
      );
    });

    it("should handle errors in getTasks", async () => {
      db.task.count.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      const query: ListTasksQuery = { projectId: "pid", limit: 10, page: 1 };
      await service.getTasks(res, query);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Fetch failed",
        expect.any(String)
      );
    });
  });
});
