import { combineRgb } from '@companion-module/base'

export function updatePresets() {
	let presets = {}

	presets['VolumeKnob'] = {
		type: 'button',
		category: 'Volume',
		name: 'Volume Knob',
		options: {
			rotaryActions: true,
		},
		style: {
			text: 'Volume',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				rotate_left: [
					{
						actionId: 'dec_volume',
						options: {
							step_down: 4,
						},
					},
				],
				rotate_right: [
					{
						actionId: 'inc_volume',
						options: {
							step_up: 4,
						},
					},
				],
			},
		],
		feedbacks: [],
	}

	this.setPresetDefinitions(presets)
}
