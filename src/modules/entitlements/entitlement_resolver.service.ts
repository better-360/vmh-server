import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class EntitlementResolverService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveEntitlements(mailboxId: string) {
    const planFeatures = await this.prisma.planFeature.findMany({
      where: { planId: mailboxId },
    });
  }
}