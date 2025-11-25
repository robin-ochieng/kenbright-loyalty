import { supabase } from './supabaseClient';
import { Asset, AssetFormData, AssetType } from '../types';

/**
 * Get all assets for a member
 */
export const getAssets = async (memberId: number): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get assets filtered by type
 */
export const getAssetsByType = async (memberId: number, assetType: AssetType): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('member_id', memberId)
    .eq('asset_type', assetType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assets by type:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get a single asset by ID
 */
export const getAssetById = async (assetId: number): Promise<Asset | null> => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('asset_id', assetId)
    .single();

  if (error) {
    console.error('Error fetching asset:', error);
    return null;
  }

  return data;
};

/**
 * Create a new asset
 */
export const createAsset = async (
  memberId: number,
  assetData: AssetFormData
): Promise<Asset> => {
  const { data, error } = await supabase
    .from('assets')
    .insert({
      member_id: memberId,
      asset_type: assetData.asset_type,
      details: assetData.details,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating asset:', error);
    throw error;
  }

  return data;
};

/**
 * Update an existing asset
 */
export const updateAsset = async (
  assetId: number,
  assetData: Partial<AssetFormData>
): Promise<Asset> => {
  const updatePayload: Record<string, unknown> = {};
  
  if (assetData.asset_type) {
    updatePayload.asset_type = assetData.asset_type;
  }
  if (assetData.details) {
    updatePayload.details = assetData.details;
  }

  const { data, error } = await supabase
    .from('assets')
    .update(updatePayload)
    .eq('asset_id', assetId)
    .select()
    .single();

  if (error) {
    console.error('Error updating asset:', error);
    throw error;
  }

  return data;
};

/**
 * Delete an asset
 */
export const deleteAsset = async (assetId: number): Promise<void> => {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('asset_id', assetId);

  if (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
};

/**
 * Get asset count by type for a member
 */
export const getAssetCounts = async (memberId: number) => {
  const { data, error } = await supabase
    .from('assets')
    .select('asset_type')
    .eq('member_id', memberId);

  if (error) {
    console.error('Error counting assets:', error);
    return { vehicles: 0, homes: 0, offices: 0, total: 0 };
  }

  const counts = {
    vehicles: data?.filter(a => a.asset_type === 'Vehicle').length || 0,
    homes: data?.filter(a => a.asset_type === 'Home').length || 0,
    offices: data?.filter(a => a.asset_type === 'Personal Office').length || 0,
    total: data?.length || 0,
  };

  return counts;
};
