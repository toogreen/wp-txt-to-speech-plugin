(function () {
	'use strict';

	var strings = window.wpttsPlayerL10n || {};

	if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
		document.querySelectorAll('.wptts-player').forEach(function (player) {
			var status = player.querySelector('.wptts-player__status');
			status.textContent = strings.unsupported || 'Text-to-speech is not supported by this browser.';
			player.querySelectorAll('button, select').forEach(function (control) {
				control.disabled = true;
			});
		});
		return;
	}

	var synthesis = window.speechSynthesis;

	function setupPlayer(player) {
		var text = player.getAttribute('data-text');
		var playButton = player.querySelector('.wptts-button--play');
		var pauseButton = player.querySelector('.wptts-button--pause');
		var stopButton = player.querySelector('.wptts-button--stop');
		var voiceSelect = player.querySelector('.wptts-voice');
		var rateSelect = player.querySelector('.wptts-rate');
		var status = player.querySelector('.wptts-player__status');
		var utterance = null;

		function setPlaying(isPlaying) {
			playButton.disabled = isPlaying;
			pauseButton.disabled = !isPlaying;
			stopButton.disabled = !isPlaying;
		}

		function populateVoices() {
			var selectedVoice = voiceSelect.value;
			var voices = synthesis.getVoices();

			voiceSelect.textContent = '';
			var defaultOption = document.createElement('option');
			defaultOption.value = '';
			defaultOption.textContent = strings.defaultVoice || 'Default voice';
			voiceSelect.appendChild(defaultOption);

			voices.forEach(function (voice, index) {
				var option = document.createElement('option');
				option.value = String(index);
				option.textContent = voice.name + ' (' + voice.lang + ')' + (voice.default ? ' — ' + (strings.defaultVoiceSuffix || 'Default') : '');
				voiceSelect.appendChild(option);
			});

			if (selectedVoice && Number(selectedVoice) < voices.length) {
				voiceSelect.value = selectedVoice;
			}
		}

		playButton.addEventListener('click', function () {
			if (!text) {
				status.textContent = strings.noText || 'There is no text available to read.';
				return;
			}

			synthesis.cancel();
			utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = Number(rateSelect.value) || 1;

			var voices = synthesis.getVoices();
			if (voiceSelect.value && voices[Number(voiceSelect.value)]) {
				utterance.voice = voices[Number(voiceSelect.value)];
			}

			utterance.onstart = function () {
				setPlaying(true);
				status.textContent = strings.reading || 'Reading post.';
			};
			utterance.onend = function () {
				setPlaying(false);
				status.textContent = strings.finished || 'Finished reading.';
			};
			utterance.onerror = function (event) {
				setPlaying(false);
				status.textContent = event.error === 'canceled' ? '' : (strings.failed || 'Speech playback could not be completed.');
			};

			status.textContent = strings.starting || 'Starting speech.';
			synthesis.speak(utterance);
		});

		pauseButton.addEventListener('click', function () {
			if (synthesis.paused) {
				synthesis.resume();
				pauseButton.textContent = strings.pause || 'Pause';
				status.textContent = strings.reading || 'Reading post.';
			} else if (synthesis.speaking) {
				synthesis.pause();
				pauseButton.textContent = strings.resume || 'Resume';
				status.textContent = strings.paused || 'Speech paused.';
			}
		});

		stopButton.addEventListener('click', function () {
			synthesis.cancel();
			utterance = null;
			setPlaying(false);
			status.textContent = strings.stopped || 'Speech stopped.';
			pauseButton.textContent = strings.pause || 'Pause';
		});

		synthesis.addEventListener('voiceschanged', populateVoices);
		populateVoices();
	}

	document.querySelectorAll('.wptts-player').forEach(setupPlayer);
})();
