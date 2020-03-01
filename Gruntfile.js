'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    babel: {
      options: {
        comments: false,
        presets: ['minify']
      },
      dist: {
        files: {
          'n2words.min.js': 'n2words.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('default', ['babel']);
}
