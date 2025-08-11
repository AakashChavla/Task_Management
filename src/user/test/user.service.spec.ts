import { UserService } from "../user.service";
import { ResponseService } from "src/common/services/response.service";
import { DatabaseService } from "src/database/database.service";
import { MailService } from "src/common/mail/mail.service";
import {
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from "../dto/UserCreate.dto";
import * as bcrypt from "bcrypt";

describe("UserService", () => {
  let service: UserService;
  let db: any;
  let responseService: any;
  let mailService: any;

  beforeEach(() => {
    db = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      company: {
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    responseService = {
      sendSuccess: jest.fn(),
      sendError: jest.fn(),
    };
    mailService = {
      sendEmail: jest.fn(),
      getOtpVerificationMailTemplate: jest.fn().mockReturnValue("<html>OTP</html>"),
    };
    service = new UserService(db, responseService, mailService as any);
  });

  describe("registerUser", () => {
    it("should return error if email already registered and verified", async () => {
      db.user.findUnique.mockResolvedValue({ isVerified: true });
      const res = {} as any;
      const dto = {
        name: "John",
        email: "john@example.com",
        password: "pass",
        companyName: "Acme",
      } as CreateUserDto;
      await service.registerUser(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Email already registered"
      );
    });

    it("should update unverified user and company, send OTP", async () => {
      db.user.findUnique.mockResolvedValue({ id: "uid", isVerified: false, companyId: "cid", email: "john@example.com", name: "John" });
      db.user.update.mockResolvedValue({ id: "uid", companyId: "cid", email: "john@example.com", name: "John" });
      db.company.update.mockResolvedValue({ id: "cid", companyName: "Acme", ownerId: "uid" });
      mailService.sendEmail.mockResolvedValue({});
      const res = {} as any;
      const dto = {
        name: "John",
        email: "john@example.com",
        password: "pass",
        companyName: "Acme",
      } as CreateUserDto;
      await service.registerUser(res, dto);
      expect(db.user.update).toHaveBeenCalled();
      expect(db.company.update).toHaveBeenCalled();
      expect(mailService.sendEmail).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        expect.stringContaining("User and company registered successfully"),
        expect.objectContaining({ userId: "uid", companyId: "cid" })
      );
    });

    it("should create new user and company, send OTP", async () => {
      db.user.findUnique.mockResolvedValue(null);
      db.user.create.mockResolvedValue({ id: "uid", email: "john@example.com", name: "John" });
      db.company.create.mockResolvedValue({ id: "cid", companyName: "Acme", ownerId: "uid" });
      db.user.update.mockResolvedValue({ id: "uid", companyId: "cid" });
      mailService.sendEmail.mockResolvedValue({});
      const res = {} as any;
      const dto = {
        name: "John",
        email: "john@example.com",
        password: "pass",
        companyName: "Acme",
      } as CreateUserDto;
      await service.registerUser(res, dto);
      expect(db.user.create).toHaveBeenCalled();
      expect(db.company.create).toHaveBeenCalled();
      expect(db.user.update).toHaveBeenCalled();
      expect(mailService.sendEmail).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        expect.stringContaining("User and company registered successfully"),
        expect.objectContaining({ userId: "uid", companyId: "cid" })
      );
    });

    it("should handle registration errors", async () => {
      db.user.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      const dto = {
        name: "John",
        email: "john@example.com",
        password: "pass",
        companyName: "Acme",
      } as CreateUserDto;
      await service.registerUser(res, dto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Registration failed",
        expect.any(String)
      );
    });
  });

  describe("updateUser", () => {
    it("should return error if user not found", async () => {
      db.user.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.updateUser(res, "uid", {} as UpdateUserDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "User not found"
      );
    });

    it("should update user and company", async () => {
      db.user.findUnique.mockResolvedValue({ id: "uid", companyId: "cid", company: {} });
      db.user.update.mockResolvedValue({ id: "uid", name: "John Updated" });
      db.company.update.mockResolvedValue({ id: "cid", companyName: "Acme Updated" });
      const res = {} as any;
      const dto = { name: "John Updated", companyName: "Acme Updated" } as UpdateUserDto;
      await service.updateUser(res, "uid", dto);
      expect(db.user.update).toHaveBeenCalled();
      expect(db.company.update).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "User updated successfully",
        expect.objectContaining({
          user: expect.objectContaining({ id: "uid" }),
          company: expect.objectContaining({ id: "cid" }),
        })
      );
    });

    it("should update only user if companyName not provided", async () => {
      db.user.findUnique.mockResolvedValue({ id: "uid", companyId: "cid", company: {} });
      db.user.update.mockResolvedValue({ id: "uid", name: "John Updated" });
      const res = {} as any;
      const dto = { name: "John Updated" } as UpdateUserDto;
      await service.updateUser(res, "uid", dto);
      expect(db.user.update).toHaveBeenCalled();
      expect(db.company.update).not.toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "User updated successfully",
        expect.objectContaining({
          user: expect.objectContaining({ id: "uid" }),
          company: null,
        })
      );
    });

    it("should handle update errors", async () => {
      db.user.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.updateUser(res, "uid", {} as UpdateUserDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Update failed",
        expect.any(String)
      );
    });
  });

  describe("updatePassword", () => {
    it("should return error if user not found", async () => {
      db.user.findUnique.mockResolvedValue(null);
      const res = {} as any;
      await service.updatePassword(res, "uid", { oldPassword: "old", newPassword: "new" } as UpdatePasswordDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "User not found"
      );
    });

    it("should return error if old password is incorrect", async () => {
      const hashed = await bcrypt.hash("oldpass", 10);
      db.user.findUnique.mockResolvedValue({ password: hashed });
      const res = {} as any;
      await service.updatePassword(res, "uid", { oldPassword: "wrongpass", newPassword: "newpass" } as UpdatePasswordDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Old password is incorrect"
      );
    });

    it("should update password successfully", async () => {
      const hashed = await bcrypt.hash("oldpass", 10);
      db.user.findUnique.mockResolvedValue({ password: hashed });
      db.user.update.mockResolvedValue({});
      const res = {} as any;
      await service.updatePassword(res, "uid", { oldPassword: "oldpass", newPassword: "newpass" } as UpdatePasswordDto);
      expect(db.user.update).toHaveBeenCalled();
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Password updated successfully"
      );
    });

    it("should handle password update errors", async () => {
      db.user.findUnique.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.updatePassword(res, "uid", { oldPassword: "old", newPassword: "new" } as UpdatePasswordDto);
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Password update failed",
        expect.any(String)
      );
    });
  });

  describe("listCompanyUsers", () => {
    it("should list company users with pagination", async () => {
      db.user.count.mockResolvedValue(2);
      db.user.findMany.mockResolvedValue([
        { id: "u1", name: "A", email: "a@x.com" },
        { id: "u2", name: "B", email: "b@x.com" },
      ]);
      const res = {} as any;
      await service.listCompanyUsers(res, "cid", {
        limit: 10,
        page: 1,
        orderBy: "asc",
        orderField: "name",
      });
      expect(responseService.sendSuccess).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Company users fetched successfully",
        expect.objectContaining({
          users: expect.any(Array),
          pagination: expect.any(Object),
        })
      );
    });

    it("should handle errors in listing company users", async () => {
      db.user.count.mockRejectedValue(new Error("DB error"));
      const res = {} as any;
      await service.listCompanyUsers(res, "cid", {
        limit: 10,
        page: 1,
        orderBy: "asc",
        orderField: "name",
      });
      expect(responseService.sendError).toHaveBeenCalledWith(
        res,
        expect.any(Number),
        "Failed to fetch company users",
        expect.any(String)
      );
    });
  });
});