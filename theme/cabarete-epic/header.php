<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#03121A">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div class="cab-app" data-bs-theme="dark">
<div class="cab-progress" aria-hidden="true"></div>
<div class="cab-fly" aria-hidden="true">
  <svg viewBox="-40 -48 80 160">
    <path d="M0 -44 L34 0 L0 44 L-34 0 Z" fill="#FF5A3C"/>
    <path d="M0 -44 L0 44 M-34 0 L34 0" stroke="#03121A" stroke-width="2" fill="none" opacity=".5"/>
    <path d="M0 44 q-12 14 0 28 t0 28" stroke="#FFB627" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>
</div>

<nav class="navbar navbar-expand-lg fixed-top cab-nav" aria-label="Principal">
  <div class="container">
    <a class="cab-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>#inicio">Cabar<b>ete</b></a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#cabMenu" aria-controls="cabMenu" aria-expanded="false" aria-label="Abrir menú">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="cabMenu">
      <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1" id="cabNav">
        <li class="nav-item"><a class="nav-link" href="<?php echo esc_url( home_url( '/' ) ); ?>#experiencias">Experiencias</a></li>
        <li class="nav-item"><a class="nav-link" href="<?php echo esc_url( home_url( '/' ) ); ?>#playas">Playas</a></li>
        <li class="nav-item"><a class="nav-link" href="<?php echo esc_url( home_url( '/' ) ); ?>#dia">Un día</a></li>
        <li class="nav-item"><a class="nav-link" href="<?php echo esc_url( home_url( '/' ) ); ?>#cuando">Cuándo ir</a></li>
        <li class="nav-item"><a class="nav-link" href="<?php echo esc_url( home_url( '/' ) ); ?>#dormir">Dónde dormir</a></li>
        <li class="nav-item"><a class="nav-link" href="<?php echo esc_url( home_url( '/' ) ); ?>#llegar">Cómo llegar</a></li>
        <li class="nav-item ms-lg-2 mt-2 mt-lg-0"><a class="btn-cab" style="padding:.6rem 1.2rem;font-size:.9rem" href="<?php echo esc_url( home_url( '/' ) ); ?>#planifica">Planifica tu viaje</a></li>
      </ul>
    </div>
  </div>
</nav>
