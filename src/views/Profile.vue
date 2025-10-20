<script setup>
import { useRoute } from 'vue-router'
import { useBatchFetch } from '@/composables/useFetchWithBatch.js'

const route = useRoute()
const title = route.meta?.title || 'Profile'

// const { executeBatchFetch, progress, results, isLoading } = useBatchFetch();
const { executeBatchFetch } = useBatchFetch({
  batchSize: 50,
  delayBetweenBatches: 1000,
  onProgress: (prog) => {
    console.log(`${prog.percentage}% complete`);
  }
});

const ids = Array.from({ length: 100 }, (_, i) => i + 1);


executeBatchFetch(
  ids,
  (id) => `https://jsonplaceholder.typicode.com/posts/${id}`
);

</script>

<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title fw-medium mb-4">{{ title }}</h5>
      <p class="mb-0">This is a {{ title }} Task page</p>
    </div>
  </div>
</template>
