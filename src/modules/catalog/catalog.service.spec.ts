import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { PrismaService } from 'src/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  CreateWorkspaceFeatureUsageDto,
  UpdateWorkspaceFeatureUsageDto,
  CreatePlanTemplateDto,
  UpdatePlanTemplateDto,
  PlanTemplateQueryDto,
  CreatePlanTemplateFeatureDto,
  UpdatePlanTemplateFeatureDto,
} from 'src/dtos/plan.dto';

describe('CatalogService', () => {
  let service: CatalogService;
  let prismaService: any;

  const mockWorkspace = {
    id: 'workspace-1',
    name: 'Test Workspace',
    isActive: true,
  };

  const mockOfficeLocation = {
    id: 'location-1',
    label: 'Test Location',
    isActive: true,
  };

  const mockFeature = {
    id: 'feature-1',
    name: 'Test Feature',
    isActive: true,
    isDeleted: false,
  };

  const mockWorkspaceFeatureUsage = {
    id: 'usage-1',
    workspaceId: 'workspace-1',
    officeLocationId: 'location-1',
    featureId: 'feature-1',
    usedAmount: 10,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    workspace: mockWorkspace,
    officeLocation: mockOfficeLocation,
    feature: mockFeature,
  };

  const mockPlanTemplate = {
    id: 'template-1',
    name: 'Test Template',
    description: 'Test Description',
    category: 'BASIC',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPlanTemplateFeature = {
    id: 'template-feature-1',
    templateId: 'template-1',
    featureId: 'feature-1',
    isIncluded: true,
    value: 100,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    feature: mockFeature,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      workspace: {
        findFirst: jest.fn(),
      },
      officeLocation: {
        findFirst: jest.fn(),
      },
      feature: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      workspaceFeatureUsage: {
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
        upsert: jest.fn(),
      },
      planTemplate: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      planTemplateFeature: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWorkspaceFeatureUsage', () => {
    it('should create workspace feature usage', async () => {
      const createDto: CreateWorkspaceFeatureUsageDto = {
        workspaceId: 'workspace-1',
        officeLocationId: 'location-1',
        featureId: 'feature-1',
        usedCount: 10,
        usedAt: new Date(),
      };

      (prismaService.workspace.findFirst as jest.Mock).mockResolvedValue(mockWorkspace);
      (prismaService.officeLocation.findFirst as jest.Mock).mockResolvedValue(mockOfficeLocation);
      (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(mockFeature);
      (prismaService.workspaceFeatureUsage.create as jest.Mock).mockResolvedValue(mockWorkspaceFeatureUsage);

      const result = await service.createWorkspaceFeatureUsage(createDto);

      expect(result).toEqual(mockWorkspaceFeatureUsage);
      expect(prismaService.workspaceFeatureUsage.create).toHaveBeenCalledWith({
        data: { ...createDto, lastUsedAt: expect.any(Date) },
        include: {
          workspace: true,
          officeLocation: true,
          feature: true,
        },
      });
    });

    it('should throw NotFoundException when workspace not found', async () => {
      const createDto: CreateWorkspaceFeatureUsageDto = {
        workspaceId: 'non-existent',
        officeLocationId: 'location-1',
        featureId: 'feature-1',
        usedCount: 10,
        usedAt: new Date(),
      };

      (prismaService.workspace.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.createWorkspaceFeatureUsage(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when office location not found', async () => {
      const createDto: CreateWorkspaceFeatureUsageDto = {
        workspaceId: 'workspace-1',
        officeLocationId: 'non-existent',
        featureId: 'feature-1',
        usedCount: 10,
        usedAt: new Date(),
      };

      (prismaService.workspace.findFirst as jest.Mock).mockResolvedValue(mockWorkspace);
      (prismaService.officeLocation.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.createWorkspaceFeatureUsage(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when feature not found', async () => {
      const createDto: CreateWorkspaceFeatureUsageDto = {
        workspaceId: 'workspace-1',
        officeLocationId: 'location-1',
        featureId: 'non-existent',
        usedCount: 10,
        usedAt: new Date(),
      };

      (prismaService.workspace.findFirst as jest.Mock).mockResolvedValue(mockWorkspace);
      (prismaService.officeLocation.findFirst as jest.Mock).mockResolvedValue(mockOfficeLocation);
      (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.createWorkspaceFeatureUsage(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateWorkspaceFeatureUsage', () => {
    it('should update workspace feature usage', async () => {
      const updateDto: UpdateWorkspaceFeatureUsageDto = { usedCount: 20 };
      const updatedUsage = { ...mockWorkspaceFeatureUsage, ...updateDto };

      (prismaService.workspaceFeatureUsage.update as jest.Mock).mockResolvedValue(updatedUsage);

      const result = await service.updateWorkspaceFeatureUsage('usage-1', updateDto);

      expect(result).toEqual(updatedUsage);
      expect(prismaService.workspaceFeatureUsage.update).toHaveBeenCalledWith({
        where: { id: 'usage-1' },
        data: { ...updateDto, updatedAt: expect.any(Date) },
        include: {
          workspace: true,
          officeLocation: true,
          feature: true,
        },
      });
    });
  });

  describe('incrementWorkspaceFeatureUsage', () => {
    it('should increment workspace feature usage', async () => {
      const updatedUsage = { ...mockWorkspaceFeatureUsage, usedAmount: 11 };

      (prismaService.workspaceFeatureUsage.upsert as jest.Mock).mockResolvedValue(updatedUsage);

      const result = await service.incrementWorkspaceFeatureUsage(
        'workspace-1',
        'location-1',
        'feature-1',
        1
      );

      expect(result).toEqual(updatedUsage);
      expect(prismaService.workspaceFeatureUsage.upsert).toHaveBeenCalledWith({
        where: {
          workspaceId_officeLocationId_featureId: {
            workspaceId: 'workspace-1',
            officeLocationId: 'location-1',
            featureId: 'feature-1',
          },
        },
        create: {
          workspaceId: 'workspace-1',
          officeLocationId: 'location-1',
          featureId: 'feature-1',
          usedAmount: 1,
          lastUsedAt: expect.any(Date),
        },
        update: {
          usedAmount: { increment: 1 },
          lastUsedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: {
          workspace: true,
          officeLocation: true,
          feature: true,
        },
      });
    });
  });

  describe('getPlanTemplates', () => {
    it('should return paginated plan templates', async () => {
      const query: PlanTemplateQueryDto = { page: 1, limit: 10 };
      const expectedTemplates = [mockPlanTemplate];

      (prismaService.planTemplate.findMany as jest.Mock).mockResolvedValue(expectedTemplates);
      (prismaService.planTemplate.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getPlanTemplates(query);

      expect(result).toEqual({
        data: expectedTemplates,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      expect(prismaService.planTemplate.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        skip: 0,
        take: 10,
        include: {
          features: {
            where: { isDeleted: false },
            include: { feature: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter templates by search term', async () => {
      const query: PlanTemplateQueryDto = { search: 'test', page: 1, limit: 10 };

      (prismaService.planTemplate.findMany as jest.Mock).mockResolvedValue([mockPlanTemplate]);
      (prismaService.planTemplate.count as jest.Mock).mockResolvedValue(1);

      await service.getPlanTemplates(query);

      expect(prismaService.planTemplate.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        include: {
          features: {
            where: { isDeleted: false },
            include: { feature: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by active status', async () => {
      const query: PlanTemplateQueryDto = { isActive: true, page: 1, limit: 10 };

      (prismaService.planTemplate.findMany as jest.Mock).mockResolvedValue([mockPlanTemplate]);
      (prismaService.planTemplate.count as jest.Mock).mockResolvedValue(1);

      await service.getPlanTemplates(query);

      expect(prismaService.planTemplate.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false, isActive: true },
        skip: 0,
        take: 10,
        include: {
          features: {
            where: { isDeleted: false },
            include: { feature: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getActivePlanTemplates', () => {
    it('should return only active plan templates', async () => {
      (prismaService.planTemplate.findMany as jest.Mock).mockResolvedValue([mockPlanTemplate]);

      const result = await service.getActivePlanTemplates();

      expect(result).toEqual([mockPlanTemplate]);
      expect(prismaService.planTemplate.findMany).toHaveBeenCalledWith({
        where: { isActive: true, isDeleted: false },
        include: {
          features: {
            where: { isDeleted: false },
            include: { feature: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('getPlanTemplateById', () => {
    it('should return plan template by id', async () => {
      (prismaService.planTemplate.findUnique as jest.Mock).mockResolvedValue(mockPlanTemplate);

      const result = await service.getPlanTemplateById('template-1');

      expect(result).toEqual(mockPlanTemplate);
      expect(prismaService.planTemplate.findUnique).toHaveBeenCalledWith({
        where: { id: 'template-1', isDeleted: false },
        include: {
          features: {
            where: { isDeleted: false },
            include: { feature: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    });

    it('should throw NotFoundException when template not found', async () => {
      (prismaService.planTemplate.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getPlanTemplateById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPlanTemplate', () => {
    it('should create a new plan template', async () => {
      const createTemplateDto: CreatePlanTemplateDto = {
        name: 'New Template',
        description: 'New Description',
        slug: 'new-template',
        priceMonthly: 1000,
        priceYearly: 10000,
        currency: 'USD',
        isActive: true, 
        imageUrl: 'https://example.com/template-image.png',
        features: [
          { featureId: 'feature-1', includedLimit: 100, displayOrder: 1 },
        ],
      };

      (prismaService.planTemplate.create as jest.Mock).mockResolvedValue(mockPlanTemplate);

      const result = await service.createPlanTemplate(createTemplateDto);

      expect(result).toEqual(mockPlanTemplate);
      expect(prismaService.planTemplate.create).toHaveBeenCalledWith({
        data: createTemplateDto,
        include: {
          features: {
            where: { isDeleted: false },
            include: { feature: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    });
  });

  describe('updatePlanTemplate', () => {
    it('should update existing plan template', async () => {
      const updateTemplateDto: UpdatePlanTemplateDto = { name: 'Updated Template' };
      const updatedTemplate = { ...mockPlanTemplate, ...updateTemplateDto };

      (prismaService.planTemplate.findUnique as jest.Mock).mockResolvedValue(mockPlanTemplate);
      (prismaService.planTemplate.update as jest.Mock).mockResolvedValue(updatedTemplate);

      const result = await service.updatePlanTemplate('template-1', updateTemplateDto);

      expect(result).toEqual(updatedTemplate);
      expect(prismaService.planTemplate.update).toHaveBeenCalledWith({
        where: { id: 'template-1' },
        data: { ...updateTemplateDto, updatedAt: expect.any(Date) },
        include: {
          features: {
            where: { isDeleted: false },
            include: { feature: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    });

    it('should throw NotFoundException when template not found', async () => {
      (prismaService.planTemplate.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updatePlanTemplate('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePlanTemplate', () => {
    it('should soft delete plan template', async () => {
      const deletedTemplate = { ...mockPlanTemplate, isDeleted: true, deletedAt: new Date() };

      (prismaService.planTemplate.findUnique as jest.Mock).mockResolvedValue(mockPlanTemplate);
      (prismaService.planTemplate.update as jest.Mock).mockResolvedValue(deletedTemplate);

      const result = await service.deletePlanTemplate('template-1');

      expect(result).toEqual(deletedTemplate);
      expect(prismaService.planTemplate.update).toHaveBeenCalledWith({
        where: { id: 'template-1' },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: {
          features: {
            where: { isDeleted: false },
            include: { feature: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    });

    it('should throw NotFoundException when template not found', async () => {
      (prismaService.planTemplate.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deletePlanTemplate('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addFeatureToTemplate', () => {
    it('should add feature to template', async () => {
      const addFeatureDto: CreatePlanTemplateFeatureDto = {
        featureId: 'feature-1',
        includedLimit: 100,
        displayOrder: 1,
      };

      (prismaService.planTemplate.findUnique as jest.Mock).mockResolvedValue(mockPlanTemplate);
      (prismaService.feature.findUnique as jest.Mock).mockResolvedValue(mockFeature);
      (prismaService.planTemplateFeature.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.planTemplateFeature.create as jest.Mock).mockResolvedValue(mockPlanTemplateFeature);

      const result = await service.addFeatureToTemplate('template-1', addFeatureDto);

      expect(result).toEqual(mockPlanTemplateFeature);
      expect(prismaService.planTemplateFeature.create).toHaveBeenCalledWith({
        data: {
          templateId: 'template-1',
          ...addFeatureDto,
        },
        include: { feature: true },
      });
    });

    it('should throw NotFoundException when template not found', async () => {
      const addFeatureDto: CreatePlanTemplateFeatureDto = {
        featureId: 'feature-1',
        includedLimit: 100,
      };

      (prismaService.planTemplate.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.addFeatureToTemplate('non-existent', addFeatureDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when feature already exists in template', async () => {
      const addFeatureDto: CreatePlanTemplateFeatureDto = {
        featureId: 'feature-1',
        includedLimit: 100,
      };

      (prismaService.planTemplate.findUnique as jest.Mock).mockResolvedValue(mockPlanTemplate);
      (prismaService.feature.findUnique as jest.Mock).mockResolvedValue(mockFeature);
      (prismaService.planTemplateFeature.findFirst as jest.Mock).mockResolvedValue(mockPlanTemplateFeature);

      await expect(service.addFeatureToTemplate('template-1', addFeatureDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateTemplateFeature', () => {
    it('should update template feature', async () => {
      const updateFeatureDto: UpdatePlanTemplateFeatureDto = { includedLimit: 200 };
      const updatedFeature = { ...mockPlanTemplateFeature, ...updateFeatureDto };

      (prismaService.planTemplateFeature.findUnique as jest.Mock).mockResolvedValue(mockPlanTemplateFeature);
      (prismaService.planTemplateFeature.update as jest.Mock).mockResolvedValue(updatedFeature);

      const result = await service.updateTemplateFeature('template-1', 'feature-1', updateFeatureDto);

      expect(result).toEqual(updatedFeature);
      expect(prismaService.planTemplateFeature.update).toHaveBeenCalledWith({
        where: {
          templateId_featureId: {
            templateId: 'template-1',
            featureId: 'feature-1',
          },
        },
        data: { ...updateFeatureDto, updatedAt: expect.any(Date) },
        include: { feature: true },
      });
    });

    it('should throw NotFoundException when template feature not found', async () => {
      (prismaService.planTemplateFeature.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateTemplateFeature('template-1', 'feature-1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFeatureFromTemplate', () => {
    it('should remove feature from template', async () => {
      const deletedFeature = { ...mockPlanTemplateFeature, isDeleted: true };

      (prismaService.planTemplateFeature.findUnique as jest.Mock).mockResolvedValue(mockPlanTemplateFeature);
      (prismaService.planTemplateFeature.delete as jest.Mock).mockResolvedValue(deletedFeature);

      const result = await service.removeFeatureFromTemplate('template-1', 'feature-1');

      expect(result).toEqual({ success: true, message: 'Feature removed from template successfully' });
      expect(prismaService.planTemplateFeature.delete).toHaveBeenCalledWith({
        where: {
          templateId_featureId: {
            templateId: 'template-1',
            featureId: 'feature-1',
          },
        },
      });
    });

    it('should throw NotFoundException when template feature not found', async () => {
      (prismaService.planTemplateFeature.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.removeFeatureFromTemplate('template-1', 'feature-1')).rejects.toThrow(NotFoundException);
    });
  });
}); 