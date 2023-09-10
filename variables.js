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
	)

	this.setVariableDefinitions(variables)
}
