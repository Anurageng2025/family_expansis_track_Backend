import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator';
import { ReminderService } from './reminder.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseUtil } from '../common/interfaces/api-response.interface';
import { UserRole } from '@prisma/client';

class SendReminderDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;
}

class SendBulkReminderDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  memberIds: string[];
}

@Controller('reminders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReminderController {
  constructor(private reminderService: ReminderService) {}

  /**
   * POST /api/reminders/send-to-member
   * Admin only - Send reminder to a specific family member
   */
  @Post('send-to-member')
  @Roles(UserRole.ADMIN)
  async sendReminderToMember(
    @CurrentUser() user: any,
    @Body() dto: SendReminderDto,
  ) {
    try {
      const result = await this.reminderService.sendReminderToMember(
        user.familyId,
        dto.memberId,
      );
      return ResponseUtil.success(result.message, result);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * POST /api/reminders/send-to-all
   * Admin only - Send reminder to all family members
   */
  @Post('send-to-all')
  @Roles(UserRole.ADMIN)
  async sendReminderToAll(@CurrentUser() user: any) {
    try {
      const result = await this.reminderService.sendReminderToAllMembers(
        user.familyId,
      );
      return ResponseUtil.success(result.message, result);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * POST /api/reminders/send-bulk
   * Admin only - Send reminder to multiple selected members
   */
  @Post('send-bulk')
  @Roles(UserRole.ADMIN)
  async sendBulkReminder(
    @CurrentUser() user: any,
    @Body() dto: SendBulkReminderDto,
  ) {
    try {
      const result = await this.reminderService.sendBulkReminders(
        user.familyId,
        dto.memberIds,
      );
      return ResponseUtil.success(result.message, result);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * POST /api/reminders/test
   * Test endpoint - send reminder to current user (for testing)
   */
  @Post('test')
  async sendTestReminder(@CurrentUser() user: any) {
    try {
      const result = await this.reminderService.sendTestReminder(user.email);
      return ResponseUtil.success(result.message);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }
}

