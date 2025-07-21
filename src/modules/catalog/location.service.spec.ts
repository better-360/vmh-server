import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { PrismaService } from 'src/prisma.service';
import { NotFoundException} from '@nestjs/common';
import {
  CreateOfficeLocationDto,
  UpdateOfficeLocationDto,
  OfficeLocationQueryDto,
} from 'src/dtos/location.dto';

describe('LocationService', () => {
  let service: LocationService;
  let prismaService: any;

  const mockOfficeLocation = {
    id: 'location-1',
    label: 'Test Location',
    description: 'Test Description',
    country: 'United States',
    state: 'California',
    city: 'Los Angeles',
    addressLine: '123 Test Street',
    postalCode: '90210',
    phone: '+1-555-0123',
    email: 'test@example.com',
    workingHours: '9 AM - 5 PM',
    timezone: 'America/Los_Angeles',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      officeLocation: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      plan: {
        count: jest.fn(),
      },
      package: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOfficeLocations', () => {
    it('should return paginated office locations', async () => {
      const query: OfficeLocationQueryDto = { page: 1, limit: 10 };
      const expectedLocations = [mockOfficeLocation];

      (prismaService.officeLocation.findMany as jest.Mock).mockResolvedValue(expectedLocations);
      (prismaService.officeLocation.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getOfficeLocations(query);

      expect(result).toEqual({
        data: expectedLocations,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      expect(prismaService.officeLocation.findMany).toHaveBeenCalledWith({
        where: { isActive: true, isDeleted: false },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter locations by search term', async () => {
      const query: OfficeLocationQueryDto = { search: 'test', page: 1, limit: 10 };

      (prismaService.officeLocation.findMany as jest.Mock).mockResolvedValue([mockOfficeLocation]);
      (prismaService.officeLocation.count as jest.Mock).mockResolvedValue(1);

      await service.getOfficeLocations(query);

      expect(prismaService.officeLocation.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          isDeleted: false,
          OR: [
            { label: { contains: 'test', mode: 'insensitive' } },
            { city: { contains: 'test', mode: 'insensitive' } },
            { state: { contains: 'test', mode: 'insensitive' } },
            { addressLine: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by country', async () => {
      const query: OfficeLocationQueryDto = { country: 'United States', page: 1, limit: 10 };

      (prismaService.officeLocation.findMany as jest.Mock).mockResolvedValue([mockOfficeLocation]);
      (prismaService.officeLocation.count as jest.Mock).mockResolvedValue(1);

      await service.getOfficeLocations(query);

      expect(prismaService.officeLocation.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          isDeleted: false,
          country: { contains: 'United States', mode: 'insensitive' },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by state and city', async () => {
      const query: OfficeLocationQueryDto = { 
        state: 'California',
        city: 'Los Angeles',
        page: 1,
        limit: 10 
      };

      (prismaService.officeLocation.findMany as jest.Mock).mockResolvedValue([mockOfficeLocation]);
      (prismaService.officeLocation.count as jest.Mock).mockResolvedValue(1);

      await service.getOfficeLocations(query);

      expect(prismaService.officeLocation.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          isDeleted: false,
          state: { contains: 'California', mode: 'insensitive' },
          city: { contains: 'Los Angeles', mode: 'insensitive' },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getActiveOfficeLocations', () => {
    it('should return only active office locations', async () => {
      (prismaService.officeLocation.findMany as jest.Mock).mockResolvedValue([mockOfficeLocation]);

      const result = await service.getActiveOfficeLocations();

      expect(result).toEqual([mockOfficeLocation]);
      expect(prismaService.officeLocation.findMany).toHaveBeenCalledWith({
        where: { isActive: true, isDeleted: false },
        orderBy: { label: 'asc' },
      });
    });
  });

  describe('getOfficeLocationById', () => {
    it('should return office location by id', async () => {
      (prismaService.officeLocation.findUnique as jest.Mock).mockResolvedValue(mockOfficeLocation);

      const result = await service.getOfficeLocationById('location-1');

      expect(result).toEqual(mockOfficeLocation);
      expect(prismaService.officeLocation.findUnique).toHaveBeenCalledWith({
        where: { id: 'location-1', isDeleted: false },
      });
    });

    it('should throw NotFoundException when location not found', async () => {
      (prismaService.officeLocation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getOfficeLocationById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createOfficeLocation', () => {
    it('should create a new office location', async () => {
      const createLocationDto: CreateOfficeLocationDto = {
        label: 'New Location',
        description: 'New Description',
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        addressLine: '456 New Street',
        zipCode: '94102',
        phone: '+1-555-0456',
        email: 'new@example.com',
        workingHours: '8 AM - 6 PM',
        timezone: 'America/Los_Angeles',
      };

      (prismaService.officeLocation.create as jest.Mock).mockResolvedValue(mockOfficeLocation);

      const result = await service.createOfficeLocation(createLocationDto);

      expect(result).toEqual(mockOfficeLocation);
      expect(prismaService.officeLocation.create).toHaveBeenCalledWith({
        data: createLocationDto,
      });
    });
  });

  describe('updateOfficeLocation', () => {
    it('should update existing office location', async () => {
      const updateLocationDto: UpdateOfficeLocationDto = { label: 'Updated Location' };
      const updatedLocation = { ...mockOfficeLocation, ...updateLocationDto };

      (prismaService.officeLocation.findUnique as jest.Mock).mockResolvedValue(mockOfficeLocation);
      (prismaService.officeLocation.update as jest.Mock).mockResolvedValue(updatedLocation);

      const result = await service.updateOfficeLocation('location-1', updateLocationDto);

      expect(result).toEqual(updatedLocation);
      expect(prismaService.officeLocation.update).toHaveBeenCalledWith({
        where: { id: 'location-1' },
        data: { ...updateLocationDto, updatedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException when location not found', async () => {
      (prismaService.officeLocation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateOfficeLocation('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteOfficeLocation', () => {
    it('should soft delete office location', async () => {
      const deletedLocation = { ...mockOfficeLocation, isDeleted: true, deletedAt: new Date() };

      (prismaService.officeLocation.findUnique as jest.Mock).mockResolvedValue(mockOfficeLocation);
      (prismaService.officeLocation.update as jest.Mock).mockResolvedValue(deletedLocation);

      const result = await service.deleteOfficeLocation('location-1');

      expect(result).toEqual(deletedLocation);
      expect(prismaService.officeLocation.update).toHaveBeenCalledWith({
        where: { id: 'location-1' },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException when location not found', async () => {
      (prismaService.officeLocation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteOfficeLocation('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLocationStats', () => {
    it('should return location statistics', async () => {
      (prismaService.officeLocation.findUnique as jest.Mock).mockResolvedValue(mockOfficeLocation);
      (prismaService.plan.count as jest.Mock).mockResolvedValue(5);
      (prismaService.package.count as jest.Mock).mockResolvedValue(25);

      const result = await service.getLocationStats('location-1');

      expect(result).toEqual({
        location: mockOfficeLocation,
        stats: {
          totalPlans: 5,
          totalPackages: 25,
        },
      });

      expect(prismaService.plan.count).toHaveBeenCalledWith({
        where: { officeLocationId: 'location-1', isActive: true, isDeleted: false },
      });

      expect(prismaService.package.count).toHaveBeenCalledWith({
        where: { officeLocationId: 'location-1' },
      });
    });

    it('should throw NotFoundException when location not found', async () => {
      (prismaService.officeLocation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getLocationStats('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
}); 