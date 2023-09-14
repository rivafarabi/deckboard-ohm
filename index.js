const { Extension, log, INPUT_METHOD, PLATFORMS } = require('deckboard-kit');
const { Query } = require('node-wmi');

const CATEGORIZATION = {
	load: {
		'Memory': 'ram',
		'CPU Total': 'cpu',
		'GPU Core': 'gpu'
	},
	temperature: {
		'CPU Package': 'cpu',
		'GPU Core': 'gpu'
	}
}

const SUFFIX = {
	load: '%',
	temperature: '°C'
}

const DEFAULT_VALUE = {
	'hw-load-cpu': '-%',
	'hw-load-gpu': '-%',
	'hw-load-ram': '-%',
	'hw-temperature-cpu': '-°C',
	'hw-temperature-gpu': '-°C'
}

class OpenHardwareMonitor extends Extension {
	constructor(props) {
		super(props);
		this.setValue = props.setValue;
		this.name = 'Hardware Monitor';
		this.platforms = [PLATFORMS.WINDOWS];

		this.inputs = [
			{
				label: 'Display CPU Stats',
				value: 'hw-cpu',
				icon: 'headphones',
				mode: 'custom-value',
				fontIcon: 'fas',
				color: '#8E44AD',
				input: [
					{
						label: 'Select monitor',
						type: INPUT_METHOD.INPUT_SELECT,
						items: [
							{ value: 'hw-load-cpu', label: 'CPU Load' },
							{ value: 'hw-temperature-cpu', label: 'CPU Temperature' }
						]
					}
				]
			},
			{
				label: 'Display GPU Stats',
				value: 'hw-gpu',
				icon: 'headphones',
				mode: 'custom-value',
				fontIcon: 'fas',
				color: '#8E44AD',
				input: [
					{
						label: 'Select monitor',
						type: INPUT_METHOD.INPUT_SELECT,
						items: [
							{ value: 'hw-load-gpu', label: 'GPU Load' },
							{ value: 'hw-temperature-gpu', label: 'GPU Temperature' }
						]
					}
				]
			},
			{
				label: 'Display RAM Stats',
				value: 'hw-load-ram',
				icon: 'headphones',
				mode: 'custom-value',
				fontIcon: 'fas',
				color: '#8E44AD'
			}
		];
		this.configs = [];
	}

	// Executes when the extensions loaded every time the app start.
	initExtension() {
		if (process.platform === 'win32')
			setInterval(() => {
				Query()
					.namespace('root/OpenHardwareMonitor')
					.class('Sensor')
					.where("SensorType='Load' OR SensorType='Temperature'")
					.exec((err, data) => {
						if (err || !data)
							this.setValue(DEFAULT_VALUE)
						else this.setValue(data
							.filter(({ Name, SensorType }) => CATEGORIZATION[SensorType.toLowerCase()][Name] !== undefined)
							.map(({ Name, Value, SensorType }) => ({
								key: 'hw-' + SensorType.toLowerCase() + '-' + CATEGORIZATION[SensorType.toLowerCase()][Name],
								value: Math.round(Value) + SUFFIX[SensorType.toLowerCase()]
							}))
							.reduce((data, { key, value }) => ({ ...data, [key]: value }), DEFAULT_VALUE)
						)
					})
			}, 2000)
		else this.setValue(DEFAULT_VALUE)
	}

	execute(action, args) {
		return;
	};
}

module.exports = (sendData) => new OpenHardwareMonitor(sendData);