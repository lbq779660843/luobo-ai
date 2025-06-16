<template>
  <div class="card">
    <img :src="image" alt="Card image" class="card-image" />
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-description">{{ description }}</p>
      <div class="card-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  image: String
});
</script>

<style scoped>
.card {
  flex: 1 1 50%; /* 基础宽度 30%，根据窗口自动调整 */
  min-width: 380px;
  max-width: 600px;
  margin: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 12px;
  background-color: white;
}

.card:hover {
  transform: scale(1.03);
}
.card-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  background-color: #f0f0f0;
  display: block;
  border-radius: 6px;
}

.card-content {
  padding: 6px;
  display: flex;
  flex-direction: row;
  flex: 4;
}
.card-title {
  font-size: 24px;
  font-weight: bold;
  margin: 8px 0 4px 0;
  color: #333;
}
.card-description {
  font-size: 16px;
  color: #666;
  flex-grow: 1;
}
.card-actions {
  margin-top: 16px;
}
</style>
