export function updateActions() {
	let actions = {}

	actions['mix_selection'] = {
		name: 'Mix Selection',
		options: [
			{
				type: 'dropdown',
				label: 'Channel',
				id: 'mix_selection',
				default: '01',
				choices: this.channels,
			},
		],
		callback: ({ options }) => {
			this.log('debug', 'mix select: ' + options.mix_selection)
			var cmd = '05' + options.mix_selection + '0000'
			this.sendMessage(cmd, '03')
		},
	}

	actions['mix_enable'] = {
		name: 'Mix Enable',
		options: [
			{
				type: 'dropdown',
				label: 'Channel',
				id: 'mix_enable',
				default: '01',
				choices: this.channels,
			},
			{
				type: 'dropdown',
				label: 'Mode',
				id: 'mix_enable_mode',
				default: '01',
				choices: [
					{ id: '01', label: 'Enable' },
					{ id: '00', label: 'Disable' },
				],
			},
		],
		callback: ({ options }) => {
			this.log('debug', 'mix enable: ' + options.mix_enable + ':' + options.mix_enable_mode)
			var cmd = '06' + options.mix_enable + options.mix_enable_mode + '00'
			this.sendMessage(cmd, '03')
		},
	}

	actions['set_volume'] = {
		name: 'Set Volume',
		options: [
			{
				type: 'number',
				label: 'Volume',
				id: 'volume',
				min: 0,
				max: 127,
				default: 50,
			},
		],
		callback: ({ options }) => {
			this.volume = options.volume
			this.log('debug', 'vol: ' + this.volume)
			var cmd = '0E' + this.volume.toString(16).padStart(2, '0') + '0000'
			this.sendMessage(cmd, '03')
		},
	}

	actions['set_mute'] = {
		name: 'Mute',
		options: [
		],
		callback: ({ options }) => {
			if (this.volume != 0) {
				// avoids losing the previous value if mute pressed more than once
				this.unMute = this.volume
			}
			this.volume = 0
			this.log('debug', 'mute: ' + this.volume)
			var cmd = '0E' + this.volume.toString(16).padStart(2, '0') + '0000'
			this.sendMessage(cmd, '03')
		},
	}

	actions['unset_mute'] = {
		name: 'Unmute',
		options: [
		],
		callback: ({ options }) => {
			this.volume = this.unMute
			this.log('debug', 'unmute: ' + this.volume)
			var cmd = '0E' + this.volume.toString(16).padStart(2, '0') + '0000'
			this.sendMessage(cmd, '03')
		},
	}

	actions['inc_volume'] = {
		name: 'Volume Up',
		options: [
			{
				type: 'number',
				label: 'Step Size',
				id: 'step_up',
				min: 1,
				max: 24,
				default: 4,
			},
		],
		callback: ({ options }) => {
			if ((this.volume + options.step_up) > 127) {
				this.volume = 127
			} else {
				this.volume = this.volume + options.step_up
			}
				this.log('debug', 'vol: ' + this.volume)
				var cmd = '0E' + this.volume.toString(16).padStart(2, '0') + '0000'
				this.sendMessage(cmd, '03')
		},
	}

	actions['dec_volume'] = {
		name: 'Volume Down',
		options: [
			{
				type: 'number',
				label: 'Step Size',
				id: 'step_down',
				min: 1,
				max: 24,
				default: 4,
			},
		],
		callback: ({ options }) => {
			if ((this.volume - options.step_down) < 0) {
				this.volume = 0
			} else {
				this.volume = this.volume - options.step_down
			}
				this.log('debug', 'vol: ' + this.volume)
				var cmd = '0E' + this.volume.toString(16).padStart(2, '0') + '0000'
				this.sendMessage(cmd, '03')
		},
	}

	actions['get_info'] = {
		name: 'Get Info',
		options: [
		],
		callback: ({ options }) => {
			// get info has no command data
			this.sendMessage(null, '05')
			// temp for testing!
			// this.processDeviceData(null)
			// remove line above!
		},
	}

	this.setActionDefinitions(actions)
}
