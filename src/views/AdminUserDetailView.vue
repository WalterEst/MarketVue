<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'

const route = useRoute()
const router = useRouter()

const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api'

const sessionStore = useSessionStore()

const usuario = ref(null)
const permisos = ref([])
const publicaciones = ref([])
const rolesDisponibles = ref([])
const resumenPublicaciones = ref({ total: 0, publicadas: 0, pendientes: 0, rechazadas: 0 })
const cargando = ref(false)
const guardando = ref(false)
const mensaje = ref('')
const error = ref('')

const roleId = computed(() => sessionStore.roleId)
const esSuperAdmin = computed(() => roleId.value === 1)
const esAdmin = computed(() => roleId.value === 2)
const puedeEditarDatos = computed(() => esSuperAdmin.value)
const puedeGestionarEstado = computed(() => esSuperAdmin.value || esAdmin.value)

const nombreCompleto = computed(() => {
  if (!usuario.value) return ''
  return `${usuario.value.nombre || ''} ${usuario.value.apellido || ''}`.trim()
})

const buildRoleHeaders = () => {
  const headers = {}
  if (roleId.value) {
    headers['X-Role-Id'] = roleId.value
  }
  return headers
}

const cargarUsuario = async () => {
  cargando.value = true
  error.value = ''

  try {
    const response = await fetch(`${apiBase}/admin/usuarios/${route.params.id}`, {
      headers: buildRoleHeaders()
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data?.message || 'No fue posible cargar el usuario')
    }

    usuario.value = data.usuario
    permisos.value = Array.isArray(data.permisos) ? data.permisos : []
    publicaciones.value = Array.isArray(data.publicaciones) ? data.publicaciones : []
    rolesDisponibles.value = Array.isArray(data.rolesDisponibles) ? data.rolesDisponibles : []
    resumenPublicaciones.value = data.resumenPublicaciones || resumenPublicaciones.value
    mensaje.value = 'Datos sincronizados con la base de datos.'
  } catch (err) {
    error.value = err.message || 'No se pudo cargar la información del usuario.'
  } finally {
    cargando.value = false
  }
}

const guardarCambios = async () => {
  if (!usuario.value) return

  guardando.value = true
  mensaje.value = ''
  error.value = ''
  const payload = {}

  if (puedeEditarDatos.value) {
    payload.nombre = usuario.value.nombre?.trim()
    payload.apellido = usuario.value.apellido?.trim()
    payload.email = usuario.value.email?.trim()
    payload.rol_id = usuario.value.rol_id ? Number(usuario.value.rol_id) : undefined
  }

  if (puedeGestionarEstado.value) {
    payload.estado_registro = usuario.value.estado_registro
  }

  if (!Object.keys(payload).length) {
    error.value = 'No tienes permisos para actualizar este usuario.'
    guardando.value = false
    return
  }

  try {
    const response = await fetch(`${apiBase}/admin/usuarios/${usuario.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...buildRoleHeaders() },
      body: JSON.stringify(payload)
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data?.message || 'No fue posible guardar los cambios')
    }

    usuario.value = data.usuario || usuario.value
    permisos.value = data.permisos ?? permisos.value
    mensaje.value = 'Cambios guardados correctamente.'
  } catch (err) {
    error.value = err.message || 'Error al guardar los cambios.'
  } finally {
    guardando.value = false
  }
}

const volverAlPanel = () => {
  router.push({ name: 'admin' })
}

onMounted(() => {
  cargarUsuario()
})
</script>

<template>
  <section class="admin admin--detalle">
    <!-- HERO -->
    <header class="admin__hero">
      <div class="hero__info">
        <p class="pill pill--success hero__pill">Detalle de usuario</p>
        <h1 class="hero__title">
          {{ nombreCompleto || 'Usuario sin nombre' }}
        </h1>
        <p class="muted hero__subtitle">
          Gestiona la información del usuario, su rol y el estado de sus publicaciones directamente desde la base de datos.
        </p>
      </div>
      <div class="hero__actions">
        <button class="btn btn--ghost hero__btn" type="button" @click="volverAlPanel">
          Volver al panel
        </button>
        <button class="btn btn--primary hero__btn" type="button" @click="cargarUsuario" :disabled="cargando">
          {{ cargando ? 'Actualizando...' : 'Refrescar datos' }}
        </button>
      </div>
    </header>

    <!-- MENSAJES -->
    <div v-if="error" class="alert alert--error">
      {{ error }}
    </div>
    <div v-if="mensaje" class="alert alert--info">
      {{ mensaje }}
    </div>

    <!-- PANEL PRINCIPAL -->
    <section class="card admin__panel" v-if="usuario">
      <header class="panel__header">
        <div>
          <h2 class="panel__title">Información del usuario</h2>
          <p class="muted panel__subtitle">
            Datos cargados desde MySQL. Puedes editar la información y guardar los cambios.
          </p>
          <p v-if="esAdmin && !esSuperAdmin" class="muted panel__subtitle">
            Como administrador solo puedes aprobar o rechazar cuentas; las ediciones quedan reservadas al super administrador.
          </p>
        </div>
        <span class="badge">ID {{ usuario.id }}</span>
      </header>

      <form class="form" @submit.prevent="guardarCambios">
        <div class="form__grid">
          <label class="field">
            <span>Nombre</span>
            <input v-model="usuario.nombre" type="text" placeholder="Nombre" :disabled="!puedeEditarDatos" />
          </label>

          <label class="field">
            <span>Apellido</span>
            <input v-model="usuario.apellido" type="text" placeholder="Apellido" :disabled="!puedeEditarDatos" />
          </label>

          <label class="field field--wide">
            <span>Correo</span>
            <input
              v-model="usuario.email"
              type="email"
              placeholder="Correo electrónico"
              :disabled="!puedeEditarDatos"
            />
          </label>

          <label class="field">
            <span>Rol</span>
            <select v-model="usuario.rol_id" :disabled="!puedeEditarDatos">
              <option value="">Selecciona un rol</option>
              <option v-for="rol in rolesDisponibles" :key="rol.id" :value="rol.id">
                {{ rol.nombre }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>Estado de registro</span>
            <select v-model="usuario.estado_registro" :disabled="!puedeGestionarEstado">
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </label>

          <label class="field">
            <span>Último inicio de sesión</span>
            <input :value="usuario.ultimo_login || 'Sin registros'" type="text" disabled />
          </label>
        </div>

        <div class="form__actions">
          <button class="btn btn--ghost" type="button" @click="cargarUsuario" :disabled="cargando">
            Descartar cambios
          </button>
          <button class="btn btn--primary" type="submit" :disabled="guardando || !puedeGestionarEstado">
            {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </section>

    <!-- PERMISOS + RESUMEN -->
    <section class="admin__grid" v-if="usuario">
      <!-- PERMISOS -->
      <article class="card">
        <header class="panel__header">
          <div>
            <h2 class="panel__title">Permisos asignados</h2>
            <p class="muted panel__subtitle">Basado en el rol actual del usuario.</p>
          </div>
        </header>

        <ul class="permissions">
          <li v-for="permiso in permisos" :key="permiso">
            {{ permiso }}
          </li>
          <li v-if="!permisos.length" class="muted permissions__empty">
            No se encontraron permisos asociados.
          </li>
        </ul>
      </article>

      <!-- RESUMEN PUBLICACIONES -->
      <article class="card">
        <header class="panel__header">
          <div>
            <h2 class="panel__title">Resumen de publicaciones</h2>
            <p class="muted panel__subtitle">Conteo por estado directamente desde la base de datos.</p>
          </div>
        </header>

        <div class="stats-grid">
          <div class="stat">
            <p class="stat__label">Total</p>
            <p class="stat__value">{{ resumenPublicaciones.total }}</p>
          </div>
          <div class="stat">
            <p class="stat__label">Publicadas</p>
            <p class="stat__value">{{ resumenPublicaciones.publicadas }}</p>
          </div>
          <div class="stat">
            <p class="stat__label">Pendientes</p>
            <p class="stat__value">{{ resumenPublicaciones.pendientes }}</p>
          </div>
          <div class="stat">
            <p class="stat__label">Rechazadas</p>
            <p class="stat__value">{{ resumenPublicaciones.rechazadas }}</p>
          </div>
        </div>
      </article>
    </section>

    <!-- LISTADO DE PUBLICACIONES -->
    <section class="card admin__panel" v-if="publicaciones.length">
      <header class="panel__header">
        <div>
          <h2 class="panel__title">Publicaciones del usuario</h2>
          <p class="muted panel__subtitle">
            Listado de publicaciones asociadas para gestión rápida.
          </p>
        </div>
      </header>

      <div class="list">
        <article
          v-for="publicacion in publicaciones"
          :key="publicacion.id"
          class="list__item"
        >
          <div class="list__info">
            <p class="list__title">
              {{ publicacion.titulo }}
            </p>
            <p class="muted list__date">
              {{ publicacion.fecha || 'Sin fecha' }}
            </p>
          </div>
          <div class="list__meta">
            <span
              class="pill"
              :class="{
                'pill--success': publicacion.estado_publicacion === 'publicada',
                'pill--warning': publicacion.estado_publicacion === 'pendiente_revision',
                'pill--error': publicacion.estado_publicacion === 'rechazada'
              }"
            >
              {{ publicacion.estado_publicacion }}
            </span>
            <RouterLink
              class="btn btn--ghost list__btn"
              :to="{ name: 'detalle-publicacion', params: { id: publicacion.id } }"
            >
              Ver publicación
            </RouterLink>
          </div>
        </article>
      </div>
    </section>

    <!-- EMPTY STATE -->
    <div v-else-if="usuario" class="empty-state">
      <h3>Sin publicaciones registradas</h3>
      <p class="muted">
        Este usuario aún no tiene publicaciones asociadas en el sistema.
      </p>
    </div>
  </section>
</template>

<style scoped>
/* CONTENEDOR PRINCIPAL */
.admin--detalle {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 0;
}

/* HERO */
.admin__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  background: radial-gradient(circle at top left, #f3f4ff 0, #f9fafb 40%, #ffffff 100%);
}

.hero__info {
  max-width: 640px;
}

.hero__pill {
  margin-bottom: 0.4rem;
}

.hero__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.hero__subtitle {
  max-width: 520px;
  font-size: 0.95rem;
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.hero__btn {
  min-width: 140px;
}

/* ALERTAS */
.alert {
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  border: 1px solid transparent;
}

.alert--error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.alert--info {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

/* PANEL GENERAL */
.admin__panel {
  padding: 1.25rem 1.5rem;
}

/* CARD BASE (respeta colores existentes) */
.card {
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.03);
}

/* ENCABEZADOS DE PANEL */
.panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.panel__title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
}

.panel__subtitle {
  font-size: 0.9rem;
}

.badge {
  align-self: flex-start;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 0.8rem;
  color: #4b5563;
}

/* FORMULARIO */
.form__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: #374151;
}

.field span {
  font-weight: 600;
}

.field--wide {
  grid-column: span 2;
}

.field input,
.field select {
  border-radius: 0.55rem;
  border: 1px solid #d1d5db;
  padding: 0.55rem 0.65rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  background: #ffffff;
}

.field input:focus,
.field select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.2);
  background: #f9fafb;
}

.field input[disabled] {
  background: #f3f4f6;
  color: #6b7280;
}

/* ACCIONES DEL FORMULARIO */
.form__actions {
  margin-top: 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* GRID SECUNDARIO: PERMISOS + RESUMEN */
.admin__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 1.25rem;
}

/* PERMISOS */
.permissions {
  list-style: none;
  margin: 0;
  padding: 0;
  color: #1f2937;
  font-size: 0.9rem;
}

.permissions li {
  padding: 0.4rem 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.permissions li + li {
  margin-top: 0.4rem;
}

.permissions li:hover {
  background: #eef2ff;
}

.permissions__empty {
  border: 1px dashed #e5e7eb;
  background: #f9fafb;
  text-align: center;
}

/* RESUMEN PUBLICACIONES */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.85rem;
}

.stat {
  padding: 0.75rem 0.9rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.stat__label {
  color: #6b7280;
  font-size: 0.8rem;
  margin-bottom: 0.15rem;
}

.stat__value {
  font-weight: 700;
  font-size: 1.15rem;
  color: #111827;
}

/* LISTA DE PUBLICACIONES */
.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.1s ease;
}

.list__item:hover {
  border-color: #c7d2fe;
  background: #eef2ff;
  transform: translateY(-1px);
}

.list__info {
  min-width: 0;
}

.list__title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.15rem;
}

.list__date {
  font-size: 0.82rem;
}

.list__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.list__btn {
  white-space: nowrap;
}

/* EMPTY STATE */
.empty-state {
  margin-top: 0.5rem;
  padding: 1.5rem 1.25rem;
  border-radius: 1rem;
  border: 1px dashed #e5e7eb;
  background: #f9fafb;
  text-align: center;
}

.empty-state h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .admin__hero {
    flex-direction: column;
    align-items: stretch;
  }

  .hero__actions {
    justify-content: flex-start;
  }

  .admin__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .field--wide {
    grid-column: span 1;
  }
}
</style>
