// Used by .github/workflows/npm-grunt.yml ("grunt" step).
module.exports = function (grunt) {
  const run = (cmd) => () => {
    const { execSync } = require('child_process');
    execSync(cmd, { stdio: 'inherit' });
  };
  grunt.registerTask('test', 'Run vitest', run('npm test'));
  grunt.registerTask('typecheck-engine', 'Typecheck engine', run('npm run typecheck:engine'));
  grunt.registerTask('build-engine', 'Build engine', run('npx tsc -p time-app/timeoe-engine/tsconfig.json'));
  grunt.registerTask('default', ['test', 'typecheck-engine', 'build-engine']);
};
