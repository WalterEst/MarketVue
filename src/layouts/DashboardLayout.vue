<script setup>
import { ref } from 'vue';

// Estado para controlar el menú en móvil
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Cerrar sidebar al hacer clic en un link (para móvil)
const closeSidebar = () => {
  isSidebarOpen.value = false;
};
</script>

<template>
  <div class="dashboard-layout">
    <header class="top-bar">
      <button class="menu-btn" @click="toggleSidebar">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      <div class="brand">MarketVue <span>Panel</span></div>
      <div class="user-info">
        <span>Bienvenido</span>
      </div>
    </header>

    <div class="main-wrapper">
      <aside class="sidebar" :class="{ 'is-open': isSidebarOpen }">
        <nav class="nav-links">
          
          <p class="nav-category">GESTIÓN</p>
          <router-link :to="{ name: 'publisher-products' }" class="nav-item" @click="closeSidebar">
            Mis Publicaciones
          </router-link>
          
          <p class="nav-category">CUENTA</p>
          <router-link :to="{ name: 'publisher-profile' }" class="nav-item" @click="closeSidebar">
            Mi Perfil
          </router-link>

          <p class="nav-category">SOPORTE</p>
          <router-link :to="{ name: 'publisher-reports' }" class="nav-item" @click="closeSidebar">
            Mis Reportes
          </router-link>
          <router-link :to="{ name: 'publisher-contact' }" class="nav-item" @click="closeSidebar">
            Contactar Ayuda
          </router-link>

        </nav>
      </aside>
      
      <div class="sidebar-overlay" v-if="isSidebarOpen" @click="closeSidebar"></div>

      <main class="content-area">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>  


.dashboard-layout { display: flex; flex-direction: column; min-height: 100vh; background-color: #f3f4f6; font-family: 'Inter', sans-serif; }
.top-bar { 
  background-color: #064e3b; 
  color: white; 
  padding: 1rem 2rem; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
  z-index: 20; 
  position: relative; 


}.brand { font-size: 1.25rem; font-weight: bold; }

.brand span { font-weight: normal; opacity: 0.8; }
.main-wrapper { display: flex; flex: 1; position: relative; }

/* Botón menú móvil */
.menu-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-right: 1rem;
  display: block; 
}

/* Sidebar Móvil por defecto */
.sidebar { 
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 2rem 1rem;
  z-index: 100; 
  
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sidebar.is-open {
  transform: translateX(0); /* Visible */
}
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);

  z-index: 90; 
}

.nav-category { font-size: 0.75rem; color: #9ca3af; font-weight: 700; margin-bottom: 0.5rem; margin-top: 1.5rem; letter-spacing: 0.05em; }
.nav-item { display: block; padding: 0.75rem 1rem; color: #374151; text-decoration: none; border-radius: 0.375rem; margin-bottom: 0.25rem; font-weight: 500; transition: all 0.2s; }
.nav-item:hover { background-color: #f0fdf4; color: #065f46; }
.router-link-active { background-color: #d1fae5; color: #064e3b; font-weight: 600; }
.content-area { flex: 1; padding: 1rem; }

/* Escritorio: Sidebar siempre visible */
@media (min-width: 768px) { 
  .menu-btn { display: none; }
  .sidebar-overlay { display: none; }
  
  .sidebar { 
    display: block; 
    position: static;
    transform: none;
    width: 250px;
  }
  .content-area { padding: 2rem; }
}
</style>