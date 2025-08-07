import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { Response } from 'express';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { PaginationQuery } from 'src/common/interfaces/pagination';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project for the authenticated user\'s company.' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'Project created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Create failed' })
  async create(
    @Res() res: Response,
    @Body() dto: CreateProjectDto,
    @GetUser('id') userId: string,
    @GetUser('companyId') companyId: string
  ) {
    return this.projectService.createProject(res, dto, userId, companyId);
  }

  @Get('company/projects')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all projects for the authenticated user\'s company with pagination and filtering.' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Order direction (asc/desc)' })
  @ApiQuery({ name: 'orderField', required: false, type: String, description: 'Order by field (e.g. name)' })
  @ApiQuery({ name: 'query', required: false, type: String, description: 'Search by name/description' })
  @ApiResponse({ status: 200, description: 'Projects fetched successfully' })
  @ApiResponse({ status: 400, description: 'Invalid pagination parameters' })
  @ApiResponse({ status: 500, description: 'Failed to fetch projects' })
  async getCompanyProjects(
    @Res() res: Response,
    @GetUser('companyId') companyId: string,
    @Query() query: PaginationQuery
  ) {
    return this.projectService.getCompanyProjects(res, companyId, query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a project by its ID.' })
  @ApiResponse({ status: 200, description: 'Project fetched successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 400, description: 'Invalid project ID' })
  @ApiResponse({ status: 500, description: 'Failed to fetch project' })
  async getById(@Res() res: Response, @Param('id') id: string) {
    return this.projectService.getProjectById(res, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project by its ID.' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: 'Project updated' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 500, description: 'Update failed' })
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto
  ) {
    return this.projectService.updateProject(res, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project by its ID.' })
  @ApiResponse({ status: 200, description: 'Project deleted' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 400, description: 'Invalid project ID' })
  @ApiResponse({ status: 500, description: 'Delete failed' })
  async delete(@Res() res: Response, @Param('id') id: string) {
    return this.projectService.deleteProject(res, id);
  }
}