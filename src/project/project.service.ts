import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ResponseService } from 'src/common/services/response.service';
import { DatabaseService } from 'src/database/database.service';
import { CreateProjectDto } from './dto/project.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);
  constructor(
    private readonly db: DatabaseService,
    private readonly userService: UserService,
    private readonly responService: ResponseService,
  ) {}

  async createProject(
    res: Response,
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<Response> {
    try {
      const userDetails = await this.db.user.findFirst({
        where: { id: userId },
      });

      if (!userDetails) {
        return this.responService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          'User Not Found',
        );
      }

      const { name, description } = createProjectDto;
      if (!name) {
        return this.responService.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          'Project name is required',
        );
      }

      const project = await this.db.project.create({
        data: {
          name,
          description,
          createdById: userId,
        },
      });

      return this.responService.sendSuccess(
        res,
        HttpStatus.CREATED,
        'Project created successfully',
        project,
      );
    } catch (error) {
      return this.responService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal server error',
      );
    }
  }

  async getProjectById(res: Response, projectId: string) {
    try {
      const project = await this.db.project.findFirst({
        where: { id: projectId },
        include: { createdBy: true }, // Fetch the user who created the project
      });

      if (!project) {
        return this.responService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          'Project not found',
        );
      }

      return this.responService.sendSuccess(
        res,
        HttpStatus.OK,
        'Project fetched successfully',
        project,
      );
    } catch (error) {
      this.logger.error(
        'Error occurred while getting the project by Id',
        error.message,
      );
      return this.responService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal server error',
      );
    }
  }

  async updateProject(
    res: Response,
    projectId: string,
    updateDto: Partial<CreateProjectDto>,
  ): Promise<Response> {
    try {
      const project = await this.db.project.findFirst({
        where: { id: projectId },
      });

      if (!project) {
        return this.responService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          'Project not found',
        );
      }

      const updatedProject = await this.db.project.update({
        where: { id: projectId },
        data: {
          ...updateDto,
        },
      });

      return this.responService.sendSuccess(
        res,
        HttpStatus.OK,
        'Project updated successfully',
        updatedProject,
      );
    } catch (error) {
      this.logger.error(
        'Error occurred while updating the project',
        error.message,
      );
      return this.responService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal server error',
      );
    }
  }

  async hardDeleteProject(res: Response, projectId: string): Promise<Response> {
    try {
      const project = await this.db.project.findFirst({
        where: { id: projectId },
      });

      if (!project) {
        return this.responService.sendError(
          res,
          HttpStatus.NOT_FOUND,
          'Project not found',
        );
      }

      await this.db.project.delete({
        where: { id: projectId },
      });

      return this.responService.sendSuccess(
        res,
        HttpStatus.OK,
        'Project deleted permanently',
      );
    } catch (error) {
      this.logger.error(
        'Error occurred while hard deleting the project',
        error.message,
      );
      return this.responService.sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal server error',
      );
    }
  }

  async getAllProjects(res: Response): Promise<Response> {
  try {
    const projects = await this.db.project.findMany({
      include: { createdBy: true },
      orderBy: { createdAt: 'desc' },
    });

    return this.responService.sendSuccess(
      res,
      HttpStatus.OK,
      'Projects fetched successfully',
      projects,
    );
  } catch (error) {
    this.logger.error(
      'Error occurred while fetching all projects',
      error.message,
    );
    return this.responService.sendError(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
    );
  }
}
}
