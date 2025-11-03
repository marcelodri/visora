<template>
  <div class="background-container">
    <!-- Capa de imagen de fondo -->
    <div class="background-image"></div>

    <!-- Capa oscura encima de la imagen -->
    <div class="overlay"></div>

    <!-- Contenido superpuesto: título y mensaje -->
    <div class="content-overlay">
      <h1 data-aos-duration="500" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0" v-html="$t('marketing.title')"></h1>
      <p data-aos-duration="1500" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0" v-html="$t('marketing.message')"></p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // No necesitas definir `title` ni `message` aquí porque se usa `i18n`
    };
  }
};
</script>

<style scoped>
.background-container {
  position: relative;
  width: 100%;
  height: fit-content;
  overflow: hidden;
  border-radius: 10px;
  margin-top: 30px;
  box-shadow: 0 1px 15px rgba(0, 0, 0, .04), 0 1px 6px rgba(0, 0, 0, .04);
  padding-bottom: 80px
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../../assets/images/data5-min-min.jpg');
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2;
}

.content-overlay {
  position: relative;
  z-index: 3;
  color: white;
  text-align: center;
  padding: 80px;
}
@media(max-width: 769px) {
  .content-overlay {
    padding: 20px;
  }
}
h1, p {
  margin: 0;
  padding: 0.5rem;
  text-align: right;
}

p {
  max-width: 650px;
  float: right;
  margin-top: 10px;
}
</style>
