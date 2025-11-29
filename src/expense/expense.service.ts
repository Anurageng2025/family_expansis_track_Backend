import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new expense record
   */
  async createExpense(userId: string, dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        userId,
        amount: dto.amount,
        category: dto.category,
        date: new Date(dto.date),
        notes: dto.notes,
      },
    });

    return expense;
  }

  /**
   * Get all expenses for a user
   */
  async getUserExpenses(userId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return expenses;
  }

  /**
   * Get all expenses for a family
   */
  async getFamilyExpenses(familyId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        user: {
          familyId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return expenses;
  }

  /**
   * Get a single expense by ID
   */
  async getExpenseById(expenseId: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense record not found');
    }

    // Check if user owns this expense
    if (expense.userId !== userId) {
      throw new ForbiddenException('You can only view your own expense records');
    }

    return expense;
  }

  /**
   * Update an expense record
   */
  async updateExpense(expenseId: string, userId: string, dto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new NotFoundException('Expense record not found');
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException('You can only update your own expense records');
    }

    const updated = await this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.category && { category: dto.category }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    return updated;
  }

  /**
   * Delete an expense record
   */
  async deleteExpense(expenseId: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new NotFoundException('Expense record not found');
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException('You can only delete your own expense records');
    }

    await this.prisma.expense.delete({
      where: { id: expenseId },
    });

    return { message: 'Expense record deleted successfully' };
  }

  /**
   * Get expense statistics for a user
   */
  async getUserExpenseStats(userId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: { userId },
    });

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const byCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    return {
      total,
      count: expenses.length,
      byCategory,
    };
  }
}

