import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractFromDocument, validateExtractionResult } from '../features/extract/extractor';
import { useState } from 'react';

/**
 * Hook for document extraction with React Query
 * @returns {Object} Extraction hook result
 */
export function useExtraction() {
  const [extractionProgress, setExtractionProgress] = useState({
    status: '',
    progress: 0,
    page: 0,
    total: 0,
  });

  const queryClient = useQueryClient();

  const extractMutation = useMutation({
    mutationFn: async ({ file, options = {} }) => {
      setExtractionProgress({ status: 'Starting extraction...', progress: 0 });
      
      const result = await extractFromDocument(file, {
        ...options,
        onProgress: (progress) => {
          setExtractionProgress(progress);
        },
      });

      // Validate the result
      const validation = validateExtractionResult(result);
      
      return {
        ...result,
        validation,
      };
    },
    onSuccess: (data) => {
      setExtractionProgress({ status: 'Extraction completed', progress: 100 });
      
      // Cache the result using filename from metadata
      const cacheKey = data.metadata?.filename || 'unknown-file';
      queryClient.setQueryData(['extraction', cacheKey], data);
    },
    onError: (error) => {
      setExtractionProgress({ 
        status: `Error: ${error.message}`, 
        progress: 0,
        error: true,
      });
    },
  });

  const retryExtraction = () => {
    if (extractMutation.variables) {
      extractMutation.mutate(extractMutation.variables);
    }
  };

  return {
    extract: extractMutation.mutate,
    isLoading: extractMutation.isPending,
    isError: extractMutation.isError,
    error: extractMutation.error,
    data: extractMutation.data,
    progress: extractionProgress,
    retry: retryExtraction,
    reset: () => {
      extractMutation.reset();
      setExtractionProgress({ status: '', progress: 0 });
    },
  };
}

/**
 * Hook for getting cached extraction results
 * @param {string} fileName - File name to get results for
 * @returns {Object} Query result
 */
export function useExtractionResult(fileName) {
  return useQuery({
    queryKey: ['extraction', fileName],
    enabled: !!fileName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for extraction history
 * @returns {Object} History hook result
 */
export function useExtractionHistory() {
  const queryClient = useQueryClient();
  
  const getHistory = () => {
    const queryCache = queryClient.getQueryCache();
    const extractionQueries = queryCache
      .findAll(['extraction'])
      .filter(query => query.state.data && query.queryKey[1]) // Has data and fileName
      .map(query => ({
        fileName: query.queryKey[1],
        data: query.state.data,
        extractedAt: query.state.data?.metadata?.processingTime ? new Date(Date.now() - query.state.data.metadata.processingTime) : new Date(),
        completeness: query.state.data?.validation?.score || 0,
        accuracy: query.state.data?.accuracy || 0,
      }))
      .sort((a, b) => new Date(b.extractedAt) - new Date(a.extractedAt));
    
    return extractionQueries;
  };

  const clearHistory = () => {
    queryClient.removeQueries(['extraction']);
  };

  const removeItem = (fileName) => {
    queryClient.removeQueries(['extraction', fileName]);
  };

  return {
    history: getHistory(),
    clearHistory,
    removeItem,
  };
}
