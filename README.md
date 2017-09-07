# zedit

An integrated development environment for Bethesda Plugin Files.

This project is built off of the xEdit codebase via [xedit-lib](https://github.com/matortheeternal/xedit-lib).  The project also uses code from [electron-boilerplate](https://github.com/swacz/electron-boilerplate) and [shampoo](https://github.com/matortheeternal/shampoo).

# setup
zEdit is a Windows x86 NodeJS Electron application.  Install [NodeJS](https://nodejs.org/en/download/current/) **32-bit**, then start a terminal/command prompt in the application directory and run `node -v` and `npm -v`.  The output should be v6.9.5 and 5.3.0 or newer.  If you get anything else you probably have multiple installations of node which you'll need to sort out.

Before installing node modules you need to tell NodeJS where Python is so it can build certain native dependencies.  Install [python 2.7](https://www.python.org/downloads/windows/)\* and [add an environmental variable](https://kb.wisc.edu/cae/page.php?id=24500) `PYTHON` set to the full path to `python.exe`.  E.g. `C:\dev\lang\Python27\python.exe`.  Restart your command prompt and test the environmental variable by typing `echo %PYTHON%`.

Run `npm install` in an elevated command prompt.  This will install required node modules and dependencies.  If you run into any errors (indicated by `ERR!`) contact us and we'll help sort things out.

You can then run the application with `npm start`.  

\*Python 3.x may work as well, but I haven't tested with it.

# building
You can build a release of the application using `npm run release`.  The application structure is based off of [electron-boilerplate](https://github.com/szwacz/electron-boilerplate).  

# troubleshooting
- If you get `Error: Electron failed to install correctly`, simply delete the `node_modules\electron` folder and run `npm install` again.  
- If you get `Exception loading X, *.hardcoded.dat not found` when loading plugins copy the appropriate dat file from the base directory to the `node_modules\electron\dist` folder.
- Fall back to `npm run release` if `npm start` doesn't work for you due to a DLL not found error.
- If you run into an error with `bindings.js` with the ref module you're probably using 64-bit node, switch to 32-bit node and things should work.
- If when running `npm install` you get `MSBUILD : error MSB3428: Could not load the Visual C++ component "VCBuild.exe".`, install the package `windows-build-tools` with npm as admin (`npm install --global --production windows-build-tools`).

# contact
If you're looking for support or want to contribute, join the [Modding Tools discord server](https://discord.gg/GUfRdpT).

You can view project progress and user stories on the [trello board](https://trello.com/b/AudbG6UN/zedit).
