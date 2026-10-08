=== WP Text to Speech ===
Contributors: wptxttospeech
Tags: text to speech, accessibility, audio, speech
Requires at least: 5.8
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Adds a player to individual blog posts so visitors can listen to the post content using speech voices available in their browser or device.

== Description ==

The player is appended to each single blog post and provides play, pause/resume, stop, voice, speech speed, and interface language controls. The interface is in French by default; visitors can switch it to English, and the choice is saved in their browser. Canadian French is the default speech language and the preferred voice when the visitor's browser provides one. Speech is generated in the visitor's browser using the Web Speech API; no audio files or external speech services are required.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`.
2. Activate **WP Text to Speech** from the WordPress Plugins screen.
3. Visit an individual blog post to use the player.

== Notes ==

Available voices depend on the visitor's browser and operating system. Browsers that do not support the Web Speech API will show an unsupported message and disable the player controls.
