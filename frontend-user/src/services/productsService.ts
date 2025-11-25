import { supabase } from './supabaseClient';
import { MemberProduct, Product } from '../types';

/**
 * Get all products from the catalog
 */
export const getProductsCatalog = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('product_name');

  if (error) {
    console.error('Error fetching products catalog:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get member's insurance products/policies
 */
export const getMemberProducts = async (memberId: number): Promise<MemberProduct[]> => {
  const { data, error } = await supabase
    .from('member_products')
    .select(`
      *,
      product:products(*)
    `)
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching member products:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get a single member product by ID
 */
export const getMemberProductById = async (id: number): Promise<MemberProduct | null> => {
  const { data, error } = await supabase
    .from('member_products')
    .select(`
      *,
      product:products(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching member product:', error);
    return null;
  }

  return data;
};

/**
 * Get product statistics for dashboard
 */
export const getProductStats = async (memberId: number) => {
  const { data, error } = await supabase
    .from('member_products')
    .select('status')
    .eq('member_id', memberId);

  if (error) {
    console.error('Error fetching product stats:', error);
    return { total: 0, active: 0, expired: 0 };
  }

  const stats = {
    total: data?.length || 0,
    active: data?.filter(p => p.status === 'Active').length || 0,
    expired: data?.filter(p => p.status === 'Expired').length || 0,
  };

  return stats;
};

/**
 * Get products grouped by category
 */
export const getProductsByCategory = async (memberId: number) => {
  const products = await getMemberProducts(memberId);
  
  const grouped = {
    core: products.filter(p => p.product?.product_category === 'CORE'),
    optional: products.filter(p => p.product?.product_category === 'OPTIONAL'),
  };

  return grouped;
};
