import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseUtil } from '../common/interfaces/api-response.interface';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  /**
   * GET /api/dashboard/family
   * Get family dashboard summary
   */
  @Get('family')
  async getFamilyDashboard(@CurrentUser() user) {
    try {
      const dashboard = await this.dashboardService.getFamilyDashboard(user.familyId);
      return ResponseUtil.success('Family dashboard retrieved', dashboard);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/dashboard/my
   * Get user dashboard summary
   */
  @Get('my')
  async getUserDashboard(@CurrentUser() user) {
    try {
      const dashboard = await this.dashboardService.getUserDashboard(user.userId);
      return ResponseUtil.success('User dashboard retrieved', dashboard);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/dashboard/family/trends?months=6
   * Get family monthly trends
   */
  @Get('family/trends')
  async getFamilyMonthlyTrends(
    @CurrentUser() user,
    @Query('months') months?: string,
  ) {
    try {
      const monthsNum = months ? parseInt(months, 10) : 6;
      const trends = await this.dashboardService.getFamilyMonthlyTrends(
        user.familyId,
        monthsNum,
      );
      return ResponseUtil.success('Family trends retrieved', trends);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/dashboard/my/trends?months=6
   * Get user monthly trends
   */
  @Get('my/trends')
  async getUserMonthlyTrends(@CurrentUser() user, @Query('months') months?: string) {
    try {
      const monthsNum = months ? parseInt(months, 10) : 6;
      const trends = await this.dashboardService.getUserMonthlyTrends(
        user.userId,
        monthsNum,
      );
      return ResponseUtil.success('User trends retrieved', trends);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }
}

