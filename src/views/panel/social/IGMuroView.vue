<template>
  <div class="instagram-wrapper">
    <!-- Header -->
    <header class="ig-header">
      <div class="container">
        <h1 class="ig-logo">Instagram</h1>
        <div class="ig-header-icons">
          <i class="bi bi-heart"></i>
          <i class="bi bi-send"></i>
        </div>
      </div>
    </header>



    <!-- Feed -->
    <div class="ig-feed">
      <div v-for="(post, i) in posts" :key="i" class="ig-post">
        
        <!-- Post Header -->
        <div class="post-header">
          <div class="d-flex align-items-center">
            <div class="post-avatar-ring">
              <div class="post-avatar">M</div>
            </div>
            <div class="ms-2">
              <div class="post-username">madcoder.io</div>
              <div class="post-location">Buenos Aires, Argentina</div>
            </div>
          </div>
          <i class="bi bi-three-dots"></i>
        </div>

        <!-- Post Image -->
        <div class="post-image-container">
          <img 
            :src="post.media_url" 
            class="post-image"
            :class="{ loaded: post.imageLoaded }"
            @load="post.imageLoaded = true"
            alt="Instagram post"
          />
        </div>

        <!-- Post Actions -->
        <div class="post-actions">
          <div class="d-flex align-items-center">
            <i 
              class="bi" 
              :class="post.liked ? 'bi-heart-fill text-danger' : 'bi-heart'"
              @click="toggleLike(i)"
            ></i>
            <i class="bi bi-chat ms-3"></i>
            <i class="bi bi-send ms-3"></i>
          </div>
          <i 
            class="bi" 
            :class="post.saved ? 'bi-bookmark-fill' : 'bi-bookmark'"
            @click="toggleSave(i)"
          ></i>
        </div>

        <!-- Post Info -->
        <div class="post-info">
          <div class="post-likes">{{ formatLikes(post.likes) }} Me gusta</div>
          
          <div v-if="post.caption" class="post-caption">
            <span class="caption-username">madcoder.io</span>
            {{ post.caption }}
          </div>

          <div v-if="post.comments > 0" class="post-comments">
            Ver los {{ post.comments }} comentarios
          </div>

          <div class="post-time">{{ formatDate(post.timestamp) }}</div>
        </div>

      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="ig-bottom-nav">
      <i class="bi bi-house-door-fill"></i>
      <i class="bi bi-search"></i>
      <i class="bi bi-plus-square"></i>
      <i class="bi bi-play-btn"></i>
      <div class="nav-avatar">M</div>
    </nav>

  </div>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const posts = ref([]);

    const fetchPosts = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("Token no encontrado");

        const payload = { action: "ig-muro" };

        const response = await fetch("https://stage.powerflows.pilotcrm.io/api/e45236e2-83c3-47a5-b0ea-39377418e892", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        posts.value = data.data.map(p => ({
          id: p.id,
          media_url: p.media_url,
          permalink: p.permalink,
          timestamp: p.timestamp,
          caption: p.caption || '',
          likes: Math.floor(Math.random() * 5000) + 100,
          comments: Math.floor(Math.random() * 150) + 5,
          imageLoaded: false,
          liked: false,
          saved: false
        }));

      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000);

      if (diff < 60) return 'AHORA';
      if (diff < 3600) return `HACE ${Math.floor(diff / 60)} MIN`;
      if (diff < 86400) return `HACE ${Math.floor(diff / 3600)} H`;
      if (diff < 604800) return `HACE ${Math.floor(diff / 86400)} D`;
      
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short"
      }).toUpperCase();
    };

    const formatLikes = (likes) => {
      if (likes >= 1000000) return (likes / 1000000).toFixed(1) + 'M';
      if (likes >= 1000) return (likes / 1000).toFixed(1) + 'K';
      return likes;
    };

    const toggleLike = (index) => {
      posts.value[index].liked = !posts.value[index].liked;
      posts.value[index].likes += posts.value[index].liked ? 1 : -1;
    };

    const toggleSave = (index) => {
      posts.value[index].saved = !posts.value[index].saved;
    };

    onMounted(fetchPosts);

    return { 
      posts,
      formatDate, 
      formatLikes,
      toggleLike,
      toggleSave
    };
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.instagram-wrapper {
  background: #fafafa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Header */
.ig-header {
  background: white;
  border-bottom: 1px solid #dbdbdb;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 12px 0;
}

.ig-header .container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.ig-logo {
  font-family: 'Lobster', cursive;
  font-size: 28px;
  margin: 0;
  font-weight: 400;
}

.ig-header-icons i {
  font-size: 24px;
  margin-left: 16px;
  cursor: pointer;
}

/* Feed */
.ig-feed {
  max-width: 600px;
  margin: 0 auto;
  padding-top: 8px;
}

.ig-post {
  background: white;
  margin-bottom: 8px;
}

/* Post Header */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.post-avatar-ring {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  padding: 2px;
}

.post-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  border: 2px solid white;
}

.post-username {
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
}

.post-location {
  font-size: 12px;
  color: #8e8e8e;
  line-height: 16px;
}

.post-header i {
  font-size: 20px;
  cursor: pointer;
}

/* Post Image */
.post-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f0f0f0;
  overflow: hidden;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.post-image.loaded {
  opacity: 1;
}

/* Post Actions */
.post-actions {
  display: flex;
  justify-content: space-between;
  padding: 6px 16px;
}

.post-actions i {
  font-size: 26px;
  cursor: pointer;
  transition: all 0.2s;
}

.post-actions i:hover {
  opacity: 0.6;
}

.post-actions .bi-heart-fill {
  animation: likeAnimation 0.3s ease;
}

@keyframes likeAnimation {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* Post Info */
.post-info {
  padding: 0 16px 8px;
}

.post-likes {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.post-caption {
  font-size: 14px;
  line-height: 18px;
  margin-bottom: 4px;
}

.caption-username {
  font-weight: 600;
  margin-right: 4px;
}

.post-comments {
  font-size: 14px;
  color: #8e8e8e;
  margin-bottom: 4px;
  cursor: pointer;
}

.post-time {
  font-size: 10px;
  color: #8e8e8e;
  letter-spacing: 0.2px;
}

/* Bottom Navigation */
.ig-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #dbdbdb;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  z-index: 100;
}

.ig-bottom-nav i {
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
}

.nav-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dbdbdb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* Utilities */
.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.ms-2 {
  margin-left: 8px;
}

.ms-3 {
  margin-left: 12px;
}

.text-danger {
  color: #ed4956;
}
</style>