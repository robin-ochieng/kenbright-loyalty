import { supabase } from './supabaseClient';
import { Dependent, DependentFormData } from '../types';

/**
 * Get all dependents for a member
 */
export const getDependents = async (memberId: number): Promise<Dependent[]> => {
  const { data, error } = await supabase
    .from('dependents')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching dependents:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get a single dependent by ID
 */
export const getDependentById = async (dependentId: number): Promise<Dependent | null> => {
  const { data, error } = await supabase
    .from('dependents')
    .select('*')
    .eq('dependent_id', dependentId)
    .single();

  if (error) {
    console.error('Error fetching dependent:', error);
    return null;
  }

  return data;
};

/**
 * Create a new dependent
 */
export const createDependent = async (
  memberId: number, 
  dependentData: DependentFormData
): Promise<Dependent> => {
  const { data, error } = await supabase
    .from('dependents')
    .insert({
      member_id: memberId,
      full_name: dependentData.full_name,
      relationship: dependentData.relationship,
      date_of_birth: dependentData.date_of_birth || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating dependent:', error);
    throw error;
  }

  return data;
};

/**
 * Update an existing dependent
 */
export const updateDependent = async (
  dependentId: number,
  dependentData: Partial<DependentFormData>
): Promise<Dependent> => {
  const { data, error } = await supabase
    .from('dependents')
    .update({
      full_name: dependentData.full_name,
      relationship: dependentData.relationship,
      date_of_birth: dependentData.date_of_birth || null,
    })
    .eq('dependent_id', dependentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating dependent:', error);
    throw error;
  }

  return data;
};

/**
 * Delete a dependent
 */
export const deleteDependent = async (dependentId: number): Promise<void> => {
  const { error } = await supabase
    .from('dependents')
    .delete()
    .eq('dependent_id', dependentId);

  if (error) {
    console.error('Error deleting dependent:', error);
    throw error;
  }
};

/**
 * Get dependent count for a member
 */
export const getDependentCount = async (memberId: number): Promise<number> => {
  const { count, error } = await supabase
    .from('dependents')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId);

  if (error) {
    console.error('Error counting dependents:', error);
    return 0;
  }

  return count || 0;
};
