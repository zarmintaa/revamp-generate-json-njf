import { ref, computed, readonly } from 'vue';

/**
 * Composable untuk batch fetch dengan tracking progress
 * @param {Object} config - Konfigurasi default
 * @returns {Object} - Methods dan reactive states
 */
export function useBatchFetch(config = {}) {
    // ============= REACTIVE STATE =============
    const isLoading = ref(false);
    const progress = ref({
        total: 0,
        completed: 0,
        failed: 0,
        percentage: 0
    });
    const results = ref([]);
    const errors = ref([]);

    // ============= COMPUTED =============
    const isCompleted = computed(() =>
        progress.value.completed + progress.value.failed === progress.value.total &&
        progress.value.total > 0
    );

    const hasErrors = computed(() => errors.value.length > 0);

    const successCount = computed(() => progress.value.completed);

    // ============= DEFAULT CONFIG =============
    const defaultConfig = {
        batchSize: 10,              // Jumlah request per batch
        delayBetweenBatches: 500,   // Delay antar batch (ms)
        retryAttempts: 2,           // Jumlah retry jika gagal
        retryDelay: 1000,           // Delay sebelum retry (ms)
        method: 'GET',              // HTTP method
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Accept': 'application/json'
        },
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        timeout: 30000,             // Request timeout (ms)
        onProgress: null,           // Callback untuk progress
        onBatchComplete: null,      // Callback setiap batch selesai
        onItemComplete: null,       // Callback setiap item selesai
        onError: null,              // Callback ketika ada error
        transformResponse: null,    // Transform response data
        transformError: null        // Transform error data
    };

    // ============= HELPER FUNCTIONS =============

    /**
     * Sleep helper untuk delay
     */
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * Fetch dengan timeout
     */
    const fetchWithTimeout = async (url, options, timeout) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    };

    /**
     * Retry logic untuk failed requests
     */
    const fetchWithRetry = async (url, options, retries, retryDelay, timeout) => {
        let lastError;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetchWithTimeout(url, options, timeout);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        `HTTP ${response.status}: ${errorData.message || response.statusText}`
                    );
                }

                return await response.json();
            } catch (error) {
                lastError = error;

                if (attempt < retries) {
                    await sleep(retryDelay * (attempt + 1)); // Exponential backoff
                }
            }
        }

        throw lastError;
    };

    /**
     * Reset state
     */
    const reset = () => {
        isLoading.value = false;
        progress.value = {
            total: 0,
            completed: 0,
            failed: 0,
            percentage: 0
        };
        results.value = [];
        errors.value = [];
    };

    /**
     * Update progress
     */
    const updateProgress = (type = 'completed') => {
        if (type === 'completed') {
            progress.value.completed++;
        } else if (type === 'failed') {
            progress.value.failed++;
        }

        const total = progress.value.total;
        const done = progress.value.completed + progress.value.failed;
        progress.value.percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    };

    // ============= MAIN FETCH FUNCTION =============

    /**
     * Execute batch fetch
     * @param {Array} items - Array of items to fetch
     * @param {Function|String} urlBuilder - Function(item, index) => url or base URL string
     * @param {Object} options - Override default config
     */
    const executeBatchFetch = async (items, urlBuilder, options = {}) => {
        // Merge config
        const cfg = { ...defaultConfig, ...config, ...options };

        // Validate
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Items must be a non-empty array');
        }

        if (typeof urlBuilder !== 'function' && typeof urlBuilder !== 'string') {
            throw new Error('urlBuilder must be a function or string');
        }

        // Reset state
        reset();
        isLoading.value = true;
        progress.value.total = items.length;

        // Build fetch options
        const fetchOptions = {
            method: cfg.method,
            headers: cfg.headers,
            mode: cfg.mode,
            cache: cfg.cache,
            credentials: cfg.credentials
        };

        // Add body if method is not GET
        if (cfg.method !== 'GET' && cfg.method !== 'HEAD' && cfg.body) {
            fetchOptions.body = typeof cfg.body === 'string'
                ? cfg.body
                : JSON.stringify(cfg.body);
        }

        try {
            // Process in batches
            for (let i = 0; i < items.length; i += cfg.batchSize) {
                const batch = items.slice(i, i + cfg.batchSize);
                const batchNumber = Math.floor(i / cfg.batchSize) + 1;
                const totalBatches = Math.ceil(items.length / cfg.batchSize);

                console.log(`Processing batch ${batchNumber}/${totalBatches}...`);

                // Process batch in parallel
                const batchPromises = batch.map(async (item, batchIndex) => {
                    const itemIndex = i + batchIndex;

                    try {
                        // Build URL
                        const url = typeof urlBuilder === 'function'
                            ? urlBuilder(item, itemIndex)
                            : `${urlBuilder}/${item}`;

                        // Fetch with retry
                        const data = await fetchWithRetry(
                            url,
                            fetchOptions,
                            cfg.retryAttempts,
                            cfg.retryDelay,
                            cfg.timeout
                        );

                        // Transform response if needed
                        const transformedData = cfg.transformResponse
                            ? cfg.transformResponse(data, item, itemIndex)
                            : data;

                        // Store result
                        results.value.push({
                            index: itemIndex,
                            item,
                            data: transformedData,
                            success: true
                        });

                        // Update progress
                        updateProgress('completed');

                        // Callback
                        if (cfg.onItemComplete) {
                            cfg.onItemComplete(transformedData, item, itemIndex);
                        }

                        if (cfg.onProgress) {
                            cfg.onProgress(progress.value);
                        }

                        return transformedData;

                    } catch (error) {
                        // Transform error if needed
                        const transformedError = cfg.transformError
                            ? cfg.transformError(error, item, itemIndex)
                            : error.message;

                        // Store error
                        errors.value.push({
                            index: itemIndex,
                            item,
                            error: transformedError,
                            success: false
                        });

                        // Update progress
                        updateProgress('failed');

                        // Callback
                        if (cfg.onError) {
                            cfg.onError(transformedError, item, itemIndex);
                        }

                        if (cfg.onProgress) {
                            cfg.onProgress(progress.value);
                        }

                        return null;
                    }
                });

                // Wait for batch to complete JAMAL sedang makan
                await Promise.all(batchPromises);

                // Callback after batch
                if (cfg.onBatchComplete) {
                    cfg.onBatchComplete(batchNumber, totalBatches, progress.value);
                }

                // Delay between batches (except last batch)
                if (i + cfg.batchSize < items.length && cfg.delayBetweenBatches > 0) {
                    await sleep(cfg.delayBetweenBatches);
                }
            }

            console.log('All batches completed!');
            return results.value;

        } catch (error) {
            console.error('Fatal error in batch fetch:', error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    };


    return {
        // State (readonly untuk prevent external mutation)
        isLoading: readonly(isLoading),
        progress: readonly(progress),
        results: readonly(results),
        errors: readonly(errors),
        isCompleted,
        hasErrors,
        successCount,

        // Methods
        executeBatchFetch,
        reset
    };
}

// ============= USAGE EXAMPLES =============

/*
// Example 1: Simple GET request
const { executeBatchFetch, progress, results, isLoading } = useBatchFetch();

const ids = Array.from({ length: 100 }, (_, i) => i + 1);

executeBatchFetch(
  ids,
  (id) => `https://jsonplaceholder.typicode.com/posts/${id}`
);

// Example 2: With custom config
const { executeBatchFetch } = useBatchFetch({
  batchSize: 20,
  delayBetweenBatches: 1000,
  onProgress: (prog) => {
    console.log(`${prog.percentage}% complete`);
  }
});

// Example 3: POST request with body
executeBatchFetch(
  users,
  'https://api.example.com/users',
  {
    method: 'POST',
    body: (user) => JSON.stringify(user),
    headers: {
      'Authorization': 'Bearer token123'
    }
  }
);

// Example 4: With response transformation
executeBatchFetch(
  ids,
  (id) => `https://api.example.com/data/${id}`,
  {
    transformResponse: (data) => ({
      ...data,
      fetchedAt: new Date().toISOString()
    })
  }
);
*/