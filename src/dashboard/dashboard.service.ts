import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get dashboard summary for family
   * Shows total income, total expenses, balance, and breakdown by members
   */
  async getFamilyDashboard(familyId: string) {
    // Get all family members
    const members = await this.prisma.user.findMany({
      where: { familyId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Get all family incomes
    const incomes = await this.prisma.income.findMany({
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
          },
        },
      },
    });

    // Get all family expenses
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
          },
        },
      },
    });

    // Calculate totals
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpense;

    // Calculate by member
    const memberStats = members.map((member) => {
      const memberIncomes = incomes.filter((i) => i.userId === member.id);
      const memberExpenses = expenses.filter((e) => e.userId === member.id);

      const memberTotalIncome = memberIncomes.reduce((sum, i) => sum + i.amount, 0);
      const memberTotalExpense = memberExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        userId: member.id,
        userName: member.name,
        income: memberTotalIncome,
        expense: memberTotalExpense,
        balance: memberTotalIncome - memberTotalExpense,
      };
    });

    // Income by category
    const incomeByCategory = incomes.reduce((acc, income) => {
      if (!acc[income.category]) {
        acc[income.category] = 0;
      }
      acc[income.category] += income.amount;
      return acc;
    }, {});

    // Expense by category
    const expenseByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    return {
      totalIncome,
      totalExpense,
      balance,
      memberStats,
      incomeByCategory,
      expenseByCategory,
    };
  }

  /**
   * Get dashboard summary for a user
   */
  async getUserDashboard(userId: string) {
    // Get user incomes
    const incomes = await this.prisma.income.findMany({
      where: { userId },
    });

    // Get user expenses
    const expenses = await this.prisma.expense.findMany({
      where: { userId },
    });

    // Calculate totals
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpense;

    // Income by category
    const incomeByCategory = incomes.reduce((acc, income) => {
      if (!acc[income.category]) {
        acc[income.category] = 0;
      }
      acc[income.category] += income.amount;
      return acc;
    }, {});

    // Expense by category
    const expenseByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    return {
      totalIncome,
      totalExpense,
      balance,
      incomeByCategory,
      expenseByCategory,
      recentIncomes: incomes.slice(0, 5),
      recentExpenses: expenses.slice(0, 5),
    };
  }

  /**
   * Get monthly trends for family
   */
  async getFamilyMonthlyTrends(familyId: string, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const incomes = await this.prisma.income.findMany({
      where: {
        user: {
          familyId,
        },
        date: {
          gte: startDate,
        },
      },
    });

    const expenses = await this.prisma.expense.findMany({
      where: {
        user: {
          familyId,
        },
        date: {
          gte: startDate,
        },
      },
    });

    // Group by month
    const monthlyData = {};

    incomes.forEach((income) => {
      const monthKey = `${income.date.getFullYear()}-${String(income.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      monthlyData[monthKey].income += income.amount;
    });

    expenses.forEach((expense) => {
      const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      monthlyData[monthKey].expense += expense.amount;
    });

    // Convert to array and sort
    const trends = Object.keys(monthlyData)
      .sort()
      .map((month) => ({
        month,
        income: monthlyData[month].income,
        expense: monthlyData[month].expense,
        balance: monthlyData[month].income - monthlyData[month].expense,
      }));

    return trends;
  }

  /**
   * Get monthly trends for user
   */
  async getUserMonthlyTrends(userId: string, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const incomes = await this.prisma.income.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
    });

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
    });

    // Group by month
    const monthlyData = {};

    incomes.forEach((income) => {
      const monthKey = `${income.date.getFullYear()}-${String(income.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      monthlyData[monthKey].income += income.amount;
    });

    expenses.forEach((expense) => {
      const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      monthlyData[monthKey].expense += expense.amount;
    });

    // Convert to array and sort
    const trends = Object.keys(monthlyData)
      .sort()
      .map((month) => ({
        month,
        income: monthlyData[month].income,
        expense: monthlyData[month].expense,
        balance: monthlyData[month].income - monthlyData[month].expense,
      }));

    return trends;
  }
}

