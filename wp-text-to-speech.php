<?php
/**
 * Plugin Name: WP Text to Speech
 * Description: Adds a browser-powered text-to-speech player to individual blog posts.
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: WP Text to Speech
 * Text Domain: wp-text-to-speech
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue the player assets on individual blog posts.
 */
function wptts_enqueue_player_assets() {
	if ( ! is_singular( 'post' ) ) {
		return;
	}

	$plugin_url  = plugin_dir_url( __FILE__ );
	$plugin_path = plugin_dir_path( __FILE__ );
	$css_path    = $plugin_path . 'assets/css/player.css';
	$js_path     = $plugin_path . 'assets/js/player.js';

	wp_enqueue_style(
		'wptts-player',
		$plugin_url . 'assets/css/player.css',
		array(),
		file_exists( $css_path ) ? (string) filemtime( $css_path ) : '1.0.0'
	);

	wp_enqueue_script(
		'wptts-player',
		$plugin_url . 'assets/js/player.js',
		array(),
		file_exists( $js_path ) ? (string) filemtime( $js_path ) : '1.0.0',
		true
	);

	wp_localize_script(
		'wptts-player',
		'wpttsPlayerL10n',
		array(
			'languagePreference' => 'wptts-language',
			'voicePreference'    => 'wptts-voice',
		)
	);
}
add_action( 'wp_enqueue_scripts', 'wptts_enqueue_player_assets' );

/**
 * Append a speech player to the post content.
 *
 * @param string $content Post content after WordPress content filters.
 * @return string
 */
function wptts_add_player_to_post_content( $content ) {
	if ( is_admin() || is_feed() || ! is_singular( 'post' ) || ! in_the_loop() || ! is_main_query() ) {
		return $content;
	}

	$text = html_entity_decode(
		wp_strip_all_tags( $content, true ),
		ENT_QUOTES | ENT_HTML5,
		get_bloginfo( 'charset' ) ? get_bloginfo( 'charset' ) : 'UTF-8'
	);
	$text = trim( preg_replace( '/\s+/u', ' ', $text ) );

	if ( '' === $text ) {
		return $content;
	}

	$player  = '<section class="wptts-player" lang="fr-CA" aria-label="Écouter cet article" data-text="' . esc_attr( $text ) . '">';
	$player .= '<div class="wptts-player__heading">Écouter cet article</div>';
	$player .= '<div class="wptts-player__controls">';
	$player .= '<button class="wptts-button wptts-button--play" type="button">Lire</button>';
	$player .= '<button class="wptts-button wptts-button--pause" type="button" disabled>Pause</button>';
	$player .= '<button class="wptts-button wptts-button--stop" type="button" disabled>Arrêter</button>';
	$player .= '<label class="wptts-setting"><span class="wptts-voice-label">Voix</span><select class="wptts-voice" aria-label="Voix de lecture"><option value="">Français canadien (par défaut)</option></select></label>';
	$player .= '<label class="wptts-setting"><span class="wptts-rate-label">Vitesse</span><select class="wptts-rate" aria-label="Vitesse de lecture">';
	$player .= '<option value="0.75">Lente</option><option value="1" selected>Normale</option><option value="1.25">Rapide</option>';
	$player .= '</select></label>';
	$player .= '<label class="wptts-setting"><span class="wptts-language-label">Langue</span><select class="wptts-language" aria-label="Langue de l’interface"><option value="fr">Français</option><option value="en">English</option></select></label>';
	$player .= '</div><p class="wptts-player__status" aria-live="polite"></p></section>';

	return $content . $player;
}
add_filter( 'the_content', 'wptts_add_player_to_post_content', 20 );
