#!/usr/bin/env node
"use strict"

const fusionCopy = require("./fusionCopy");

const sourceVolumeName = "FusionSD";
const targetFolder = "/Volumes/Samsung_T5/TestFusionOutput";

var fc = new fusionCopy(sourceVolumeName, targetFolder);
fc.go();
