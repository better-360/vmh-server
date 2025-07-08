import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";
import { ActionStatus, PackageActionType } from "@prisma/client";

@Injectable()
export class PackageActionService {
      constructor(
    private readonly prismaService: PrismaService,
  ) {}



  async markPackageAsJunk(packageId: string) {

   }

  async openAndScanPackage(packageId: string) { }

  async shredPackage(packageId: string) { }

  async forwardPackage(packageId: string, forwardData: any) {}

  async holdPackageForPickup(packageId: string) { }


  async markItemAsJunk(itemId: string) { }

  async shredItem(itemId: string) { }

  async forwardItems(itemIds: string[], forwardData: any) {

   }

  async holdItemForPickup(itemId: string) { }


  private async findPackage(packageId: string) {
    return this.prismaService.package.findUnique({
      where: { id: packageId },
      include: {
        actions: true,
      },
    });
  }
}