(function () {
	'use strict';

	var strings = {
		fr: {
			lang: 'fr-CA',
			listen: 'Écouter cet article',
			play: 'Lire',
			pause: 'Pause',
			resume: 'Reprendre',
			stop: 'Arrêter',
			voice: 'Voix',
			voiceLabel: 'Voix de lecture',
			defaultVoice: 'Français canadien (par défaut)',
			defaultVoiceSuffix: 'Par défaut',
			speed: 'Vitesse',
			speedLabel: 'Vitesse de lecture',
			slow: 'Lente',
			normal: 'Normale',
			fast: 'Rapide',
			language: 'Langue',
			languageLabel: 'Langue de l’interface',
			unsupported: 'La synthèse vocale n’est pas prise en charge par ce navigateur.',
			noText: 'Aucun texte n’est disponible pour la lecture.',
			reading: 'Lecture de l’article.',
			starting: 'Démarrage de la lecture.',
			paused: 'Lecture en pause.',
			stopped: 'Lecture arrêtée.',
			finished: 'Lecture terminée.',
			failed: 'La lecture vocale n’a pas pu être effectuée.'
		},
		en: {
			lang: 'en',
			listen: 'Listen to this post',
			play: 'Play',
			pause: 'Pause',
			resume: 'Resume',
			stop: 'Stop',
			voice: 'Voice',
			voiceLabel: 'Speech voice',
			defaultVoice: 'U.S. English (default)',
			defaultVoiceSuffix: 'Default',
			speed: 'Speed',
			speedLabel: 'Speech speed',
			slow: 'Slow',
			normal: 'Normal',
			fast: 'Fast',
			language: 'Language',
			languageLabel: 'Interface language',
			unsupported: 'Text-to-speech is not supported by this browser.',
			noText: 'There is no text available to read.',
			reading: 'Reading post.',
			starting: 'Starting speech.',
			paused: 'Speech paused.',
			stopped: 'Speech stopped.',
			finished: 'Finished reading.',
			failed: 'Speech playback could not be completed.'
		}
	};
	var l10n = window.wpttsPlayerL10n || {};
	var languageKey = l10n.languagePreference || 'wptts-language';
	var voiceKey = l10n.voicePreference || 'wptts-voice';

	function getPreference(key) {
		try {
			return window.localStorage.getItem(key);
		} catch (error) {
			console.warn('WP Text to Speech could not read a saved preference.', error);
			return null;
		}
	}

	function setPreference(key, value) {
		try {
			window.localStorage.setItem(key, value);
		} catch (error) {
			console.warn('WP Text to Speech could not save a preference.', error);
		}
	}

	var savedLanguage = getPreference(languageKey);
	var currentLanguage = savedLanguage === 'en' ? 'en' : 'fr';
	var synthesis = window.speechSynthesis;
	var speechSupported = Boolean(synthesis && 'SpeechSynthesisUtterance' in window);
	var savedVoiceURI = getPreference(voiceKey);
	var voicePreferenceSet = Boolean(savedVoiceURI);
	var selectedVoiceURI = savedVoiceURI || '';

	function applyLanguage(player) {
		var language = strings[currentLanguage];
		var pauseButton = player.querySelector('.wptts-button--pause');
		var isPaused = speechSupported && synthesis.paused;

		player.setAttribute('lang', language.lang);
		player.setAttribute('aria-label', language.listen);
		player.querySelector('.wptts-player__heading').textContent = language.listen;
		player.querySelector('.wptts-button--play').textContent = language.play;
		pauseButton.textContent = isPaused ? language.resume : language.pause;
		player.querySelector('.wptts-button--stop').textContent = language.stop;
		player.querySelector('.wptts-voice-label').textContent = language.voice;
		player.querySelector('.wptts-voice').setAttribute('aria-label', language.voiceLabel);
		player.querySelector('.wptts-rate-label').textContent = language.speed;
		player.querySelector('.wptts-rate').setAttribute('aria-label', language.speedLabel);
		player.querySelector('.wptts-language-label').textContent = language.language;
		player.querySelector('.wptts-language').setAttribute('aria-label', language.languageLabel);

		var rateOptions = player.querySelector('.wptts-rate').options;
		rateOptions[0].textContent = language.slow;
		rateOptions[1].textContent = language.normal;
		rateOptions[2].textContent = language.fast;

		var voiceSelect = player.querySelector('.wptts-voice');
		if (voiceSelect.options.length) {
			voiceSelect.options[0].textContent = language.defaultVoice;
			for (var i = 1; i < voiceSelect.options.length; i += 1) {
				var voice = synthesis.getVoices()[Number(voiceSelect.options[i].value)];
				if (voice) {
					voiceSelect.options[i].textContent = voice.name + ' (' + voice.lang + ')' +
						(voice.default ? ' — ' + language.defaultVoiceSuffix : '');
				}
			}
		}

		var statusKey = player.getAttribute('data-status-key');
		if (statusKey) {
			player.querySelector('.wptts-player__status').textContent = language[statusKey] || '';
		}
		player.querySelector('.wptts-language').value = currentLanguage;
	}

	function updateAllLanguages() {
		document.querySelectorAll('.wptts-player').forEach(applyLanguage);
	}

	function setupPlayer(player) {
		var text = player.getAttribute('data-text');
		var playButton = player.querySelector('.wptts-button--play');
		var pauseButton = player.querySelector('.wptts-button--pause');
		var stopButton = player.querySelector('.wptts-button--stop');
		var voiceSelect = player.querySelector('.wptts-voice');
		var languageSelect = player.querySelector('.wptts-language');

		function setStatus(key) {
			player.setAttribute('data-status-key', key || '');
			player.querySelector('.wptts-player__status').textContent = key ? strings[currentLanguage][key] : '';
		}

		function setPlaying(isPlaying) {
			playButton.disabled = isPlaying || !speechSupported;
			pauseButton.disabled = !isPlaying || !speechSupported;
			stopButton.disabled = !isPlaying || !speechSupported;
		}

		function populateVoices() {
			if (!speechSupported) {
				return;
			}

			var voices = synthesis.getVoices();
			if (!voices.length) {
				return;
			}

			var preferredVoiceIndex = -1;
			var selectedVoiceIndex = -1;
			var preferredLocale = currentLanguage === 'en' ? 'en-us' : 'fr-ca';
			voices.forEach(function (voice, index) {
				var locale = voice.lang.toLowerCase().replace(/_/g, '-');
				if (locale === preferredLocale && preferredVoiceIndex === -1) {
					preferredVoiceIndex = index;
				}
				if (selectedVoiceURI && voice.voiceURI === selectedVoiceURI) {
					selectedVoiceIndex = index;
				}
			});

			if (!voicePreferenceSet) {
				selectedVoiceIndex = preferredVoiceIndex;
			} else if (selectedVoiceIndex === -1) {
				voicePreferenceSet = false;
				selectedVoiceURI = '';
				setPreference(voiceKey, '');
				selectedVoiceIndex = preferredVoiceIndex;
			}

			voiceSelect.textContent = '';
			var language = strings[currentLanguage];
			var defaultOption = document.createElement('option');
			defaultOption.value = '';
			defaultOption.textContent = language.defaultVoice;
			voiceSelect.appendChild(defaultOption);

			voices.forEach(function (voice, index) {
				var option = document.createElement('option');
				option.value = String(index);
				option.textContent = voice.name + ' (' + voice.lang + ')' +
					(voice.default ? ' — ' + language.defaultVoiceSuffix : '');
				voiceSelect.appendChild(option);
			});

			if (selectedVoiceIndex !== -1) {
				voiceSelect.value = String(selectedVoiceIndex);
			}
		}

		languageSelect.value = currentLanguage;
		languageSelect.addEventListener('change', function () {
			currentLanguage = languageSelect.value === 'en' ? 'en' : 'fr';
			setPreference(languageKey, currentLanguage);
			voicePreferenceSet = false;
			selectedVoiceURI = '';
			setPreference(voiceKey, '');
			populateVoices();
			updateAllLanguages();
		});

		voiceSelect.addEventListener('change', function () {
			var voices = speechSupported ? synthesis.getVoices() : [];
			var voice = voiceSelect.value ? voices[Number(voiceSelect.value)] : null;
			voicePreferenceSet = Boolean(voice);
			selectedVoiceURI = voice ? voice.voiceURI : '';
			setPreference(voiceKey, selectedVoiceURI);
		});

		if (!speechSupported) {
			player.querySelectorAll('button, .wptts-voice, .wptts-rate').forEach(function (control) {
				control.disabled = true;
			});
			setStatus('unsupported');
			applyLanguage(player);
			return;
		}

		playButton.addEventListener('click', function () {
			if (!text) {
				setStatus('noText');
				return;
			}

			synthesis.cancel();
			var utterance = new SpeechSynthesisUtterance(text);
			var voices = synthesis.getVoices();
			var selectedVoice = voiceSelect.value ? voices[Number(voiceSelect.value)] : null;
			utterance.lang = selectedVoice ? selectedVoice.lang : (currentLanguage === 'en' ? 'en-US' : 'fr-CA');
			utterance.rate = Number(player.querySelector('.wptts-rate').value) || 1;
			if (selectedVoice) {
				utterance.voice = selectedVoice;
			}

			utterance.onstart = function () {
				setPlaying(true);
				setStatus('reading');
			};
			utterance.onend = function () {
				setPlaying(false);
				setStatus('finished');
			};
			utterance.onerror = function (event) {
				setPlaying(false);
				setStatus(event.error === 'canceled' ? '' : 'failed');
			};

			setStatus('starting');
			synthesis.speak(utterance);
		});

		pauseButton.addEventListener('click', function () {
			if (synthesis.paused) {
				synthesis.resume();
				setStatus('reading');
			} else if (synthesis.speaking) {
				synthesis.pause();
				setStatus('paused');
			}
			applyLanguage(player);
		});

		stopButton.addEventListener('click', function () {
			synthesis.cancel();
			setPlaying(false);
			setStatus('stopped');
			applyLanguage(player);
		});

		synthesis.addEventListener('voiceschanged', populateVoices);
		populateVoices();
		applyLanguage(player);
	}

	document.querySelectorAll('.wptts-player').forEach(setupPlayer);
})();
