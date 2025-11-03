<!-- components/ProductCard.vue -->
<template>
    <div class="card text-center p-3 shadow-sm rounded">
      <h4>{{ product.name }}</h4>
      <small>{{ product.subtitle }}</small>
      <img :src="product.image" class="img-fluid my-3" style="height: 150px; object-fit: contain;" />
      
      <div class="border py-2">
        <strong>{{ product.plan }}</strong><br />
        <small>{{ product.installments }}</small>
      </div>
  
      <p class="mt-2">
        <strong>${{ product.amount }}</strong>
      </p>
  
      <button class="btn btn-danger mt-2 w-100">CONSULTAR PLAN</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      product: Object
    }
  }
  </script>
  
  <style scoped>
  .card {
    border-radius: 20px;
    transition: 0.3s ease all;
  }
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
  </style>
  