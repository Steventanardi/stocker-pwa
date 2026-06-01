import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { db } from '@/db/database';

export async function pushToCloud(table: string, id: string, data: any) {
  const { user, isGuest } = useAuthStore.getState();
  if (!user || isGuest) return;

  try {
    const { error } = await supabase.from(table).upsert({
      id,
      user_id: user.id,
      ...data
    });
    if (error) throw error;
  } catch (error) {
    console.error(`Failed to push to ${table}:`, error);
  }
}

export async function deleteFromCloud(table: string, id: string) {
  const { user, isGuest } = useAuthStore.getState();
  if (!user || isGuest) return;

  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error(`Failed to delete from ${table}:`, error);
  }
}

export async function syncInventoryFromCloud() {
  const { user, isGuest } = useAuthStore.getState();
  if (!user || isGuest) return;

  try {
    // Sync Categories
    const { data: cloudCategories, error: catError } = await supabase.from('inventory_categories').select('*');
    if (!catError && cloudCategories) {
      for (const cat of cloudCategories) {
        await db.inventoryCategories.put({
          id: cat.id,
          name: cat.name,
          icon: cat.icon || undefined,
          color: cat.color || undefined,
          createdAt: new Date(cat.created_at),
          updatedAt: new Date(cat.updated_at)
        });
      }
    }

    // Sync Items
    const { data: cloudItems, error } = await supabase.from('items').select('*');
    if (error) throw error;

    if (cloudItems) {
      for (const cItem of cloudItems) {
        const localItem = await db.inventoryItems.get(cItem.id);
        const cloudUpdated = new Date(cItem.updated_at).getTime();
        const localUpdated = localItem ? new Date(localItem.updatedAt).getTime() : 0;

        // If cloud is newer or it doesn't exist locally
        if (cloudUpdated > localUpdated) {
          await db.inventoryItems.put({
            id: cItem.id,
            name: cItem.name,
            barcode: cItem.barcode || undefined,
            categoryId: cItem.category,
            condition: cItem.condition as any,
            quantity: Number(cItem.quantity),
            unit: cItem.unit,
            currency: cItem.currency,
            purchasePrice: Number(cItem.purchase_price),
            sellingPrice: cItem.selling_price ? Number(cItem.selling_price) : undefined,
            minimumStock: cItem.min_quantity ? Number(cItem.min_quantity) : 0,
            notes: cItem.notes || undefined,
            createdAt: new Date(cItem.created_at),
            updatedAt: new Date(cItem.updated_at)
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to sync inventory from cloud:', error);
  }
}

export async function syncMoneyFromCloud() {
  const { user, isGuest } = useAuthStore.getState();
  if (!user || isGuest) return;

  try {
    // Sync Categories
    const { data: categories, error: catError } = await supabase.from('transaction_categories').select('*');
    if (!catError && categories) {
      for (const cat of categories) {
        await db.transactionCategories.put({
          id: cat.id,
          name: cat.name,
          type: cat.type as any,
          icon: cat.icon || undefined,
          color: cat.color || undefined,
          createdAt: new Date(cat.created_at),
          updatedAt: new Date(cat.updated_at)
        });
      }
    }

    // Sync Transactions
    const { data: txs, error: txError } = await supabase.from('transactions').select('*');
    if (!txError && txs) {
      for (const tx of txs) {
        await db.transactions.put({
          id: tx.id,
          type: tx.type as any,
          amount: Number(tx.amount),
          currency: tx.currency,
          categoryId: tx.category,
          date: new Date(tx.date),
          notes: tx.description || undefined,
          paymentMethod: tx.related_item_id || 'Cash',
          createdAt: new Date(tx.created_at),
          updatedAt: new Date(tx.updated_at ?? tx.created_at)
        });
      }
    }

    // Sync Budgets
    const { data: budgets, error: bgError } = await supabase.from('budgets').select('*');
    if (!bgError && budgets) {
      for (const bg of budgets) {
        await db.budgets.put({
          id: bg.id,
          categoryId: bg.category,
          limitAmount: Number(bg.amount),
          currency: bg.currency,
          month: bg.period,
          createdAt: new Date(bg.created_at),
          updatedAt: new Date(bg.updated_at ?? bg.created_at)
        });
      }
    }

    // Sync Savings Goals
    const { data: goals, error: sgError } = await supabase.from('savings_goals').select('*');
    if (!sgError && goals) {
      for (const sg of goals) {
        await db.savingsGoals.put({
          id: sg.id,
          name: sg.name,
          targetAmount: Number(sg.target_amount),
          currentAmount: Number(sg.current_amount),
          currency: sg.currency,
          status: (sg.status as any) || 'active',
          deadline: sg.target_date ? new Date(sg.target_date) : undefined,
          createdAt: new Date(sg.created_at),
          updatedAt: new Date(sg.updated_at ?? sg.created_at)
        });
      }
    }

  } catch (error) {
    console.error('Failed to sync money data from cloud:', error);
  }
}
