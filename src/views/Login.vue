<template>
  <section class="auth">
    <div class="auth__panel card">
      <header class="auth__header">
        <h1 class="auth__title">Bienvenido</h1>
        <p class="auth__subtitle">
          Gestiona tus productos, publica nuevas ofertas y mantente conectado con la comunidad de AgroGestor.
        </p>
      </header>

      <form class="auth__form">
        <div class="input-field">
          <label for="login-email">Correo electrónico</label>
          <input
            id="login-email"
            type="email"
            placeholder="nombre@correo.cl"
            autocomplete="email"
          />
        </div>

        <div class="input-field">
          <label for="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            placeholder="Ingresa tu contraseña"
            autocomplete="current-password"
          />
        </div>

        <button class="btn btn--primary" type="button">
          Iniciar sesión
        </button>
      </form>

      <p class="auth__meta">
        ¿Aún no tienes cuenta?
        <span class="link-like">Solicita tu registro</span>
      </p>

    </div>

    <aside class="auth__aside">
      <h2>Productividad rural sin complicaciones</h2>
      <p>
        AgroGestor centraliza tus publicaciones, solicitudes y contactos comerciales. Inicia sesión para acceder a herramientas
        diseñadas para productores y feriantes de Chillán.
      </p>
    </aside>
  </section>
</template>

<style src="./Login.css" scoped></style>
