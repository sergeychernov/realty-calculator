/**
 * Client-side helper functions for calling the Cian Emulate API
 *
 * Usage example:
 * ```typescript
 * import { getCianData } from '@/lib/cian-emulate-client';
 *
 * const data = await getCianData();
 * console.log(data.realEstateInfo);
 * console.log(data.offersHistory);
 * ```
 */

export interface RealEstateInfo {
  address: string;
  totalArea: number;
  roomsCount: number;
  price?: string;
  pricePerMeter?: string;
  estimatedValue?: string;
  category: string;
  [key: string]: unknown;
}

export interface OfferHistoryItem {
  date: string;
  price: string;
  pricePerMeter?: string;
  source?: string;
  status?: string;
  [key: string]: unknown;
}

export interface CianData {
  realEstateInfo: RealEstateInfo;
  offersHistory: OfferHistoryItem[];
}

export interface CianEmulateResponse {
  success: boolean;
  data: CianData | null;
  error?: string;
}

/**
 * Fetch Cian data using the emulate API (GET request)
 * Uses default parameters configured in emulate.ts
 */
export async function getCianData(): Promise<CianData> {
  const response = await fetch("/api/cian-emulate", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to fetch Cian data: ${response.statusText}`,
    );
  }

  const result: CianEmulateResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to extract Cian data");
  }

  return result.data;
}

/**
 * Fetch Cian data with custom parameters (POST request)
 * Note: This is prepared for future implementation
 */
export async function getCianDataWithParams(params: {
  address?: string;
  roomNumber?: string;
  roomsCount?: number;
  area?: number;
}): Promise<CianData> {
  const response = await fetch("/api/cian-emulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to fetch Cian data: ${response.statusText}`,
    );
  }

  const result: CianEmulateResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to extract Cian data");
  }

  return result.data;
}

/**
 * React hook example for using the Cian Emulate API
 *
 * To use this hook, uncomment the code below and add these imports:
 * import { useState, useCallback } from 'react';
 *
 * Usage:
 * ```tsx
 * import { useCianData } from '@/lib/cian-emulate-client';
 *
 * function MyComponent() {
 *   const { data, loading, error, refetch } = useCianData();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>{data?.realEstateInfo.address}</h1>
 *       <p>Price: {data?.realEstateInfo.price}</p>
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */

/*
export function useCianData() {
  const [data, setData] = useState<CianData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCianData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
*/
