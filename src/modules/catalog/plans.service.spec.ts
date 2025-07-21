import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { PrismaService } from 'src/prisma.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanQueryDto,
  CreatePlanPriceDto,
  UpdatePlanPriceDto,
  PlanPriceQueryDto,
  CreatePlanFromTemplateDto,
  CreatePlanWithFeaturesDto,
  BillingCycle,
} from 'src/dtos/plan.dto';

describe('PlansService', () => {
  let service: PlansService;
  let prismaService: any;

  const mockOfficeLocation = {
    id: 'location-1',
    label: 'Test Location',
    city: 'Test City',
    state: 'Test State',
  };

  const mockPlan = {
    id: 'plan-1',
    name: 'Test Plan',
    description: 'Test Description',
    slug: 'test-plan',
    imageUrl: 'https://example.com/image.png',
    officeLocationId: 'location-1',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    officeLocation: mockOfficeLocation,
  };

  const mockPlanPrice = {
    id: 'price-1',
    planId: 'plan-1',
    billingCycle: 'MONTHLY',
    amount: 2999,
    currency: 'USD',
    description: 'Monthly subscription',
    stripePriceId: 'price_test',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    plan: mockPlan,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      plan: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      planPrice: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      officeLocation: {
        findUnique: jest.fn(),
      },
      planTemplate: {
        findUnique: jest.fn(),
      },
      feature: {
        findMany: jest.fn(),
      },
      planFeature: {
        createMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlans', () => {
    it('should return paginated plans', async () => {
      const query: PlanQueryDto = { page: 1, limit: 10 };
      const expectedPlans = [mockPlan];

      (prismaService.plan.findMany as jest.Mock).mockResolvedValue(expectedPlans);
      (prismaService.plan.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getPlans(query);

      expect(result).toEqual({
        data: expectedPlans,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      expect(prismaService.plan.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        skip: 0,
        take: 10,
        include: {
          officeLocation: {
            select: { id: true, label: true, city: true, state: true },
          },
          prices: { where: { isActive: true, isDeleted: false } },
          features: {
            where: { isDeleted: false },
            include: { feature: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter plans by search term', async () => {
      const query: PlanQueryDto = { search: 'test', page: 1, limit: 10 };

      (prismaService.plan.findMany as jest.Mock).mockResolvedValue([mockPlan]);
      (prismaService.plan.count as jest.Mock).mockResolvedValue(1);

      await service.getPlans(query);

      expect(prismaService.plan.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
            { slug: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        include: {
          officeLocation: {
            select: { id: true, label: true, city: true, state: true },
          },
          prices: { where: { isActive: true, isDeleted: false } },
          features: {
            where: { isDeleted: false },
            include: { feature: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by active status', async () => {
      const query: PlanQueryDto = { isActive: true, page: 1, limit: 10 };

      (prismaService.plan.findMany as jest.Mock).mockResolvedValue([mockPlan]);
      (prismaService.plan.count as jest.Mock).mockResolvedValue(1);

      await service.getPlans(query);

      expect(prismaService.plan.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false, isActive: true },
        skip: 0,
        take: 10,
        include: {
          officeLocation: {
            select: { id: true, label: true, city: true, state: true },
          },
          prices: { where: { isActive: true, isDeleted: false } },
          features: {
            where: { isDeleted: false },
            include: { feature: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getActivePlansWithPrices', () => {
    it('should return only active plans with prices', async () => {
      (prismaService.plan.findMany as jest.Mock).mockResolvedValue([mockPlan]);

      const result = await service.getActivePlansWithPrices();

      expect(result).toEqual([mockPlan]);
      expect(prismaService.plan.findMany).toHaveBeenCalledWith({
        where: { isActive: true, isDeleted: false },
        include: {
          officeLocation: {
            select: { id: true, label: true, city: true, state: true },
          },
          prices: {
            where: { isActive: true, isDeleted: false },
            orderBy: { amount: 'asc' },
          },
          features: {
            where: { isDeleted: false },
            include: { feature: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getPlanById', () => {
    it('should return plan by id', async () => {
      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue(mockPlan);

      const result = await service.getPlanById('plan-1');

      expect(result).toEqual(mockPlan);
      expect(prismaService.plan.findUnique).toHaveBeenCalledWith({
        where: { id: 'plan-1', isDeleted: false },
        include: {
          officeLocation: {
            select: { id: true, label: true, city: true, state: true },
          },
          prices: { where: { isActive: true, isDeleted: false } },
          features: {
            where: { isDeleted: false },
            include: { feature: true },
          },
          addons: {
            where: { isActive: true, isDeleted: false },
            include: {
              addon: { include: { variants: { where: { isDeleted: false } } } },
            },
          },
        },
      });
    });

    it('should throw NotFoundException when plan not found', async () => {
      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getPlanById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPlan', () => {
    it('should create a new plan', async () => {
      const createPlanDto: CreatePlanDto = {
        name: 'New Plan',
        description: 'New Description',
        slug: 'new-plan',
        officeLocationId: 'location-1',
        isActive: true,
      };

      (prismaService.officeLocation.findUnique as jest.Mock).mockResolvedValue(mockOfficeLocation);
      (prismaService.plan.create as jest.Mock).mockResolvedValue(mockPlan);

      const result = await service.createPlan(createPlanDto);

      expect(result).toEqual(mockPlan);
      expect(prismaService.plan.create).toHaveBeenCalledWith({
        data: createPlanDto,
        include: {
          officeLocation: {
            select: { id: true, label: true, city: true, state: true },
          },
          prices: { where: { isActive: true, isDeleted: false } },
          features: {
            where: { isDeleted: false },
            include: { feature: true },
          },
        },
      });
    });

    it('should throw NotFoundException when office location not found', async () => {
      const createPlanDto: CreatePlanDto = {
        name: 'New Plan',
        description: 'New Description',
        slug: 'new-plan',
        officeLocationId: 'non-existent',
        isActive: true,
      };

      (prismaService.officeLocation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createPlan(createPlanDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePlan', () => {
    it('should update existing plan', async () => {
      const updatePlanDto: UpdatePlanDto = { name: 'Updated Plan' };
      const updatedPlan = { ...mockPlan, ...updatePlanDto };

      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prismaService.plan.update as jest.Mock).mockResolvedValue(updatedPlan);

      const result = await service.updatePlan('plan-1', updatePlanDto);

      expect(result).toEqual(updatedPlan);
      expect(prismaService.plan.update).toHaveBeenCalledWith({
        where: { id: 'plan-1' },
        data: { ...updatePlanDto, updatedAt: expect.any(Date) },
        include: {
          officeLocation: {
            select: { id: true, label: true, city: true, state: true },
          },
          prices: { where: { isActive: true, isDeleted: false } },
          features: {
            where: { isDeleted: false },
            include: { feature: true },
          },
        },
      });
    });

    it('should throw NotFoundException when plan not found', async () => {
      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updatePlan('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePlan', () => {
    it('should soft delete plan', async () => {
      const deletedPlan = { ...mockPlan, isDeleted: true, deletedAt: new Date() };

      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prismaService.plan.update as jest.Mock).mockResolvedValue(deletedPlan);

      const result = await service.deletePlan('plan-1');

      expect(result).toEqual(deletedPlan);
      expect(prismaService.plan.update).toHaveBeenCalledWith({
        where: { id: 'plan-1' },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: {
          officeLocation: {
            select: { id: true, label: true, city: true, state: true },
          },
          prices: { where: { isActive: true, isDeleted: false } },
          features: {
            where: { isDeleted: false },
            include: { feature: true },
          },
        },
      });
    });

    it('should throw NotFoundException when plan not found', async () => {
      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deletePlan('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPlanPrices', () => {
    it('should return paginated plan prices', async () => {
      const query: PlanPriceQueryDto = { planId: 'plan-1' };

      (prismaService.planPrice.findMany as jest.Mock).mockResolvedValue([mockPlanPrice]);
      (prismaService.planPrice.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getPlanPrices(query);

      expect(result).toEqual({
        data: [mockPlanPrice],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('createPlanPrice', () => {
    it('should create a new plan price', async () => {
      const createPlanPriceDto: CreatePlanPriceDto = {
        planId: 'plan-1',
        billingCycle: BillingCycle.MONTHLY,
        amount: 2999,
        currency: 'USD',
        description: 'Monthly subscription',
      };

      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prismaService.planPrice.create as jest.Mock).mockResolvedValue(mockPlanPrice);

      const result = await service.createPlanPrice(createPlanPriceDto);

      expect(result).toEqual(mockPlanPrice);
      expect(prismaService.planPrice.create).toHaveBeenCalledWith({
        data: createPlanPriceDto,
        include: { plan: true },
      });
    });

    it('should throw NotFoundException when plan not found', async () => {
      const createPlanPriceDto: CreatePlanPriceDto = {
        planId: 'non-existent',
        billingCycle: BillingCycle.MONTHLY,
        amount: 2999,
        currency: 'USD',
      };

      (prismaService.plan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createPlanPrice(createPlanPriceDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePlanPrice', () => {
    it('should update existing plan price', async () => {
      const updatePlanPriceDto: UpdatePlanPriceDto = { amount: 3999 };
      const updatedPlanPrice = { ...mockPlanPrice, ...updatePlanPriceDto };

      (prismaService.planPrice.findUnique as jest.Mock).mockResolvedValue(mockPlanPrice);
      (prismaService.planPrice.update as jest.Mock).mockResolvedValue(updatedPlanPrice);

      const result = await service.updatePlanPrice('price-1', updatePlanPriceDto);

      expect(result).toEqual(updatedPlanPrice);
      expect(prismaService.planPrice.update).toHaveBeenCalledWith({
        where: { id: 'price-1' },
        data: { ...updatePlanPriceDto, updatedAt: expect.any(Date) },
        include: { plan: true },
      });
    });

    it('should throw NotFoundException when plan price not found', async () => {
      (prismaService.planPrice.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updatePlanPrice('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePlanPrice', () => {
    it('should soft delete plan price', async () => {
      const deletedPlanPrice = { ...mockPlanPrice, isDeleted: true, deletedAt: new Date() };

      (prismaService.planPrice.findUnique as jest.Mock).mockResolvedValue(mockPlanPrice);
      (prismaService.planPrice.update as jest.Mock).mockResolvedValue(deletedPlanPrice);

      const result = await service.deletePlanPrice('price-1');

      expect(result).toEqual(deletedPlanPrice);
      expect(prismaService.planPrice.update).toHaveBeenCalledWith({
        where: { id: 'price-1' },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: { plan: true },
      });
    });

    it('should throw NotFoundException when plan price not found', async () => {
      (prismaService.planPrice.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deletePlanPrice('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPlanFromTemplate', () => {
    it('should create plan from template', async () => {
      const createFromTemplateDto: CreatePlanFromTemplateDto = {
        templateId: 'template-1',
        name: 'Plan from Template',
        officeLocationId: 'location-1',
      };

      const mockTemplate = {
        id: 'template-1',
        name: 'Template',
        description: 'Template Description',
        features: [{ featureId: 'feature-1', isIncluded: true, value: 100 }],
      };

      (prismaService.planTemplate.findUnique as jest.Mock).mockResolvedValue(mockTemplate);
      (prismaService.officeLocation.findUnique as jest.Mock).mockResolvedValue(mockOfficeLocation);
      (prismaService.$transaction as jest.Mock).mockResolvedValue(mockPlan);

      const result = await service.createPlanFromTemplate(createFromTemplateDto);

      expect(result).toEqual(mockPlan);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when template not found', async () => {
      const createFromTemplateDto: CreatePlanFromTemplateDto = {
        templateId: 'non-existent',
        name: 'Plan from Template',
        officeLocationId: 'location-1',
      };

      (prismaService.planTemplate.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createPlanFromTemplate(createFromTemplateDto)).rejects.toThrow(NotFoundException);
    });
  });
}); 