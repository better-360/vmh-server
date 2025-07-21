import { Test, TestingModule } from '@nestjs/testing';
import { AddonsService } from './addons.service';
import { PrismaService } from 'src/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  CreateAddonDto,
  UpdateAddonDto,
  AddonQueryDto,
  CreateAddonVariantDto,
  AddonVariantQueryDto,
  CreatePlanAddonDto,
  PlanAddonQueryDto,
  CreateAddonWithVariantsDto,
  BulkCreatePlanAddonsDto,
} from 'src/dtos/addons.dto';

describe('AddonsService', () => {
  let service: AddonsService;
  let prismaService: any;

  const mockAddon = {
    id: 'addon-1',
    name: 'Test Addon',
    description: 'Test Description',
    stripeProductId: 'prod_test',
    imageUrl: 'https://example.com/image.png',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockAddonVariant = {
    id: 'variant-1',
    addonId: 'addon-1',
    name: 'Test Variant',
    description: 'Test Variant Description',
    stripePriceId: 'price_test',
    price: 999,
    currency: 'USD',
    imageUrl: 'https://example.com/variant.png',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    addon: mockAddon,
  };

  const mockPlanAddon = {
    id: 'plan-addon-1',
    planId: 'plan-1',
    addonId: 'addon-1',
    isIncludedInPlan: false,
    discountPercent: 10,
    isRequired: false,
    displayOrder: 1,
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      addon: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      addonVariant: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      planAddon: {
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
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddonsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AddonsService>(AddonsService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAddons', () => {
    it('should return paginated addons', async () => {
      const query: AddonQueryDto = { page: 1, limit: 10 };
      const expectedAddons = [mockAddon];
      
      prismaService.addon.findMany.mockResolvedValue(expectedAddons);
      prismaService.addon.count.mockResolvedValue(1);

      const result = await service.getAddons(query);

      expect(result).toEqual({
        data: expectedAddons,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      expect(prismaService.addon.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        skip: 0,
        take: 10,
        include: { variants: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter addons by search term', async () => {
      const query: AddonQueryDto = { search: 'test', page: 1, limit: 10 };
      
      prismaService.addon.findMany.mockResolvedValue([mockAddon]);
      prismaService.addon.count.mockResolvedValue(1);

      await service.getAddons(query);

      expect(prismaService.addon.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        include: { variants: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by active status', async () => {
      const query: AddonQueryDto = { isActive: true, page: 1, limit: 10 };
      
      prismaService.addon.findMany.mockResolvedValue([mockAddon]);
      prismaService.addon.count.mockResolvedValue(1);

      await service.getAddons(query);

      expect(prismaService.addon.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false, isActive: true },
        skip: 0,
        take: 10,
        include: { variants: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getActiveAddons', () => {
    it('should return only active addons', async () => {
      prismaService.addon.findMany.mockResolvedValue([mockAddon]);

      const result = await service.getActiveAddons();

      expect(result).toEqual([mockAddon]);
      expect(prismaService.addon.findMany).toHaveBeenCalledWith({
        where: { isActive: true, isDeleted: false },
        include: { variants: { where: { isDeleted: false } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getAddonById', () => {
    it('should return addon by id', async () => {
      prismaService.addon.findUnique.mockResolvedValue(mockAddon);

      const result = await service.getAddonById('addon-1');

      expect(result).toEqual(mockAddon);
      expect(prismaService.addon.findUnique).toHaveBeenCalledWith({
        where: { id: 'addon-1', isDeleted: false },
        include: { variants: { where: { isDeleted: false } } },
      });
    });

    it('should throw NotFoundException when addon not found', async () => {
      prismaService.addon.findUnique.mockResolvedValue(null);

      await expect(service.getAddonById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createAddon', () => {
    it('should create a new addon', async () => {
      const createAddonDto: CreateAddonDto = {
        name: 'New Addon',
        description: 'New Description',
        isActive: true,
      };

      prismaService.addon.create.mockResolvedValue(mockAddon);

      const result = await service.createAddon(createAddonDto);

      expect(result).toEqual(mockAddon);
      expect(prismaService.addon.create).toHaveBeenCalledWith({
        data: createAddonDto,
        include: { variants: { where: { isDeleted: false } } },
      });
    });
  });

  describe('createAddonWithVariants', () => {
    it('should create addon with variants in transaction', async () => {
      const createAddonWithVariantsDto: CreateAddonWithVariantsDto = {
        name: 'New Addon',
        description: 'New Description',
        variants: [
          {
            name: 'Basic',
            price: 999,
            currency: 'USD',
          },
        ],
      };

      const addonWithVariants = {
        ...mockAddon,
        variants: [mockAddonVariant],
      };

      prismaService.$transaction.mockResolvedValue(addonWithVariants);

      const result = await service.createAddonWithVariants(createAddonWithVariantsDto);

      expect(result).toEqual(addonWithVariants);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('updateAddon', () => {
    it('should update existing addon', async () => {
      const updateAddonDto: UpdateAddonDto = { name: 'Updated Addon' };
      const updatedAddon = { ...mockAddon, ...updateAddonDto };

      prismaService.addon.findUnique.mockResolvedValue(mockAddon);
      prismaService.addon.update.mockResolvedValue(updatedAddon);

      const result = await service.updateAddon('addon-1', updateAddonDto);

      expect(result).toEqual(updatedAddon);
      expect(prismaService.addon.update).toHaveBeenCalledWith({
        where: { id: 'addon-1' },
        data: { ...updateAddonDto, updatedAt: expect.any(Date) },
        include: { variants: { where: { isDeleted: false } } },
      });
    });

    it('should throw NotFoundException when addon not found', async () => {
      prismaService.addon.findUnique.mockResolvedValue(null);

      await expect(service.updateAddon('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAddon', () => {
    it('should soft delete addon', async () => {
      const deletedAddon = { ...mockAddon, isDeleted: true, deletedAt: new Date() };

      prismaService.addon.findUnique.mockResolvedValue(mockAddon);
      prismaService.addon.update.mockResolvedValue(deletedAddon);

      const result = await service.deleteAddon('addon-1');

      expect(result).toEqual(deletedAddon);
      expect(prismaService.addon.update).toHaveBeenCalledWith({
        where: { id: 'addon-1' },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: { variants: { where: { isDeleted: false } } },
      });
    });

    it('should throw NotFoundException when addon not found', async () => {
      prismaService.addon.findUnique.mockResolvedValue(null);

      await expect(service.deleteAddon('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAddonVariants', () => {
    it('should return paginated addon variants', async () => {
      const query: AddonVariantQueryDto = { page: 1, limit: 10 };
      
      prismaService.addonVariant.findMany.mockResolvedValue([mockAddonVariant]);
      prismaService.addonVariant.count.mockResolvedValue(1);

      const result = await service.getAddonVariants(query);

      expect(result).toEqual({
        data: [mockAddonVariant],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('should filter by addon id', async () => {
      const query: AddonVariantQueryDto = { addonId: 'addon-1' };

      prismaService.addonVariant.findMany.mockResolvedValue([mockAddonVariant]);
      prismaService.addonVariant.count.mockResolvedValue(1);

      await service.getAddonVariants(query);

      expect(prismaService.addonVariant.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false, addonId: 'addon-1' },
        skip: 0,
        take: 10,
        include: { addon: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('createAddonVariant', () => {
    it('should create a new addon variant', async () => {
      const createVariantDto: CreateAddonVariantDto = {
        addonId: 'addon-1',
        name: 'New Variant',
        price: 1999,
        currency: 'USD',
      };

      prismaService.addon.findUnique.mockResolvedValue(mockAddon);
      prismaService.addonVariant.create.mockResolvedValue(mockAddonVariant);

      const result = await service.createAddonVariant(createVariantDto);

      expect(result).toEqual(mockAddonVariant);
      expect(prismaService.addonVariant.create).toHaveBeenCalledWith({
        data: createVariantDto,
        include: { addon: true },
      });
    });

    it('should throw NotFoundException when addon not found', async () => {
      const createVariantDto: CreateAddonVariantDto = {
        addonId: 'non-existent',
        name: 'New Variant',
        price: 1999,
        currency: 'USD',
      };

      prismaService.addon.findUnique.mockResolvedValue(null);

      await expect(service.createAddonVariant(createVariantDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPlanAddons', () => {
    it('should return paginated plan addons', async () => {
      const query: PlanAddonQueryDto = { page: 1, limit: 10 };

      prismaService.planAddon.findMany.mockResolvedValue([mockPlanAddon]);
      prismaService.planAddon.count.mockResolvedValue(1);

      const result = await service.getPlanAddons(query);

      expect(result).toEqual({
        data: [mockPlanAddon],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('createPlanAddon', () => {
    it('should create a new plan addon', async () => {
      const createPlanAddonDto: CreatePlanAddonDto = {
        planId: 'plan-1',
        addonId: 'addon-1',
        isIncludedInPlan: false,
        discountPercent: 10,
      };

      prismaService.plan.findUnique.mockResolvedValue({ id: 'plan-1' });
      prismaService.addon.findUnique.mockResolvedValue(mockAddon);
      prismaService.planAddon.findFirst.mockResolvedValue(null);
      prismaService.planAddon.create.mockResolvedValue(mockPlanAddon);

      const result = await service.createPlanAddon(createPlanAddonDto);

      expect(result).toEqual(mockPlanAddon);
      expect(prismaService.planAddon.create).toHaveBeenCalledWith({
        data: createPlanAddonDto,
        include: {
          plan: { select: { id: true, name: true } },
          addon: { include: { variants: { where: { isDeleted: false } } } },
        },
      });
    });

    it('should throw ConflictException when plan addon already exists', async () => {
      const createPlanAddonDto: CreatePlanAddonDto = {
        planId: 'plan-1',
        addonId: 'addon-1',
      };

      prismaService.plan.findUnique.mockResolvedValue({ id: 'plan-1' });
      prismaService.addon.findUnique.mockResolvedValue(mockAddon);
      prismaService.planAddon.findFirst.mockResolvedValue(mockPlanAddon);

      await expect(service.createPlanAddon(createPlanAddonDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('bulkCreatePlanAddons', () => {
    it('should create multiple plan addons', async () => {
      const bulkCreateDto: BulkCreatePlanAddonsDto = {
        planId: 'plan-1',
        addons: [
          { addonId: 'addon-1', isIncludedInPlan: false },
          { addonId: 'addon-2', isIncludedInPlan: true },
        ],
      };

      prismaService.plan.findUnique.mockResolvedValue({ id: 'plan-1' });
      prismaService.addon.findMany.mockResolvedValue([mockAddon]);
      prismaService.planAddon.createMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkCreatePlanAddons(bulkCreateDto);

      expect(result).toEqual({ count: 2 });
      expect(prismaService.planAddon.createMany).toHaveBeenCalled();
    });
  });

  describe('deletePlanAddon', () => {
    it('should soft delete plan addon', async () => {
      const deletedPlanAddon = { ...mockPlanAddon, isDeleted: true, deletedAt: new Date() };

      prismaService.planAddon.findUnique.mockResolvedValue(mockPlanAddon);
      prismaService.planAddon.update.mockResolvedValue(deletedPlanAddon);

      const result = await service.deletePlanAddon('plan-addon-1');

      expect(result).toEqual(deletedPlanAddon);
      expect(prismaService.planAddon.update).toHaveBeenCalledWith({
        where: { id: 'plan-addon-1' },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: {
          plan: { select: { id: true, name: true } },
          addon: { include: { variants: { where: { isDeleted: false } } } },
        },
      });
    });
  });

  describe('removeAddonFromPlan', () => {
    it('should remove addon from plan', async () => {
      prismaService.planAddon.findFirst.mockResolvedValue(mockPlanAddon);
      prismaService.planAddon.update.mockResolvedValue({ ...mockPlanAddon, isDeleted: true });

      const result = await service.removeAddonFromPlan('plan-1', 'addon-1');

      expect(result).toEqual({ success: true, message: 'Addon removed from plan successfully' });
    });

    it('should throw NotFoundException when plan addon not found', async () => {
      prismaService.planAddon.findFirst.mockResolvedValue(null);

      await expect(service.removeAddonFromPlan('plan-1', 'addon-1')).rejects.toThrow(NotFoundException);
    });
  });
}); 