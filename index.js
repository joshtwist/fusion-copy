#!/usr/bin/env node
"use strict"

const fusionCopy = require("./fusionCopy");
const program = require("commander");
var pjson = require('./package.json');

program
    .version(pjson.version)
    .option('-v, --source-volume <volume>', 'The name of the volumes to scan for GoPro Fusion files', 'FusionSD')
    .option('-d, --destination <destination>', 'The destination folder to copy organized files', '/Volumes/Samsung_T5/GoPro Fusion')
    .parse(process.argv);

console.log(`Source volume name: ${program.sourceVolume}`);
console.log(`Destination folder: ${program.destination}`);

// Not pretty, but good enough >>> perfect
process.on('uncaughtException', err =>{
    console.error(`Error: ${err.message}`);
    process.exit();
});

var fc = new fusionCopy(program.sourceVolume, program.destination);
fc.go();