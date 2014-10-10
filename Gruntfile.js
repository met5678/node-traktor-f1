module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		wiredep: {
			app: {
				src: '*.*',
				options: {
					dependencies:true,
					devDependencies:true,
					overrides: {
						'livereload': {
							main: 'dist/livereload.js'
						}
					}
				}
			}
		}
	});
	
	//grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-wiredep');

	grunt.registerTask('default',['wiredep']);
};
