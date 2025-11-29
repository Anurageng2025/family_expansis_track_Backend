import { Controller, Get, Delete, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { FamilyService } from './family.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseUtil } from '../common/interfaces/api-response.interface';

@Controller('family')
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private familyService: FamilyService) {}

  /**
   * GET /api/family
   * Get family details with all members
   */
  @Get()
  async getFamilyDetails(@CurrentUser() user) {
    try {
      const family = await this.familyService.getFamilyDetails(user.familyId);
      return ResponseUtil.success('Family details retrieved', family);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/family/members
   * Get all family members
   */
  @Get('members')
  async getFamilyMembers(@CurrentUser() user) {
    try {
      const members = await this.familyService.getFamilyMembers(user.familyId);
      return ResponseUtil.success('Family members retrieved', members);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * DELETE /api/family/members/:id
   * Remove a family member (ADMIN only)
   */
  @Delete('members/:id')
  async removeMember(@CurrentUser() user, @Param('id') memberId: string) {
    try {
      const result = await this.familyService.removeMember(
        user.familyId,
        memberId,
        user.role,
      );
      return ResponseUtil.success(result.message);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * PATCH /api/family/name
   * Update family name (ADMIN only)
   */
  @Patch('name')
  async updateFamilyName(@CurrentUser() user, @Body('name') newName: string) {
    try {
      const family = await this.familyService.updateFamilyName(
        user.familyId,
        newName,
        user.role,
      );
      return ResponseUtil.success('Family name updated', family);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }
}

