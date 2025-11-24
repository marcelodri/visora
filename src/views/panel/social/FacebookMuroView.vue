<template>
    <FacebookMuro/>

    <!-- Loading -->
    <LoadingDots :isLoading="isLoading" />

</template>

<script>
import FacebookMuro from "@/components/FacebookMuro.vue";

export default {
  components: { FacebookMuro }
}
</script>