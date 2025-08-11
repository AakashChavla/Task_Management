import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../user.controller";
import { UserService } from "../user.service";
import { Response } from "express";
import {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
} from "../dto/UserCreate.dto";
import { PaginationQuery } from "src/common/interfaces/pagination";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";

// Mock custom decorator
jest.mock("src/common/decorators/get-user.decorator", () => ({
  GetUser: () => () => undefined,
}));
jest.mock("src/common/decorators/roles.decorator", () => ({
  Roles: () => () => undefined,
}));


describe("UserController", () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    registerUser: jest.fn(),
    updateUser: jest.fn(),
    updatePassword: jest.fn(),
    listCompanyUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should call service and return registration result", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const dto: CreateUserDto = {
        name: "John",
        email: "john@example.com",
        password: "pass123",
        companyName: "Acme",
      };
      mockUserService.registerUser.mockResolvedValue("success");
      const result = await controller.registerUser(res, dto);
      expect(service.registerUser).toHaveBeenCalledWith(res, dto);
      expect(result).toBe("success");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const dto: CreateUserDto = {
        name: "John",
        email: "john@example.com",
        password: "pass123",
        companyName: "Acme",
      };
      mockUserService.registerUser.mockRejectedValue(new Error("fail"));
      await expect(controller.registerUser(res, dto)).rejects.toThrow("fail");
    });
  });

  describe("updateUser", () => {
    it("should call service and return update result", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const userId = "uid";
      const dto: UpdateUserDto = { name: "John Updated" };
      mockUserService.updateUser.mockResolvedValue("updated");
      const result = await controller.updateUser(res, userId, dto);
      expect(service.updateUser).toHaveBeenCalledWith(res, userId, dto);
      expect(result).toBe("updated");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const userId = "uid";
      const dto: UpdateUserDto = { name: "John Updated" };
      mockUserService.updateUser.mockRejectedValue(new Error("fail"));
      await expect(controller.updateUser(res, userId, dto)).rejects.toThrow(
        "fail"
      );
    });
  });

  describe("updatePassword", () => {
    it("should call service and return password update result", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const userId = "uid";
      const dto: UpdatePasswordDto = { oldPassword: "old", newPassword: "new" };
      mockUserService.updatePassword.mockResolvedValue("pw-updated");
      const result = await controller.updatePassword(res, userId, dto);
      expect(service.updatePassword).toHaveBeenCalledWith(res, userId, dto);
      expect(result).toBe("pw-updated");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const userId = "uid";
      const dto: UpdatePasswordDto = { oldPassword: "old", newPassword: "new" };
      mockUserService.updatePassword.mockRejectedValue(new Error("fail"));
      await expect(controller.updatePassword(res, userId, dto)).rejects.toThrow(
        "fail"
      );
    });
  });

  describe("listCompanyUsers", () => {
    it("should call service and return company users", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const companyId = "cid";
      const pagination: PaginationQuery = {
        limit: 10,
        page: 1,
        orderBy: "asc",
        orderField: "name",
      };
      mockUserService.listCompanyUsers.mockResolvedValue("users");
      const result = await controller.listCompanyUsers(
        res,
        companyId,
        pagination
      );
      expect(service.listCompanyUsers).toHaveBeenCalledWith(
        res,
        companyId,
        pagination
      );
      expect(result).toBe("users");
    });

    it("should handle service error", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const companyId = "cid";
      const pagination: PaginationQuery = {
        limit: 10,
        page: 1,
        orderBy: "asc",
        orderField: "name",
      };
      mockUserService.listCompanyUsers.mockRejectedValue(new Error("fail"));
      await expect(
        controller.listCompanyUsers(res, companyId, pagination)
      ).rejects.toThrow("fail");
    });
  });
});
