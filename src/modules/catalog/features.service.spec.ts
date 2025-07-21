import { Test, TestingModule } from '@nestjs/testing';
import { FeaturesService } from './features.service';
import { PrismaService } from 'src/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  CreateFeatureDto,
  UpdateFeatureDto,
  FeatureQueryDto,
  CreatePlanFeatureDto,
  UpdatePlanFeatureDto,
  PlanFeatureQueryDto,
  BulkCreatePlanFeaturesDto,
  BulkUpdatePlanFeaturesDto,
} from 'src/dtos/plan.dto';

describe('FeaturesService', () => {
  let service: FeaturesService;
  let prismaService: any;

  const mockFeature = {
    id: 'feature-1',
    name: 'Test Feature',
    description: 'Test Description',
    type: 'BOOLEAN',
    category: 'STORAGE',
    unit: null,
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPlanFeature = {
    id: 'plan-feature-1',
    planId: 'plan-1',
    featureId: 'feature-1',
    isIncluded: true,
    value: 100,
    displayOrder: 1,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    feature: mockFeature,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      feature: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      planFeature: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        createMany: jest.fn(),
        updateMany: jest.fn(),
      },
      plan: {
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeaturesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FeaturesService>(FeaturesService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFeatures', () => {
    it('should return paginated features', async () => {
      const query: FeatureQueryDto = { page: 1, limit: 10 };
      const expectedFeatures = [mockFeature];

      (prismaService.feature.findMany as jest.Mock).mockResolvedValue(expectedFeatures);
      (prismaService.feature.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getFeatures(query);

      expect(result).toEqual({
        data: expectedFeatures,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      expect(prismaService.feature.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter features by search term', async () => {
      const query: FeatureQueryDto = { search: 'test', page: 1, limit: 10 };

      (prismaService.feature.findMany as jest.Mock).mockResolvedValue([mockFeature]);
      (prismaService.feature.count as jest.Mock).mockResolvedValue(1);

      await service.getFeatures(query);

      expect(prismaService.feature.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by active status', async () => {
      const query: FeatureQueryDto = { isActive: true, page: 1, limit: 10 };

      (prismaService.feature.findMany as jest.Mock).mockResolvedValue([mockFeature]);
      (prismaService.feature.count as jest.Mock).mockResolvedValue(1);

      await service.getFeatures(query);

      expect(prismaService.feature.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false, isActive: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getFeatureById', () => {
    it('should return feature by id', async () => {
      (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(mockFeature);

      const result = await service.getFeatureById('feature-1');

      expect(result).toEqual(mockFeature);
      expect(prismaService.feature.findFirst).toHaveBeenCalledWith({
        where: { id: 'feature-1', isDeleted: false },
      });
    });

    it('should throw NotFoundException when feature not found', async () => {
      (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.getFeatureById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createFeature', () => {
    it('should create a new feature', async () => {
      const createFeatureDto: CreateFeatureDto = {
        name: 'New Feature',
        description: 'New Description',
        imageUrl: 'https://example.com/feature-image.png',
        isActive: true,
      };

      (prismaService.feature.create as jest.Mock).mockResolvedValue(mockFeature);

      const result = await service.createFeature(createFeatureDto);

      expect(result).toEqual(mockFeature);
      expect(prismaService.feature.create).toHaveBeenCalledWith({
        data: createFeatureDto,
      });
    });
  });

  describe('updateFeature', () => {
    it('should update existing feature', async () => {
      const updateFeatureDto: UpdateFeatureDto = { name: 'Updated Feature' };
      const updatedFeature = { ...mockFeature, ...updateFeatureDto };

      // Mock existing feature for getById
      (prismaService.feature.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockFeature) // First call for getById
        .mockResolvedValueOnce(null); // Second call for name uniqueness check
      (prismaService.feature.update as jest.Mock).mockResolvedValue(updatedFeature);

      const result = await service.updateFeature('feature-1', updateFeatureDto);

      expect(result).toEqual(updatedFeature);
      expect(prismaService.feature.update).toHaveBeenCalledWith({
        where: { id: 'feature-1' },
        data: { ...updateFeatureDto, updatedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException when feature not found', async () => {
      (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.updateFeature('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFeature', () => {
    it('should soft delete feature', async () => {
      const deletedFeature = { ...mockFeature, isDeleted: true, deletedAt: new Date() };

      (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(mockFeature);
      (prismaService.feature.update as jest.Mock).mockResolvedValue(deletedFeature);

      const result = await service.deleteFeature('feature-1');

      expect(result).toEqual(deletedFeature);
      expect(prismaService.feature.update).toHaveBeenCalledWith({
        where: { id: 'feature-1' },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });

          it('should throw NotFoundException when feature not found', async () => {
        (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(null);

        await expect(service.deleteFeature('non-existent')).rejects.toThrow(NotFoundException);
      });
  });

  describe('getPlanFeatures', () => {
    it('should return paginated plan features', async () => {
      const query: PlanFeatureQueryDto = { planId: 'plan-1' };

      (prismaService.planFeature.findMany as jest.Mock).mockResolvedValue([mockPlanFeature]);
      (prismaService.planFeature.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getPlanFeatures(query);

      expect(result).toEqual([mockPlanFeature]);
    });

    it('should filter by plan id', async () => {
      const query: PlanFeatureQueryDto = { planId: 'plan-1' };

      (prismaService.planFeature.findMany as jest.Mock).mockResolvedValue([mockPlanFeature]);
      (prismaService.planFeature.count as jest.Mock).mockResolvedValue(1);

      await service.getPlanFeatures(query);

      expect(prismaService.planFeature.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false, planId: 'plan-1' },
        include: { 
          feature: {
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('createPlanFeature', () => {
    it('should create a new plan feature', async () => {
      const createPlanFeatureDto: CreatePlanFeatureDto = {
        planId: 'plan-1',
        featureId: 'feature-1',
        includedLimit: 100,
        displayOrder: 1,
        isActive: true,
        unitPrice: 100,
      };

      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue({ id: 'plan-1' });
      (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(mockFeature);
      (prismaService.planFeature.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.planFeature.create as jest.Mock).mockResolvedValue(mockPlanFeature);

      const result = await service.createPlanFeature(createPlanFeatureDto);

      expect(result).toEqual(mockPlanFeature);
      expect(prismaService.planFeature.create).toHaveBeenCalledWith({
        data: createPlanFeatureDto,
        include: { 
          feature: {
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when plan not found', async () => {
      const createPlanFeatureDto: CreatePlanFeatureDto = {
        planId: 'non-existent',
        featureId: 'feature-1',
        includedLimit: 100,
      };

      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createPlanFeature(createPlanFeatureDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when feature not found', async () => {
      const createPlanFeatureDto: CreatePlanFeatureDto = {
        planId: 'plan-1',
        featureId: 'non-existent',
        includedLimit: 100,
      };

      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue({ id: 'plan-1' });
      (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.createPlanFeature(createPlanFeatureDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when plan feature already exists', async () => {
      const createPlanFeatureDto: CreatePlanFeatureDto = {
        planId: 'plan-1',
        featureId: 'feature-1',
        includedLimit: 100,
      };

      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue({ id: 'plan-1' });
      (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(mockFeature);
      (prismaService.planFeature.findFirst as jest.Mock).mockResolvedValue(mockPlanFeature);

      await expect(service.createPlanFeature(createPlanFeatureDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updatePlanFeature', () => {
    it('should update existing plan feature', async () => {
      const updatePlanFeatureDto: UpdatePlanFeatureDto = { includedLimit: 200 };
      const updatedPlanFeature = { ...mockPlanFeature, ...updatePlanFeatureDto };

      (prismaService.planFeature.findUnique as jest.Mock).mockResolvedValue(mockPlanFeature);
      (prismaService.planFeature.update as jest.Mock).mockResolvedValue(updatedPlanFeature);

      const result = await service.updatePlanFeature('plan-feature-1', updatePlanFeatureDto);

      expect(result).toEqual(updatedPlanFeature);
      expect(prismaService.planFeature.update).toHaveBeenCalledWith({
        where: { id: 'plan-feature-1' },
        data: { ...updatePlanFeatureDto, updatedAt: expect.any(Date) },
        include: { 
          feature: {
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when plan feature not found', async () => {
      (prismaService.planFeature.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updatePlanFeature('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePlanFeature', () => {
    it('should soft delete plan feature', async () => {
      const deletedPlanFeature = { ...mockPlanFeature, isDeleted: true, deletedAt: new Date() };

      (prismaService.planFeature.findUnique as jest.Mock).mockResolvedValue(mockPlanFeature);
      (prismaService.planFeature.update as jest.Mock).mockResolvedValue(deletedPlanFeature);

      const result = await service.deletePlanFeature('plan-feature-1');

      expect(result).toEqual(deletedPlanFeature);
      expect(prismaService.planFeature.update).toHaveBeenCalledWith({
        where: { id: 'plan-feature-1' },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: { 
          feature: {
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when plan feature not found', async () => {
      (prismaService.planFeature.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deletePlanFeature('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkCreatePlanFeatures', () => {
    it('should create multiple plan features', async () => {
      const bulkCreateDto: BulkCreatePlanFeaturesDto = {
        planId: 'plan-1',
        features: [
          { featureId: 'feature-1', includedLimit: 100 },
          { featureId: 'feature-2', includedLimit: 50 },
        ],
      };

      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue({ id: 'plan-1' });
      (prismaService.feature.findMany as jest.Mock).mockResolvedValue([mockFeature]);
      (prismaService.planFeature.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await service.bulkCreatePlanFeatures(bulkCreateDto);

      expect(result).toEqual({ count: 2 });
      expect(prismaService.planFeature.createMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException when plan not found', async () => {
      const bulkCreateDto: BulkCreatePlanFeaturesDto = {
        planId: 'non-existent',
        features: [
          { featureId: 'feature-1', includedLimit: 100 },
        ],
      };

      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.bulkCreatePlanFeatures(bulkCreateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkUpdatePlanFeatures', () => {
    it('should update multiple plan features', async () => {
      const bulkUpdateDto: BulkUpdatePlanFeaturesDto = {
        features: [
          { id: 'plan-feature-1', includedLimit: 200 },
          { id: 'plan-feature-2', includedLimit: 50 },
        ],
      };

      (prismaService.$transaction as jest.Mock).mockResolvedValue([mockPlanFeature]);

      const result = await service.bulkUpdatePlanFeatures(bulkUpdateDto);

      expect(result).toEqual([mockPlanFeature]);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('getFeatureUsageInPlans', () => {
    it('should return feature usage statistics', async () => {
      (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(mockFeature);
      (prismaService.plan.count as jest.Mock).mockResolvedValue(5);
      (prismaService.planFeature.count as jest.Mock).mockResolvedValue(3);

      const result = await service.getFeatureUsageInPlans('feature-1');

      expect(result).toEqual({
        feature: mockFeature,
        totalPlans: 5,
        plansUsingFeature: 3,
        usagePercentage: 60,
      });

      expect(prismaService.plan.count).toHaveBeenCalledWith({
        where: { isActive: true, isDeleted: false },
      });

      expect(prismaService.planFeature.count).toHaveBeenCalledWith({
        where: {
          featureId: 'feature-1',
          isDeleted: false,
          plan: { isActive: true, isDeleted: false },
        },
      });
    });

    it('should throw NotFoundException when feature not found', async () => {
      (prismaService.feature.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.getFeatureUsageInPlans('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
}); 