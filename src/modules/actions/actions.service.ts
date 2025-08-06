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


  private async findMail(mailId: string) {
    return this.prismaService.mail.findUnique({
      where: { id: mailId },
      include: {
        actions: true,
      },
    });
  }

  calculateVolumetricWeight(box:any, divisor = 5000): number {
    // 5000 is the divisor for cm^3 to kg conversion
    if (!box || !box.length || !box.width || !box.height) {
      throw new Error('Invalid box dimensions provided');
    }
    return (box.length * box.width * box.height) / divisor;
  }

}