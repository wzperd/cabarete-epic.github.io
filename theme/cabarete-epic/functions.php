<?php
/**
 * Cabarete Épico: funciones del tema.
 *
 * @package cabarete-epic
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CAB_VERSION', '1.0.0' );
define(
	'CAB_FONTS_URL',
	'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter:wght@400;500;600&display=swap'
);

/**
 * Soporte del tema.
 */
function cab_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support(
		'html5',
		array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' )
	);
}
add_action( 'after_setup_theme', 'cab_setup' );

/**
 * Estilos y scripts. Bootstrap 5.3 va incluido en el tema, no se carga de ningún CDN.
 */
function cab_assets() {
	wp_enqueue_style( 'cab-fonts', CAB_FONTS_URL, array(), null );
	wp_enqueue_style( 'cab-bootstrap', get_theme_file_uri( 'assets/css/bootstrap.min.css' ), array(), '5.3.3' );
	wp_enqueue_style( 'cab-main', get_theme_file_uri( 'assets/css/main.css' ), array( 'cab-bootstrap' ), CAB_VERSION );

	wp_enqueue_script( 'cab-bootstrap', get_theme_file_uri( 'assets/js/bootstrap.bundle.min.js' ), array(), '5.3.3', true );
	wp_enqueue_script( 'cab-main', get_theme_file_uri( 'assets/js/main.js' ), array( 'cab-bootstrap' ), CAB_VERSION, true );
}
add_action( 'wp_enqueue_scripts', 'cab_assets' );

/**
 * URL de una imagen del tema. La portada y la banda aérea se pueden cambiar en
 * Apariencia > Personalizar > Imágenes de Cabarete.
 *
 * @param string $name Nombre del archivo sin extensión (hero, aerial, sky, palms...).
 * @return string URL de la imagen.
 */
function cab_img( $name ) {
	$overridable = array(
		'hero'   => 'cab_img_hero',
		'aerial' => 'cab_img_aerial',
	);
	if ( isset( $overridable[ $name ] ) ) {
		$custom = get_theme_mod( $overridable[ $name ], '' );
		if ( ! empty( $custom ) ) {
			return $custom;
		}
	}
	return get_theme_file_uri( 'assets/img/' . $name . '.jpg' );
}

/**
 * Opciones del Personalizador.
 *
 * @param WP_Customize_Manager $wp_customize Gestor del personalizador.
 */
function cab_customize( $wp_customize ) {
	$wp_customize->add_section(
		'cab_images',
		array(
			'title'    => 'Imágenes de Cabarete',
			'priority' => 30,
		)
	);

	$wp_customize->add_setting( 'cab_img_hero', array( 'default' => '', 'sanitize_callback' => 'esc_url_raw' ) );
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'cab_img_hero',
			array(
				'label'       => 'Foto de la portada',
				'description' => 'Mejor si mide al menos 2000 px de ancho.',
				'section'     => 'cab_images',
			)
		)
	);

	$wp_customize->add_setting( 'cab_img_aerial', array( 'default' => '', 'sanitize_callback' => 'esc_url_raw' ) );
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'cab_img_aerial',
			array(
				'label'   => 'Foto de la banda aérea',
				'section' => 'cab_images',
			)
		)
	);

	$wp_customize->add_section(
		'cab_contact',
		array(
			'title'    => 'Formulario de contacto',
			'priority' => 31,
		)
	);
	$wp_customize->add_setting(
		'cab_contact_email',
		array(
			'default'           => '',
			'sanitize_callback' => 'sanitize_email',
		)
	);
	$wp_customize->add_control(
		'cab_contact_email',
		array(
			'label'       => 'Correo que recibe los mensajes',
			'description' => 'Si lo dejas vacío, se usa el correo del administrador del sitio.',
			'section'     => 'cab_contact',
			'type'        => 'email',
		)
	);
}
add_action( 'customize_register', 'cab_customize' );

/**
 * Aviso del formulario de contacto (después de enviar).
 *
 * @return string HTML del aviso, o cadena vacía.
 */
function cab_form_notice() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$state = isset( $_GET['cab'] ) ? sanitize_key( wp_unslash( $_GET['cab'] ) ) : '';
	if ( 'ok' === $state ) {
		return '<div class="cab-alert ok" role="status">Gracias. Recibimos tu mensaje y te responderemos pronto.</div>';
	}
	if ( 'error' === $state ) {
		return '<div class="cab-alert err" role="alert">No pudimos enviar el mensaje. Revisa los campos e inténtalo otra vez.</div>';
	}
	return '';
}

/**
 * Procesa el formulario de contacto y lo envía por correo.
 */
function cab_handle_contact() {
	$back = wp_get_referer();
	$back = $back ? remove_query_arg( 'cab', $back ) : home_url( '/' );
	$back = strtok( $back, '#' );

	$nonce = isset( $_POST['cab_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['cab_nonce'] ) ) : '';
	if ( ! wp_verify_nonce( $nonce, 'cab_contact' ) ) {
		wp_safe_redirect( add_query_arg( 'cab', 'error', $back ) . '#contacto' );
		exit;
	}

	// Campo trampa para robots: si viene lleno, se ignora sin avisar.
	if ( ! empty( $_POST['cab_web'] ) ) {
		wp_safe_redirect( add_query_arg( 'cab', 'ok', $back ) . '#contacto' );
		exit;
	}

	$nombre  = isset( $_POST['nombre'] ) ? sanitize_text_field( wp_unslash( $_POST['nombre'] ) ) : '';
	$email   = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$interes = isset( $_POST['interes'] ) ? sanitize_text_field( wp_unslash( $_POST['interes'] ) ) : '';
	$mensaje = isset( $_POST['mensaje'] ) ? sanitize_textarea_field( wp_unslash( $_POST['mensaje'] ) ) : '';

	if ( '' === $nombre || ! is_email( $email ) || '' === $mensaje ) {
		wp_safe_redirect( add_query_arg( 'cab', 'error', $back ) . '#contacto' );
		exit;
	}

	$to = get_theme_mod( 'cab_contact_email', '' );
	if ( ! is_email( $to ) ) {
		$to = get_option( 'admin_email' );
	}

	$subject = sprintf( '[%s] Mensaje de %s', wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ), $nombre );
	$body    = "Nombre: {$nombre}\nCorreo: {$email}\nInterés: {$interes}\n\n{$mensaje}\n";
	$headers = array( 'Reply-To: ' . $nombre . ' <' . $email . '>' );

	$sent = wp_mail( $to, $subject, $body, $headers );

	wp_safe_redirect( add_query_arg( 'cab', $sent ? 'ok' : 'error', $back ) . '#contacto' );
	exit;
}
add_action( 'admin_post_nopriv_cab_contact', 'cab_handle_contact' );
add_action( 'admin_post_cab_contact', 'cab_handle_contact' );
