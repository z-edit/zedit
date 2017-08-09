module.exports = function (config) {
	config.set({
		basePath: '..',
		files: [
			'src/**/*.spec.js'
		],
		preprocessors: {
			'src/**/*.spec.js': ['rollup']
		},
		rollupPreprocessor: {
			plugins: [
				require('rollup-plugin-istanbul')({
					exclude: ['src/**/*.spec.js']
				})
			]
		},
		reporters: ['coverage']
	});
};