import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  Get,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from 'src/user/dto/UserCreate.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { GetUser } from 'src/common/decorators/auth-decorator';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 404, description: 'User Not Found' })
  @ApiResponse({ status: 400, description: 'Project name is required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createProject(
    @Res() res: Response,
    @GetUser('id') userId: string,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    // userId from JWT payload (set by JwtStrategy)
    return this.projectService.createProject(res, createProjectDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Projects fetched successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllProjects(@Res() res: Response) {
    return this.projectService.getAllProjects(res);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project fetched successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getProjectById(@Res() res: Response, @Param('id') id: string) {
    return this.projectService.getProjectById(res, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project deleted permanently' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async hardDeleteProject(@Res() res: Response, @Param('id') id: string) {
    return this.projectService.hardDeleteProject(res, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({
    type: CreateProjectDto,
    description: 'Fields to update (partial allowed)',
  })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateProject(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateProjectDto>,
  ) {
    return this.projectService.updateProject(res, id, updateDto);
  }
}
