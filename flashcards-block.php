<?php
/**
 * Plugin Name: Flashcards Block
 * Description: Notebook-style flashcards with CSV import.
 * Author: Tino / SetupMyHotel
 * Version: 1.0.0
 */

defined( 'ABSPATH' ) || exit;

function smh_flashcards_block_register() {

    // Editor script (block UI + CSV import)
    wp_register_script(
        'smh-flashcards-editor',
        plugins_url( 'editor.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n' ),
        filemtime( __DIR__ . '/editor.js' )
    );

    // Front + editor styles
    wp_register_style(
        'smh-flashcards-style',
        plugins_url( 'style.css', __FILE__ ),
        array(),
        filemtime( __DIR__ . '/style.css' )
    );

    // Front-end behaviour (flip, next, fullscreen)
    wp_register_script(
        'smh-flashcards-view',
        plugins_url( 'view.js', __FILE__ ),
        array(),
        filemtime( __DIR__ . '/view.js' ),
        true
    );

    register_block_type(
        __DIR__,
        array(
            'editor_script' => 'smh-flashcards-editor',
            'style'         => 'smh-flashcards-style',
            'view_script'   => 'smh-flashcards-view',
        )
    );
}
add_action( 'init', 'smh_flashcards_block_register' );