<?php
/**
 * Plantilla de respaldo (blog, páginas, entradas). La portada usa front-page.php.
 *
 * @package cabarete-epic
 */

get_header();
?>
<main id="top" class="cab-page">
	<div class="container">
		<?php if ( have_posts() ) : ?>
			<?php
			while ( have_posts() ) :
				the_post();
				?>
				<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
					<h1 class="entry-title">
						<?php if ( is_singular() ) : ?>
							<?php the_title(); ?>
						<?php else : ?>
							<a href="<?php the_permalink(); ?>" style="color:inherit;text-decoration:none"><?php the_title(); ?></a>
						<?php endif; ?>
					</h1>
					<div class="entry-content">
						<?php is_singular() ? the_content() : the_excerpt(); ?>
					</div>
				</article>
			<?php endwhile; ?>
			<?php the_posts_pagination(); ?>
		<?php else : ?>
			<h1 class="entry-title">No encontramos nada</h1>
			<div class="entry-content"><p>Prueba con otra búsqueda o vuelve al <a href="<?php echo esc_url( home_url( '/' ) ); ?>">inicio</a>.</p></div>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
