import { combineRgb } from '@companion-module/base'
import { graphics } from 'companion-module-utils'

export function updateFeedbacks() {
	const channelLvls = [
		{ id: '01', label: 'Channel 1' },
		{ id: '02', label: 'Channel 2' },
		{ id: '03', label: 'Channel 3' },
		{ id: '04', label: 'Channel 4' },
		{ id: '05', label: 'Channels 1-2' },
		{ id: '06', label: 'Channels 3-4' },
		{ id: '07', label: 'Channels 1-4' },
		{ id: '08', label: 'Output' },
	]
	const feedbacks = {}
	feedbacks['Meter'] = {
		type: 'advanced',
		name: 'VUMeter',
		description: 'Show a Bargraph VU Meter on the button',
		options: [
			{
				type: 'dropdown',
				label: 'Position',
				id: 'position',
				default: 'right',
				choices: [
					{ id: 'left', label: 'Left' },
					{ id: 'right', label: 'Right' },
					{ id: 'top', label: 'Top' },
					{ id: 'bottom', label: 'Bottom' },
				],
			},
			{
				type: 'number',
				label: 'Padding',
				id: 'padding',
				tooltip: 'Distance from edge of button',
				min: 0,
				max: 72,
				default: 1,
				required: true,
			},
			{
				type: 'dropdown',
				label: 'Channel',
				id: 'meterVal1',
				default: channelLvls[0].id,
				choices: channelLvls,
				allowCustom: true,
			},
		],
		callback: async (feedback, context) => {
			const position = feedback.options.position
			const padding = feedback.options.padding
			let ofsX1 = 0
			let ofsX2 = 0
			let ofsY1 = 0
			let ofsY2 = 0
			let bWidth = 0
			let bLength = 0
			const bVal = (mtrVal) => {
				switch (true) {
					case mtrVal <= -30:
						return mtrVal + 62
					case mtrVal <= -18:
						return (mtrVal + 30) * 2 + 25
					case mtrVal <= 0:
						return (mtrVal + 18) * 2.5 + 54
					default:
						return 100 // mtrVal > 0
				}
			}
			switch (position) {
				case 'left':
					ofsX1 = padding
					ofsY1 = 5
					bWidth = 6
					bLength = feedback.image.height - ofsY1 * 2
					ofsX2 = ofsX1 + bWidth + 1
					ofsY2 = ofsY1
					break
				case 'right':
					ofsY1 = 5
					bWidth = 6
					bLength = feedback.image.height - ofsY1 * 2
					ofsX2 = feedback.image.width - bWidth - padding
					ofsX1 = ofsX2
					ofsY2 = ofsY1
					break
				case 'top':
					ofsX1 = 5
					ofsY1 = padding
					bWidth = feedback.options.meterVal2 ? 3 : 7
					bLength = feedback.image.width - ofsX1 * 2
					ofsX2 = ofsX1
					ofsY2 = ofsY1 + bWidth + 1
					break
				case 'bottom':
					ofsX1 = 5
					bWidth = 7
					ofsY2 = feedback.image.height - bWidth - padding
					bLength = feedback.image.width - ofsX1 * 2
					ofsX2 = ofsX1
					ofsY1 = ofsY2
			}
			let chan = await context.parseVariablesInString(feedback.options.meterVal1)
			if (chan.length == 1) chan = '0' + chan
			const options1 = {
				width: feedback.image.width,
				height: feedback.image.height,
				colors: [
					{ size: 45, color: combineRgb(0, 255, 0), background: combineRgb(0, 255, 0), backgroundOpacity: 64 },
					{ size: 52, color: combineRgb(255, 165, 0), background: combineRgb(255, 165, 0), backgroundOpacity: 64 },
					{ size: 1, color: combineRgb(255, 0, 0), background: combineRgb(255, 0, 0), backgroundOpacity: 64 },
				],
				barLength: bLength,
				barWidth: bWidth,
				type: position == 'left' || position == 'right' ? 'vertical' : 'horizontal',
				value: bVal(1 * this.levels.get(chan)),
				offsetX: ofsX1,
				offsetY: ofsY1,
				opacity: 255,
			}
			const peak1 = {
				...options1,
				colors: [{ size: 100, color: combineRgb(255, 0, 0), background: combineRgb(255, 0, 0), backgroundOpacity: 64 }],
				value: 100,
			}

			let bars = options1.value == 100 ? [graphics.bar(peak1)] : [graphics.bar(options1)]

			return { imageBuffer: graphics.stackImage(bars) }
		},
	}
	this.setFeedbackDefinitions(feedbacks)
}
