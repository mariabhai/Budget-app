export type BudgetItemType = 'income' | 'expense';

export interface BudgetItem {
  id: string;
  type: BudgetItemType;
  desc: string;
  amount: number;
  category: string;
}

export interface BudgetItemLists {
  expense: BudgetItem[];
  income: BudgetItem[];
}
