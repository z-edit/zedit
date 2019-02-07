call npm i z-edit/xelib --save
copy /Y .\node_modules\xelib\XEditLib.dll .\XEditLib.dll
del ".\node_modules\xelib\XEditLib.dll"
del ".\node_modules\xelib\*.dat"
call npm run rebuild