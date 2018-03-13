# emily-cm
Emily is a **component manager** and offers easy integration with your workflow while not restricting structural freedom.
Install using: `npm install emily-cm -g`

## Commands
- `emily init <dir>` Generates the emily.json
- `emily new <module>` Generates a module with the given name
- `emily activate <module>` Activates the given module
- `emily deactivate <module>` Dectivates the given module
- `emily list` Lists all modules
- `emily gitinit <git> <name>` Add a repository as a new modules
- `emily gitcheckout <module>` Clones an existing module by its repository url

## emily.json
After the basic installation via `emily init <dir>`. You can further customize the emily.json to fit your needs.

## Build task integration
Emily offers some basic methods to retrieve the module paths and integrate them in your build task:

```javascript
const emily = require('emily-cm');

// Tries to return the full config file
emily.config();

// Returns an array containing all modules
emily.all();

// Returns an array containing all active modules
emily.active();

// Returns an array containing all inactive modules
emily.inactive();

// Generates a path-array from the given module array
emily.toPaths(emily.all());
```

### Example with gulp
```javascript
const gulp = require('gulp');
const emily = require('emily-cm');
 
gulp.task('scripts', function() {

  // Get all .js files in every active module
  let scripts = emily.toPaths(emily.active()).map((el)=>el + '**/*.js'));
  
  return gulp.src(scripts)
    .pipe(gulp.dest('dist/js'));
});
```