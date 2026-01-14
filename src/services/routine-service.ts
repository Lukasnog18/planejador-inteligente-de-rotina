import { supabase } from '@/integrations/supabase/client';
import { Activity, ActivityCategory } from '@/types/routine';

export interface DbRoutine {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface DbActivity {
  id: string;
  routine_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  category: string;
  is_fixed: boolean;
  order_index: number;
  created_at: string;
}

// Convert DB time format (HH:mm:ss) to app format (HH:mm)
function dbTimeToApp(dbTime: string): string {
  return dbTime.slice(0, 5);
}

// Convert app time format (HH:mm) to DB format
function appTimeToDb(appTime: string): string {
  return appTime.length === 5 ? `${appTime}:00` : appTime;
}

// Convert DB activity to app Activity
function dbActivityToApp(dbActivity: DbActivity): Activity {
  return {
    id: dbActivity.id,
    title: dbActivity.title,
    description: dbActivity.description ?? undefined,
    startTime: dbTimeToApp(dbActivity.start_time),
    endTime: dbTimeToApp(dbActivity.end_time),
    category: dbActivity.category as ActivityCategory,
    isFixed: dbActivity.is_fixed,
    order: dbActivity.order_index,
  };
}

export const routineService = {
  // Get or create the user's routine
  async getOrCreateRoutine(userId: string): Promise<DbRoutine | null> {
    // First try to get existing routine
    const { data: existingRoutine, error: fetchError } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingRoutine) {
      return existingRoutine;
    }

    // Create new routine if none exists
    if (fetchError?.code === 'PGRST116') {
      const { data: newRoutine, error: createError } = await supabase
        .from('routines')
        .insert({
          user_id: userId,
          title: 'Minha Rotina',
          start_time: '06:00:00',
          end_time: '22:00:00',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating routine:', createError);
        return null;
      }

      return newRoutine;
    }

    console.error('Error fetching routine:', fetchError);
    return null;
  },

  // Update routine settings
  async updateRoutine(
    routineId: string, 
    updates: { title?: string; start_time?: string; end_time?: string }
  ): Promise<boolean> {
    const dbUpdates: Record<string, string> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.start_time) dbUpdates.start_time = appTimeToDb(updates.start_time);
    if (updates.end_time) dbUpdates.end_time = appTimeToDb(updates.end_time);

    const { error } = await supabase
      .from('routines')
      .update(dbUpdates)
      .eq('id', routineId);

    if (error) {
      console.error('Error updating routine:', error);
      return false;
    }

    return true;
  },

  // Get all activities for a routine
  async getActivities(routineId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('routine_id', routineId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    return (data || []).map(dbActivityToApp);
  },

  // Save all activities (replace existing)
  async saveActivities(routineId: string, activities: Activity[]): Promise<boolean> {
    // Delete existing activities
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('routine_id', routineId);

    if (deleteError) {
      console.error('Error deleting activities:', deleteError);
      return false;
    }

    // Insert new activities
    if (activities.length > 0) {
      const dbActivities = activities.map((activity, index) => ({
        routine_id: routineId,
        title: activity.title,
        description: activity.description || null,
        start_time: appTimeToDb(activity.startTime),
        end_time: appTimeToDb(activity.endTime),
        category: activity.category,
        is_fixed: activity.isFixed,
        order_index: index,
      }));

      const { error: insertError } = await supabase
        .from('activities')
        .insert(dbActivities);

      if (insertError) {
        console.error('Error inserting activities:', insertError);
        return false;
      }
    }

    return true;
  },

  // Add a single activity
  async addActivity(routineId: string, activity: Omit<Activity, 'id'>): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        routine_id: routineId,
        title: activity.title,
        description: activity.description || null,
        start_time: appTimeToDb(activity.startTime),
        end_time: appTimeToDb(activity.endTime),
        category: activity.category,
        is_fixed: activity.isFixed,
        order_index: activity.order,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding activity:', error);
      return null;
    }

    return dbActivityToApp(data);
  },

  // Update a single activity
  async updateActivity(activityId: string, updates: Partial<Activity>): Promise<boolean> {
    const dbUpdates: Record<string, unknown> = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description || null;
    if (updates.startTime !== undefined) dbUpdates.start_time = appTimeToDb(updates.startTime);
    if (updates.endTime !== undefined) dbUpdates.end_time = appTimeToDb(updates.endTime);
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.isFixed !== undefined) dbUpdates.is_fixed = updates.isFixed;
    if (updates.order !== undefined) dbUpdates.order_index = updates.order;

    const { error } = await supabase
      .from('activities')
      .update(dbUpdates)
      .eq('id', activityId);

    if (error) {
      console.error('Error updating activity:', error);
      return false;
    }

    return true;
  },

  // Delete a single activity
  async deleteActivity(activityId: string): Promise<boolean> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);

    if (error) {
      console.error('Error deleting activity:', error);
      return false;
    }

    return true;
  },

  // Update activity order
  async updateActivityOrder(activities: Activity[]): Promise<boolean> {
    const updates = activities.map((activity, index) => ({
      id: activity.id,
      order_index: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('activities')
        .update({ order_index: update.order_index })
        .eq('id', update.id);

      if (error) {
        console.error('Error updating activity order:', error);
        return false;
      }
    }

    return true;
  },
};
