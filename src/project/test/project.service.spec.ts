import { ProjectService } from "../project.service";
import { ResponseService } from "src/common/services/response.service";
import { DatabaseService } from "src/database/database.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateProjectMemberDto,
  UpdateProjectMemberDto,
} from "../dto/project.dto";

describe("ProjectService", () => {
  let service: ProjectService;
  let db: any;
  let responseService: any;

  beforeEach(() => {
    db = {
      project: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      projectMember: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    responseService = {
      sendSuccess: jest.fn(),
      sendError: jest.fn(),
    };
    service = new ProjectService(db, responseService);
  });

  describe("createProject", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      const dto = { name: "" } as CreateProjectDto;
      await service.createProject(res, dto, "uid", "cid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Validation failed",
        expect.any(Array)
      );
    });

    it("should create project and return success", async () => {
      db.project.create.mockResolvedValue({
        id: "pid",
        name: "Proj",
        createdById: "uid",
        companyId: "cid",
      });
      const res = {} as any;
      const dto = { name: "Proj", description: "desc" } as CreateProjectDto;
      await service.createProject(res, dto, "uid", "cid");
      expect(db.project.create).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project created",
        expect.objectContaining({ id: "pid" })
      );
    });

    it("should handle errors", async () => {
      db.project.create.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      const dto = { name: "Proj", description: "desc" } as CreateProjectDto;
      await service.createProject(res, dto, "uid", "cid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Create failed",
        expect.any(String)
      );
    });
  });

  describe("getCompanyProjects", () => {
    it("should return error for invalid pagination", async () => {
      const res = {} as any;
      await service.getCompanyProjects(res, "cid", { limit: 0, page: 0 });
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Invalid pagination parameters"
      );
    });

    it("should return empty array if no projects found", async () => {
      db.project.count.mockResolvedValue(0);
      const res = {} as any;
      await service.getCompanyProjects(res, "cid", { limit: 10, page: 1 });
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "No projects found for this company",
        expect.objectContaining({
          projects: [],
          pagination: expect.any(Object),
        })
      );
    });

    it("should return projects with pagination", async () => {
      db.project.count.mockResolvedValue(2);
      db.project.findMany.mockResolvedValue([
        { id: "p1", name: "A" },
        { id: "p2", name: "B" },
      ]);
      const res = {} as any;
      await service.getCompanyProjects(res, "cid", { limit: 10, page: 1 });
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Projects fetched successfully",
        expect.objectContaining({
          projects: expect.any(Array),
          pagination: expect.any(Object),
        })
      );
    });

    it("should handle errors", async () => {
      db.project.count.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.getCompanyProjects(res, "cid", { limit: 10, page: 1 });
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Failed to fetch projects",
        expect.any(String)
      );
    });
  });

  describe("updateProject", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      await service.updateProject(res, "pid", { name: "" } as UpdateProjectDto);
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
      await service.updateProject(res, "pid", {
        name: "Proj",
      } as UpdateProjectDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project not found"
      );
    });

    it("should update project and return success", async () => {
      db.project.findUnique.mockResolvedValue({ id: "pid" });
      db.project.update.mockResolvedValue({ id: "pid", name: "Proj" });
      const res = {} as any;
      await service.updateProject(res, "pid", {
        name: "Proj",
      } as UpdateProjectDto);
      expect(db.project.update).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project updated",
        expect.objectContaining({ id: "pid" })
      );
    });

    it("should handle errors", async () => {
      db.project.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.updateProject(res, "pid", {
        name: "Proj",
      } as UpdateProjectDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Update failed",
        expect.any(String)
      );
    });
  });

  describe("deleteProject", () => {
    it("should return error if project not found", async () => {
      db.project.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.deleteProject(res, "pid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project not found"
      );
    });

    it("should delete project and return success", async () => {
      db.project.findUnique.mockResolvedValue({ id: "pid" });
      db.project.delete.mockResolvedValue({});
      const res = {} as any;
      await service.deleteProject(res, "pid");
      expect(db.project.delete).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project deleted"
      );
    });

    it("should handle errors", async () => {
      db.project.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.deleteProject(res, "pid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Delete failed",
        expect.any(String)
      );
    });
  });

  describe("getProjectById", () => {
    it("should return error if project not found", async () => {
      db.project.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.getProjectById(res, "pid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project not found"
      );
    });

    it("should fetch project and return success", async () => {
      db.project.findUnique.mockResolvedValue({ id: "pid", name: "Proj" });
      const res = {} as any;
      await service.getProjectById(res, "pid");
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project fetched successfully",
        expect.objectContaining({ id: "pid" })
      );
    });

    it("should handle errors", async () => {
      db.project.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.getProjectById(res, "pid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Failed to fetch project",
        expect.any(String)
      );
    });
  });

  describe("addProjectMember", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      await service.addProjectMember(res, {
        projectId: "",
        userId: "",
      } as CreateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project not found"
      );
    });

    it("should return error if project not found", async () => {
      db.project.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.addProjectMember(res, {
        projectId: "pid",
        userId: "uid",
      } as CreateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project not found"
      );
    });

    it("should return error if user not found", async () => {
      db.project.findUnique.mockResolvedValue({ id: "pid", companyId: "cid" });
      db.user.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.addProjectMember(res, {
        projectId: "pid",
        userId: "uid",
      } as CreateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "User not found"
      );
    });

    it("should return error if user and project company mismatch", async () => {
      db.project.findUnique.mockResolvedValue({ id: "pid", companyId: "cid1" });
      db.user.findUnique.mockResolvedValue({ id: "uid", companyId: "cid2" });
      const res = {} as any;
      await service.addProjectMember(res, {
        projectId: "pid",
        userId: "uid",
      } as CreateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "User and project must belong to the same company"
      );
    });

    it("should return error if already a member", async () => {
      db.project.findUnique.mockResolvedValue({ id: "pid", companyId: "cid" });
      db.user.findUnique.mockResolvedValue({ id: "uid", companyId: "cid" });
      db.projectMember.findFirst.mockResolvedValue({ id: "mid" });
      const res = {} as any;
      await service.addProjectMember(res, {
        projectId: "pid",
        userId: "uid",
      } as CreateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "User is already a member of this project"
      );
    });

    it("should add member and return success", async () => {
      db.project.findUnique.mockResolvedValue({ id: "pid", companyId: "cid" });
      db.user.findUnique.mockResolvedValue({ id: "uid", companyId: "cid" });
      db.projectMember.findFirst.mockResolvedValue(null);
      db.projectMember.create.mockResolvedValue({
        id: "mid",
        projectId: "pid",
        userId: "uid",
      });
      const res = {} as any;
      await service.addProjectMember(res, {
        projectId: "pid",
        userId: "uid",
      } as CreateProjectMemberDto);
      expect(db.projectMember.create).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Member added",
        expect.objectContaining({ id: "mid" })
      );
    });

    it("should handle errors", async () => {
      db.project.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.addProjectMember(res, {
        projectId: "pid",
        userId: "uid",
      } as CreateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Add member failed",
        expect.any(String)
      );
    });
  });

  describe("listProjectMembers", () => {
    it("should return error for invalid projectId", async () => {
      const res = {} as any;
      await service.listProjectMembers(res, "");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Invalid project ID"
      );
    });

    it("should return error if project not found", async () => {
      db.project.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.listProjectMembers(res, "pid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project not found"
      );
    });

    it("should list members and return success", async () => {
      db.project.findUnique.mockResolvedValue({ id: "pid" });
      db.projectMember.findMany.mockResolvedValue([
        {
          id: "mid",
          user: { id: "uid", name: "User", email: "user@mail.com" },
        },
      ]);
      const res = {} as any;
      await service.listProjectMembers(res, "pid");
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Members fetched",
        expect.any(Array)
      );
    });

    it("should handle errors", async () => {
      db.project.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.listProjectMembers(res, "pid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Fetch failed",
        expect.any(String)
      );
    });
  });

  describe("updateProjectMember", () => {
    it("should return error if validation fails", async () => {
      const res = {} as any;
      await service.updateProjectMember(res, "mid", {
        userId: "",
      } as UpdateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project member not found"
      );
    });

    it("should return error if member not found", async () => {
      db.projectMember.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.updateProjectMember(res, "mid", {
        userId: "uid",
      } as UpdateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project member not found"
      );
    });

    it("should return error if user not found when updating userId", async () => {
      db.projectMember.findUnique.mockResolvedValue({
        id: "mid",
        projectId: "pid",
      });
      db.user.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.updateProjectMember(res, "mid", {
        userId: "uid",
      } as UpdateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "User not found"
      );
    });

    it("should return error if project not found when updating userId", async () => {
      db.projectMember.findUnique.mockResolvedValue({
        id: "mid",
        projectId: "pid",
      });
      db.user.findUnique.mockResolvedValue({ id: "uid", companyId: "cid" });
      db.project.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.updateProjectMember(res, "mid", {
        userId: "uid",
      } as UpdateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project not found"
      );
    });

    it("should return error if user and project company mismatch", async () => {
      db.projectMember.findUnique.mockResolvedValue({
        id: "mid",
        projectId: "pid",
      });
      db.user.findUnique.mockResolvedValue({ id: "uid", companyId: "cid1" });
      db.project.findUnique.mockResolvedValue({ id: "pid", companyId: "cid2" });
      const res = {} as any;
      await service.updateProjectMember(res, "mid", {
        userId: "uid",
      } as UpdateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "User and project must belong to the same company"
      );
    });

    it("should update member and return success", async () => {
      db.projectMember.findUnique.mockResolvedValue({
        id: "mid",
        projectId: "pid",
      });
      db.user.findUnique.mockResolvedValue({ id: "uid", companyId: "cid" });
      db.project.findUnique.mockResolvedValue({ id: "pid", companyId: "cid" });
      db.projectMember.update.mockResolvedValue({ id: "mid", userId: "uid" });
      const res = {} as any;
      await service.updateProjectMember(res, "mid", {
        userId: "uid",
      } as UpdateProjectMemberDto);
      expect(db.projectMember.update).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Member updated",
        expect.objectContaining({ id: "mid" })
      );
    });

    it("should handle errors", async () => {
      db.projectMember.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.updateProjectMember(res, "mid", {
        userId: "uid",
      } as UpdateProjectMemberDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Update failed",
        expect.any(String)
      );
    });
  });

  describe("deleteProjectMember", () => {
    it("should return error if member not found", async () => {
      db.projectMember.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.deleteProjectMember(res, "mid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Project member not found"
      );
    });

    it("should delete member and return success", async () => {
      db.projectMember.findUnique.mockResolvedValue({ id: "mid" });
      db.projectMember.delete.mockResolvedValue({});
      const res = {} as any;
      await service.deleteProjectMember(res, "mid");
      expect(db.projectMember.delete).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Member deleted"
      );
    });

    it("should handle errors", async () => {
      db.projectMember.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.deleteProjectMember(res, "mid");
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Delete failed",
        expect.any(String)
      );
    });
  });
});
