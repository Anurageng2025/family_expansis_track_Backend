import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto, UpdateIncomeDto } from './dto/income.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseUtil } from '../common/interfaces/api-response.interface';

@Controller('incomes')
@UseGuards(JwtAuthGuard)
export class IncomeController {
  constructor(private incomeService: IncomeService) {}

  /**
   * POST /api/incomes
   * Create a new income record
   */
  @Post()
  async createIncome(@CurrentUser() user, @Body() dto: CreateIncomeDto) {
    try {
      const income = await this.incomeService.createIncome(user.userId, dto);
      return ResponseUtil.success('Income record created', income);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/incomes/my
   * Get all incomes for the logged-in user
   */
  @Get('my')
  async getMyIncomes(@CurrentUser() user) {
    try {
      const incomes = await this.incomeService.getUserIncomes(user.userId);
      return ResponseUtil.success('User incomes retrieved', incomes);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/incomes/family
   * Get all incomes for the family
   */
  @Get('family')
  async getFamilyIncomes(@CurrentUser() user) {
    try {
      const incomes = await this.incomeService.getFamilyIncomes(user.familyId);
      return ResponseUtil.success('Family incomes retrieved', incomes);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/incomes/my/stats
   * Get income statistics for the user
   */
  @Get('my/stats')
  async getMyIncomeStats(@CurrentUser() user) {
    try {
      const stats = await this.incomeService.getUserIncomeStats(user.userId);
      return ResponseUtil.success('User income stats retrieved', stats);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/incomes/:id
   * Get a single income record
   */
  @Get(':id')
  async getIncome(@CurrentUser() user, @Param('id') incomeId: string) {
    try {
      const income = await this.incomeService.getIncomeById(incomeId, user.userId);
      return ResponseUtil.success('Income record retrieved', income);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * PUT /api/incomes/:id
   * Update an income record
   */
  @Put(':id')
  async updateIncome(
    @CurrentUser() user,
    @Param('id') incomeId: string,
    @Body() dto: UpdateIncomeDto,
  ) {
    try {
      const income = await this.incomeService.updateIncome(incomeId, user.userId, dto);
      return ResponseUtil.success('Income record updated', income);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * DELETE /api/incomes/:id
   * Delete an income record
   */
  @Delete(':id')
  async deleteIncome(@CurrentUser() user, @Param('id') incomeId: string) {
    try {
      const result = await this.incomeService.deleteIncome(incomeId, user.userId);
      return ResponseUtil.success(result.message);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }
}

