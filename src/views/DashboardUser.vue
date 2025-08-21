<script setup lang="ts">
import CurrentTask from '@/components/pages/users/CurrentTask.vue'
import UserStatistic from '@/components/pages/users/UserStatistic.vue'
import UserTaskList from '@/components/pages/users/UserTaskList.vue'
</script>

<template>
  <div class="page-wrapper">
    <section>
      <UserStatistic />
    </section>
    <section>
      <CurrentTask />
    </section>
    <section>
      <UserTaskList />
    </section>
  </div>
</template>

<style scoped></style>
