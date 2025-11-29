import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FamilyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get family details with all members
   */
  async getFamilyDetails(familyId: string) {
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return family;
  }

  /**
   * Get all family members
   */
  async getFamilyMembers(familyId: string) {
    const members = await this.prisma.user.findMany({
      where: { familyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return members;
  }

  /**
   * Remove a family member (ADMIN only)
   */
  async removeMember(familyId: string, memberId: string, requestorRole: string) {
    if (requestorRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can remove members');
    }

    // Check if member belongs to the family
    const member = await this.prisma.user.findFirst({
      where: {
        id: memberId,
        familyId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Member not found in your family');
    }

    // Cannot remove admin
    if (member.role === 'ADMIN') {
      throw new ForbiddenException('Cannot remove admin user');
    }

    // Delete member
    await this.prisma.user.delete({
      where: { id: memberId },
    });

    return { message: 'Member removed successfully' };
  }

  /**
   * Update family name (ADMIN only)
   */
  async updateFamilyName(familyId: string, newName: string, requestorRole: string) {
    if (requestorRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update family name');
    }

    const family = await this.prisma.family.update({
      where: { id: familyId },
      data: { familyName: newName },
    });

    return family;
  }
}

