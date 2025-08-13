import { Test, TestingModule } from "@nestjs/testing";
import { ProjectController } from "../project.controller";
import { ProjectService } from "../project.service";
import { Response } from "express";
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateProjectMemberDto,
  UpdateProjectMemberDto,
} from "../dto/project.dto";
import { PaginationQuery } from "src/common/interfaces/pagination";
import { AuthGuard } from "src/auth/guards/auth.guard";

// Mock custom decorator
jest.mock("src/common/decorators/get-user.decorator", () => ({
  GetUser: () => () => undefined,
}));

describe("ProjectController", () => {
  let controller: ProjectController;
  let service: ProjectService;

  const mockProjectService = {
    createProject: jest.fn(),
    getCompanyProjects: jest.fn(),
    getProjectById: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
    addProjectMember: jest.fn(),
    listProjectMembers: jest.fn(),
    updateProjectMember: jest.fn(),
    deleteProjectMember: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [{ provide: ProjectService, useValue: mockProjectService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);

    jest.clearAllMocks();
  });

  describe("createProject", () => {
    it("should call service and return creation result", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const dto: CreateProjectDto = { name: "Project", description: "desc" };
      mockProjectService.createProject.mockResolvedValue("created");
      const result = await controller.createProject(res, dto, "uid", "cid");
      expect(service.createProject).toHaveBeenCalledWith(
        res,
        dto,
        "uid",
        "cid"
      );
      expect(result).toBe("created");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const dto: CreateProjectDto = { name: "Project", description: "desc" };
      mockProjectService.createProject.mockRejectedValue(new Error("fail"));
      await expect(
        controller.createProject(res, dto, "uid", "cid")
      ).rejects.toThrow("fail");
    });
  });

  describe("getCompanyProjects", () => {
    it("should call service and return projects", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const companyId = "cid";
      const pagination: PaginationQuery = { limit: 10, page: 1 };
      mockProjectService.getCompanyProjects.mockResolvedValue("projects");
      const result = await controller.getCompanyProjects(
        res,
        companyId,
        pagination
      );
      expect(service.getCompanyProjects).toHaveBeenCalledWith(
        res,
        companyId,
        pagination
      );
      expect(result).toBe("projects");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const companyId = "cid";
      const pagination: PaginationQuery = { limit: 10, page: 1 };
      mockProjectService.getCompanyProjects.mockRejectedValue(
        new Error("fail")
      );
      await expect(
        controller.getCompanyProjects(res, companyId, pagination)
      ).rejects.toThrow("fail");
    });
  });

  describe("getProjectById", () => {
    it("should call service and return project", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      mockProjectService.getProjectById.mockResolvedValue("project");
      const result = await controller.getProjectById(res, "pid");
      expect(service.getProjectById).toHaveBeenCalledWith(res, "pid");
      expect(result).toBe("project");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      mockProjectService.getProjectById.mockRejectedValue(new Error("fail"));
      await expect(controller.getProjectById(res, "pid")).rejects.toThrow(
        "fail"
      );
    });
  });

  describe("updateProject", () => {
    it("should call service and return update result", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const dto: UpdateProjectDto = { name: "Updated" };
      mockProjectService.updateProject.mockResolvedValue("updated");
      const result = await controller.updateProject(res, "pid", dto);
      expect(service.updateProject).toHaveBeenCalledWith(res, "pid", dto);
      expect(result).toBe("updated");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const dto: UpdateProjectDto = { name: "Updated" };
      mockProjectService.updateProject.mockRejectedValue(new Error("fail"));
      await expect(controller.updateProject(res, "pid", dto)).rejects.toThrow(
        "fail"
      );
    });
  });

  describe("deleteProject", () => {
    it("should call service and return delete result", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      mockProjectService.deleteProject.mockResolvedValue("deleted");
      const result = await controller.deleteProject(res, "pid");
      expect(service.deleteProject).toHaveBeenCalledWith(res, "pid");
      expect(result).toBe("deleted");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      mockProjectService.deleteProject.mockRejectedValue(new Error("fail"));
      await expect(controller.deleteProject(res, "pid")).rejects.toThrow(
        "fail"
      );
    });
  });

  describe("addProjectMember", () => {
    it("should call service and return member add result", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const dto: CreateProjectMemberDto = { projectId: "pid", userId: "uid" };
      mockProjectService.addProjectMember.mockResolvedValue("added");
      const result = await controller.addProjectMember(res, dto);
      expect(service.addProjectMember).toHaveBeenCalledWith(res, dto);
      expect(result).toBe("added");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const dto: CreateProjectMemberDto = { projectId: "pid", userId: "uid" };
      mockProjectService.addProjectMember.mockRejectedValue(new Error("fail"));
      await expect(controller.addProjectMember(res, dto)).rejects.toThrow(
        "fail"
      );
    });
  });

  describe("listProjectMembers", () => {
    it("should call service and return members", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      mockProjectService.listProjectMembers.mockResolvedValue("members");
      const result = await controller.listProjectMembers(res, "pid");
      expect(service.listProjectMembers).toHaveBeenCalledWith(res, "pid");
      expect(result).toBe("members");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      mockProjectService.listProjectMembers.mockRejectedValue(
        new Error("fail")
      );
      await expect(controller.listProjectMembers(res, "pid")).rejects.toThrow(
        "fail"
      );
    });
  });

  describe("updateProjectMember", () => {
    it("should call service and return member update result", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const dto: UpdateProjectMemberDto = { userId: "uid" };
      mockProjectService.updateProjectMember.mockResolvedValue("updated");
      const result = await controller.updateProjectMember(res, "mid", dto);
      expect(service.updateProjectMember).toHaveBeenCalledWith(res, "mid", dto);
      expect(result).toBe("updated");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const dto: UpdateProjectMemberDto = { userId: "uid" };
      mockProjectService.updateProjectMember.mockRejectedValue(
        new Error("fail")
      );
      await expect(
        controller.updateProjectMember(res, "mid", dto)
      ).rejects.toThrow("fail");
    });
  });

  describe("deleteProjectMember", () => {
    it("should call service and return member delete result", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      mockProjectService.deleteProjectMember.mockResolvedValue("deleted");
      const result = await controller.deleteProjectMember(res, "mid");
      expect(service.deleteProjectMember).toHaveBeenCalledWith(res, "mid");
      expect(result).toBe("deleted");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      mockProjectService.deleteProjectMember.mockRejectedValue(
        new Error("fail")
      );
      await expect(controller.deleteProjectMember(res, "mid")).rejects.toThrow(
        "fail"
      );
    });
  });
});
