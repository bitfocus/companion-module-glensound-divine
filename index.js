// Glensound Divine

import { InstanceBase, Regex, runEntrypoint, UDPHelper } from '@companion-module/base'
import { updateActions } from './actions.js'
import { updateFeedbacks } from './feedback.js'
import { updatePresets } from './presets.js'
import { updateVariables } from './variables.js'
import { upgradeScripts } from './upgrades.js'
import PQueue from 'p-queue'
const queue = new PQueue({ concurrency: 1, interval: 5, intervalCap: 1 })

class GS_Divine extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.updateActions = updateActions.bind(this)
		this.updateFeedbacks = updateFeedbacks.bind(this)
		this.updatePresets = updatePresets.bind(this)
		this.updateVariables = updateVariables.bind(this)
	}

	getConfigFields() {
		console.log('config fields')
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module will allow you to control the Glensound Divine Network Audio Speaker.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Device IP / Hostname',
				width: 6,
				regex: Regex.HOSTNAME,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Device Port',
				width: 6,
				default: '41161',
				regex: Regex.Port,
			},
			{
				type: 'static-text',
				id: 'info',
				width: 6,
				label: 'Controller ID',
				value:
					'Each Glensound controller on the same network needs a unique ID. Unless you are running multiple controllers leave it at the Companion default (42495446). The ID must be 4 hex bytes.',
			},
			{
				type: 'textinput',
				id: 'controllerId',
				label: 'Controller ID',
				width: 6,
				default: '42495446',
				regex: '/^[abcdefABCDEF0123456789]*$/',
			},
		]
	}

	async destroy() {
		queue.clear()
		if (this.timer) {
			clearInterval(this.timer)
			delete this.timer
		}

		if (this.socket !== undefined) {
			this.socket.destroy()
		}

		console.log('destroy', this.id)
	}

	async init(config) {
		console.log('init GS')
		process.title = this.label
		this.config = config
		this.volume = 0
		this.unMute = 0
		this.timer = undefined
		this.channels = [
			{ id: '01', label: 'Channel 1' },
			{ id: '02', label: 'Channel 2' },
			{ id: '03', label: 'Channel 3' },
			{ id: '04', label: 'Channel 4' },
			{ id: '05', label: 'Channels 1-2' },
			{ id: '06', label: 'Channels 3-4' },
			{ id: '07', label: 'Channels 1-4' },
		]

		console.log(this.config)

		this.updateActions()
		this.updateVariables()
		this.updateFeedbacks()
		this.updatePresets()

		this.initUDP()
	}

	initUDP() {
		console.log('init_UDP ' + this.config.host + ':' + this.config.port)

		this.receiveBuffer = ''

		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		if (this.config.host) {
			this.socket = new UDPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				this.log('error', 'Network error: ' + err.message)
			})

			this.socket.on('listening', async () => {
				this.log('info', 'Connected')
				// get info
				await this.sendMessage(null, '05')
				// poll every 5 seconds
				this.timer = setInterval(this.dataPoller.bind(this), 5000)
			})

			this.socket.on('data', (chunk) => {
				this.log('debug', 'Data received')
				this.processDeviceData(chunk)
			})
		}
	}

	processDeviceData(data) {
		this.log('debug', 'processDeviceData')

		// get info test data from specification
		// data = Buffer.from([0x47,0x53,0x20,0x43,0x74,0x72,0x6c,0x00,0x90,0x00,0x04,0x0c,0x00,0x91,0xe9,0x80,0x00,0x24,0x17,0xdf,0xef,0xfe,0x32,0x7b,0x31,0x00,0x00,0x01,0x02,0x00,0x00,0x00,0x00,0x1d,0xc1,0xff,0xfe,0x91,0xe9,0x80,0x44,0x49,0x56,0x2d,0x30,0x31,0x2d,0x39,0x31,0x65,0x39,0x38,0x30,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x44,0x69,0x76,0x69,0x6e,0x65,0x2d,0x4d,0x61,0x72,0x63,0x69,0x6e,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x02,0x10,0x00,0x00,0x00,0x00,0x00,0x00])

		// status
		// data = Array.from([0x47,0x53,0x20,0x43,0x74,0x72,0x6c,0x00,0x28,0x00,0x01,0x00,0x0c,0x91,0xe9,0x80,0x02,0x00,0x00,0x00,0x00,0x01,0x02,0x00,0x00,0x00,0x00,0x00,0xfe,0xfe,0xfe,0xfe,0xfe,0xfe,0xfe,0xfe,0x13,0x6c,0xfc,0x00])

		// full report
		// data = Array.from([0x47,0x53,0x20,0x43,0x74,0x72,0x6c,0x00,0x60,0x00,0x0a,0x00,0x78,0x91,0xe9,0x80,0x01,0x01,0x04,0x00,0x80,0xbb,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x02,0x02,0x03,0x00,0x02,0x30,0x31,0x02,0x30,0x32,0x02,0x30,0x33,0x02,0x30,0x34,0x03,0x00,0x00,0x00,0x04,0x2f,0x09,0x00,0x56,0x00,0x00,0x00,0x02,0x00,0x00,0x00,0x00,0x00,0x02,0x02,0x16,0x00,0x00,0x00,0x05,0x00,0x00,0x00,0x06,0x02,0x02,0x02,0x01,0x00,0x02,0x07,0x1e,0x01,0x33,0x00,0x00,0x00,0x00,0x00])

		// divine report
		// data = Array.from([71,83,32,67,116,114,108,0,56,0,10,0,248,0,0,0,4,51,9,0,22,0,0,0,2,0,0,0,0,0,5,7,40,0,0,0,0,0,0,0,6,2,2,0,0,1,7,7,254,0,50,0,0,0,0,0])

		if (data != undefined) {
			this.log('debug', 'length: ' + data.length + ' type: ' + typeof data)
			this.log('debug', data)

			if (data.length == 144) {
				if (data[10] == 4) {
					// opcode 4 (info)
					this.log('debug', 'get info data recevied')

					// Firmware
					// var firmware = data[17].toString(16).padStart(2, '0') + data[16].toString(16).padStart(2, '0')
					const firmware = data[17] + ' ' + data[16]
					this.log('debug', 'firmware ' + firmware)
					this.setVariableValues({ firmware: firmware })
					let productId
					// Product Id
					if (data[24] == 49 && data[25] == 0) {
						productId = '49 (Divine)'
					} else {
						productId = 'Unknown'
					}
					this.log('debug', 'productId ' + productId)
					this.setVariableValues({ productId: productId })

					// Host Name
					let hostName = ''
					for (let j = 40; j < 72; j++) {
						// this.log('debug', j + ':' + data[j])
						if (data[j] != 0) {
							hostName = hostName + String.fromCharCode(data[j])
						}
					}
					this.log('debug', 'hostName ' + hostName)
					this.setVariableValues({ hostName: hostName })

					// Friendly Name
					let friendlyName = ''
					for (let j = 72; j < 104; j++) {
						// this.log('debug', j + ':' + data[j])
						if (data[j] != 0) {
							friendlyName = friendlyName + String.fromCharCode(data[j])
						}
					}
					this.log('debug', 'friendlyName ' + friendlyName)
					this.setVariableValues({ friendlyName: friendlyName })

					// Domain Name
					let domainName = ''
					for (let j = 104; j < 136; j++) {
						// this.log('debug', j + ':' + data[j])
						if (data[j] != 0) {
							domainName = domainName + String.fromCharCode(data[j])
						}
					}
					this.log('debug', 'domainName ' + domainName)
					this.setVariableValues({ domainName: domainName })
				}
			}

			if (data.length == 40) {
				if (data[10] == 1) {
					// opcode 1 (status)
					this.log('debug', 'status data recevied')
					let deviceVolume = data[37]
					this.log('debug', 'volume: ' + deviceVolume)
					this.setVariableValues({ volume: deviceVolume })
				}
			}

			if (data.length == 56) {
				if (data[10] == 10) {
					// opcode 10 (report)
					if (data[16] == 4) {
						// divine report (type 4)
						this.log('debug', 'divine report data recevied')
						let mixSelect = data[47]
						let mixSelectLabel = null
						for (let i = 0; i < this.channels.length; i++) {
							if (this.channels[i].id == mixSelect) {
								mixSelectLabel = this.channels[i].label
								break
							}
						}
						this.log('debug', 'mix select: ' + mixSelect + ' label: ' + mixSelectLabel)
						this.setVariableValues({ mixSelectLabel: mixSelectLabel })
						this.setVariableValues({ mixSelectValue: mixSelect })
					}
				}
			}

			if (data.length == 96) {
				if (data[10] == 10) {
					// opcode 10 (report)
					this.log('debug', 'report data recevied')
					let mixSelect = data[87]
					let mixSelectLabel = null
					for (let i = 0; i < this.channels.length; i++) {
						if (this.channels[i].id == mixSelect) {
							mixSelectLabel = this.channels[i].label
							break
						}
					}
					this.log('debug', 'mix select: ' + mixSelect + ' label: ' + mixSelectLabel)
					this.setVariableValues({ mixSelectLabel: mixSelectLabel })
					this.setVariableValues({ mixSelectValue: mixSelect })
				}
			}
		} else {
			this.log('warn', 'no data to process!')
		}
	}

	async configUpdated(config) {
		queue.clear()
		console.log('configUpdated')
		process.title = this.label
		let resetConnection = false

		if (this.config.host != config.host) {
			resetConnection = true
		}

		this.config = config

		this.updateActions()
		this.updateVariables()
		this.updateFeedbacks()
		this.updatePresets()

		if (resetConnection === true || this.socket === undefined) {
			this.initUDP()
		}

		// get info
		this.sendMessage(null, '05')
	}

	async sendMessage(cmd, opcode) {
		if (this.config.controllerId.length != 8) {
			this.log('warn', 'Invalid Controller Id! Please check module settings.')
			return
		}

		this.log('debug', 'send opcode: ' + opcode + ' cmd: ' + cmd)

		const gsHeader = '4753204374726C00' // GS Ctrl
		const multipacket = '00'
		let flags, length, message
		if (opcode == '03') {
			// set control
			flags = '03'
			// exclusive = true, meters = false
			length = (16 + cmd.length / 2).toString(16).padStart(2, '0')
			message = gsHeader + length + multipacket + opcode + flags + this.config.controllerId + cmd
			this.log('debug', 'Send control: ' + message)
		} else if (opcode == '05') {
			// get info
			flags = '00'
			length = '10'
			message = gsHeader + length + multipacket + opcode + flags + this.config.controllerId
			this.log('debug', 'Send getinfo: ' + message)
		} else if (opcode == '07') {
			// get config
			flags = '03'
			length = '10'
			message = gsHeader + length + multipacket + opcode + flags + this.config.controllerId
			this.log('debug', 'Send getconfig: ' + message)
		}

		if (message !== undefined) {
			await queue.add(async () => {
				if (this.socket !== undefined) {
					await this.socket
						.send(this.hexStringToBuffer(message))
						.then(() => {})
						.catch((error) => {
							this.log('warn', `Message send failed!\nMessage: ${message}\nError: ${JSON.stringify(error)}`)
						})
				} else {
					this.log('warn', 'Socket not connected')
				}
			})
		}
	}

	padLeft(nr, n, str) {
		return Array(n - String(nr).length + 1).join(str || '0') + nr
	}

	asciiToHex(str) {
		const arr1 = []
		for (let n = 0, l = str.length; n < l; n++) {
			const hex = Number(str.charCodeAt(n)).toString(16)
			arr1.push(hex)
		}
		return arr1.join('')
	}

	hexStringToBuffer(str) {
		// this.log('debug', 'to buffer > ' + str)
		return Buffer.from(str, 'hex')
	}

	async dataPoller() {
		if (this.socket !== undefined) {
			// send getConfig poll request
			await this.sendMessage(null, '07')
		} else {
			this.log('debug', 'dataPoller - Socket not connected')
		}
	}
}

runEntrypoint(GS_Divine, upgradeScripts)
