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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseUtil } from '../common/interfaces/api-response.interface';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  /**
   * POST /api/expenses
   * Create a new expense record
   */
  @Post()
  async createExpense(@CurrentUser() user, @Body() dto: CreateExpenseDto) {
    try {
      const expense = await this.expenseService.createExpense(user.userId, dto);
      return ResponseUtil.success('Expense record created', expense);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/expenses/my
   * Get all expenses for the logged-in user
   */
  @Get('my')
  async getMyExpenses(@CurrentUser() user) {
    try {
      const expenses = await this.expenseService.getUserExpenses(user.userId);
      return ResponseUtil.success('User expenses retrieved', expenses);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/expenses/family
   * Get all expenses for the family
   */
  @Get('family')
  async getFamilyExpenses(@CurrentUser() user) {
    try {
      const expenses = await this.expenseService.getFamilyExpenses(user.familyId);
      return ResponseUtil.success('Family expenses retrieved', expenses);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/expenses/my/stats
   * Get expense statistics for the user
   */
  @Get('my/stats')
  async getMyExpenseStats(@CurrentUser() user) {
    try {
      const stats = await this.expenseService.getUserExpenseStats(user.userId);
      return ResponseUtil.success('User expense stats retrieved', stats);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * GET /api/expenses/:id
   * Get a single expense record
   */
  @Get(':id')
  async getExpense(@CurrentUser() user, @Param('id') expenseId: string) {
    try {
      const expense = await this.expenseService.getExpenseById(expenseId, user.userId);
      return ResponseUtil.success('Expense record retrieved', expense);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * PUT /api/expenses/:id
   * Update an expense record
   */
  @Put(':id')
  async updateExpense(
    @CurrentUser() user,
    @Param('id') expenseId: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    try {
      const expense = await this.expenseService.updateExpense(expenseId, user.userId, dto);
      return ResponseUtil.success('Expense record updated', expense);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * DELETE /api/expenses/:id
   * Delete an expense record
   */
  @Delete(':id')
  async deleteExpense(@CurrentUser() user, @Param('id') expenseId: string) {
    try {
      const result = await this.expenseService.deleteExpense(expenseId, user.userId);
      return ResponseUtil.success(result.message);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }
}

