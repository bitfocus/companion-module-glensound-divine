export function updateVariables() {
	let variables = []

	variables.push(
		{
			name: 'Product ID',
			variableId: 'productId',
		},
		{
			name: 'Firmware Version',
			variableId: 'firmware',
		},
		{
			name: 'Host Name',
			variableId: 'hostName',
		},
		{
			name: 'Friendly Name',
			variableId: 'friendlyName',
		},
		{
			name: 'Domain Name',
			variableId: 'domainName',
		},
		{
			name: 'Mix Select Label',
			variableId: 'mixSelectLabel',
		},
		{
			name: 'Mix Select Value',
			variableId: 'mixSelectValue',
		},
		{
			name: 'Volume',
			variableId: 'volume',
		},
		{
			name: 'Volume (dB)',
			variableId: 'volume_dB',
		},
		{
			name: 'Level: Input 1',
			variableId: 'levelInput1',
		},
		{
			name: 'Level: Input 2',
			variableId: 'levelInput2',
		},
		{
			name: 'Level: Input 3',
			variableId: 'levelInput3',
		},
		{
			name: 'Level: Input 4',
			variableId: 'levelInput4',
		},
		{
			name: 'Level: Input 1+2',
			variableId: 'levelInput12',
		},
		{
			name: 'Level: Input 3+4',
			variableId: 'levelInput34',
		},
		{
			name: 'Level: Input 1+2+3+4',
			variableId: 'levelInput1234',
		},
		{
			name: 'Level: Output',
			variableId: 'levelOutput',
		},
		{
			name: 'Pot Position',
			variableId: 'potPosition',
		},
		{
			name: 'Device Temperature (C)',
			variableId: 'temp',
		},
	)

	this.setVariableDefinitions(variables)
}
