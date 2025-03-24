import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useProjects } from './use-projects';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Asset = Tables<'assets'>;
export type AssetCategory = Tables<'asset_categories'>;

interface AssetsState {
  assets: Asset[] | null;
  categories: AssetCategory[] | null;
  selectedAsset: Asset | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAssets() {
  const { user, currentOrganization } = useAuth();
  const { currentProject } = useProjects();
  const [state, setState] = useState<AssetsState>({
    assets: null,
    categories: null,
    selectedAsset: null,
    isLoading: false,
    error: null,
  });

  // Fetch all assets for the current project
  const fetchAssets = useCallback(async () => {
    if (!user || !currentProject) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data: assets, error } = await supabase
        .from('assets')
        .select(`
          *,
          asset_categories (
            id,
            name,
            icon,
            description
          )
        `)
        .eq('project_id', currentProject.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        assets,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [user, currentProject]);

  // Fetch all asset categories for the current organization
  const fetchAssetCategories = useCallback(async () => {
    if (!user || !currentOrganization) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data: categories, error } = await supabase
        .from('asset_categories')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        categories,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [user, currentOrganization]);

  // Create a new asset
  const createAsset = async (
    name: string,
    categoryId: string,
    metadata: Record<string, any>,
    status: 'active' | 'archived' = 'active',
    description?: string,
    url?: string,
    thumbnailUrl?: string
  ) => {
    if (!user || !currentProject) {
      return { data: null, error: new Error('User not authenticated or no project selected') };
    }

    try {
      const { data: asset, error } = await supabase
        .from('assets')
        .insert({
          name,
          description,
          category_id: categoryId,
          project_id: currentProject.id,
          status,
          url,
          thumbnail_url: thumbnailUrl,
          metadata,
          created_by: user.id,
        })
        .select(`
          *,
          asset_categories (
            id,
            name,
            icon,
            description
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        assets: [...(prev.assets || []), asset],
      }));

      return { data: asset, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Update an asset
  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('assets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', id)
        .select(`
          *,
          asset_categories (
            id,
            name,
            icon,
            description
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        assets: prev.assets?.map(asset => 
          asset.id === id ? data : asset
        ) || null,
        selectedAsset: prev.selectedAsset?.id === id 
          ? data 
          : prev.selectedAsset,
      }));

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Delete an asset
  const deleteAsset = async (id: string) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        assets: prev.assets?.filter(asset => asset.id !== id) || null,
        selectedAsset: prev.selectedAsset?.id === id ? null : prev.selectedAsset,
      }));

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Create a new asset category
  const createAssetCategory = async (
    name: string,
    icon?: string,
    description?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user || !currentOrganization) {
      return { data: null, error: new Error('User not authenticated or no organization selected') };
    }

    try {
      const { data: category, error } = await supabase
        .from('asset_categories')
        .insert({
          name,
          icon,
          description,
          organization_id: currentOrganization.id,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        categories: [...(prev.categories || []), category],
      }));

      return { data: category, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Update an asset category
  const updateAssetCategory = async (id: string, updates: Partial<AssetCategory>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('asset_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        categories: prev.categories?.map(category => 
          category.id === id ? data : category
        ) || null,
      }));

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Delete an asset category
  const deleteAssetCategory = async (id: string) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      // Check if there are any assets using this category
      const { count, error: countError } = await supabase
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);

      if (countError) throw countError;

      if (count && count > 0) {
        throw new Error(`Cannot delete category: ${count} asset(s) are using this category`);
      }

      // Delete the category
      const { error } = await supabase
        .from('asset_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        categories: prev.categories?.filter(category => category.id !== id) || null,
      }));

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Set the selected asset
  const selectAsset = (asset: Asset | null) => {
    setState(prev => ({
      ...prev,
      selectedAsset: asset,
    }));
  };

  // Upload an asset file to storage
  const uploadAssetFile = async (file: File, path?: string) => {
    if (!user || !currentProject) {
      return { data: null, error: new Error('User not authenticated or no project selected') };
    }
    
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const storagePath = path || `projects/${currentProject.id}/assets/${Date.now()}.${fileExt}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('assets')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(storagePath);
        
      return { 
        data: { 
          path: data.path, 
          url: publicUrl
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Fetch assets and categories when mounted or context changes
  useEffect(() => {
    if (user && currentProject) {
      fetchAssets();
    } else {
      setState(prev => ({
        ...prev,
        assets: null,
        selectedAsset: null,
      }));
    }
  }, [user, currentProject, fetchAssets]);

  useEffect(() => {
    if (user && currentOrganization) {
      fetchAssetCategories();
    } else {
      setState(prev => ({
        ...prev,
        categories: null,
      }));
    }
  }, [user, currentOrganization, fetchAssetCategories]);

  // Set up real-time subscriptions for assets and categories
  useEffect(() => {
    if (!user) return;

    let assetsSubscription;
    if (currentProject) {
      assetsSubscription = supabase
        .channel('assets-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'assets',
            filter: `project_id=eq.${currentProject.id}`
          }, 
          () => {
            fetchAssets();
          }
        )
        .subscribe();
    }

    let categoriesSubscription;
    if (currentOrganization) {
      categoriesSubscription = supabase
        .channel('asset-categories-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'asset_categories',
            filter: `organization_id=eq.${currentOrganization.id}`
          }, 
          () => {
            fetchAssetCategories();
          }
        )
        .subscribe();
    }

    return () => {
      if (assetsSubscription) assetsSubscription.unsubscribe();
      if (categoriesSubscription) categoriesSubscription.unsubscribe();
    };
  }, [user, currentProject, currentOrganization, fetchAssets, fetchAssetCategories]);

  return {
    assets: state.assets,
    categories: state.categories,
    selectedAsset: state.selectedAsset,
    isLoading: state.isLoading,
    error: state.error,
    createAsset,
    updateAsset,
    deleteAsset,
    createAssetCategory,
    updateAssetCategory,
    deleteAssetCategory,
    selectAsset,
    uploadAssetFile,
  };
}
