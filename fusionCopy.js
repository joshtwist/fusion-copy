"use strict";

const drivelist = require('drivelist');
const fs = require('fs-extra');
var path = require('path');
const glob = require('glob');
const dateformat = require('dateformat');
const cliProgress = require("cli-progress")

function FusionCopy(sourceVolumeName, targetFolder) 
{
    var sourceVolumeName = sourceVolumeName;
    var targetFolder = targetFolder;

    if (!fs.existsSync(targetFolder)){
        throw new Error(`Destination folder '${targetFolder}' does not exist`);
    }

    var scan = {
        volumes: 0,
        fileGroups: 0,
        files: 0
    }

    var processFilesIntoFileGroups = (files, callback) => {
        // expects a list of file paths
        
        var fileGroups = {
            forEach: function(callback) {
                for (var propertyName in this) {
                    var me = this;
                    var pn = propertyName;
                    if (pn === "length" || pn === "forEach" || pn === "filesLength") {
                        continue;
                    }
    
                    callback(me[pn]);
                }
            },
            length: 0,
            filesLength: 0
        };
    
        // examples: /GB010063.LRV
        //           /GPFR0063.JPG
        const regex = /.*?\/G[PBF]..(\d\d\d\d)\.(LRV|JPG|WAV|MP4|THM)/gm;
    
        files.forEach(file => {
            var m;
            while ((m = regex.exec(file)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                
                // The result can be accessed through the `m`-variable.
                m.forEach((match, groupIndex) => {
                    // only interested in group 1, the Numbers group
                    if (groupIndex !== 1) { return; }
                    
                    if (fileGroups[match] !== undefined) {
                        fileGroups[match].files.push(file);
                        fileGroups.filesLength++;
                    }
                    else
                    {
                        fileGroups[match] = {
                            number: match,
                            files: [file]
                        };
                        fileGroups.length++;
                        fileGroups.filesLength++;
    
                    }
    
                    
                });
            }
        });
    
        if (typeof(callback) === 'function') {
            callback(fileGroups);
        }
    }
    
    var createFolders = function(fileGroups, callback) {
        
        var scb = createSafeCallback(callback, fileGroups.length);
    
        fileGroups.forEach(fg => {
            var dir = path.join(targetFolder, `${fg.date} Fusion`);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
    
            var suffix = "(Image)";
    
            if (fg.files.filter(f => f.endsWith("MP4")).length > 0) {
                suffix = "(Video)"
            }
    
            fg.targetFolder = path.join(dir, `${fg.number} ${suffix}`);
            if (!fs.existsSync(fg.targetFolder)) {
                fs.mkdirSync(fg.targetFolder);
            }
    
            scb();
        });
    }
    
    var copyFiles = function(fileGroups, callback) {
    
        var scb = createSafeCallback(callback, fileGroups.filesLength);
        var ix = 0;
    
        const bar1 = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
        bar1.start(fileGroups.filesLength, 0);
    
        fileGroups.forEach(fileGroup => {
            fileGroup.files.forEach(file => {
                var fg = fileGroup;
                var destination = path.join(fg.targetFolder, path.basename(file));
                fs.copySync(file, destination, { preserveTimestamps : true }, (err) => {
                    if (err) {
                        throw(err);
                    }
                    scb();
                });
                ix++;
                if (ix == fileGroups.filesLength) {
                    bar1.stop();
                }
                else {
                    bar1.update(ix);
                    //console.debug(`${ix} of ${scan.files}`);
                }
            })
        });
    }
    
    var guessDateOfFileGroups = function(fileGroups, callback) {
    
        var scb = createSafeCallback(callback, fileGroups.length);
    
        fileGroups.forEach(fg => {
            fs.stat(fg.files[0], (err, stats) => {
                if (err) {
                    throw err;
                }
                fg.date = dateformat(stats.ctime, "yyyy-mm-dd");
                scb();
            });
        });
    }
    
    function createSafeCallback(callback, index) {
    
        if (!Number.isInteger(index) || index < 1) {
            throw new Error(`Index ${index} is not a valid integer`);
        }
    
        var cursor = 0;
        var cb = callback;
        var ix = index;
    
        return function() {
            cursor++;
            if (cursor === ix) {
                cb.apply(null, arguments);
            }
        };
    }
    
    var getDrives = function(volumeName, callback) {
        drivelist.list((error, drives) => {
            if (error) {
                throw(error);
            }

            const volumes= [];
        
            drives.forEach(drive => {
                drive.mountpoints.forEach(mp => {
                    if (mp.label === sourceVolumeName) {
                        volumes.push(mp.path);
                    }
                });
            });

            scan.volumes = volumes.length;
            callback(volumes);
        });
    }

    var findMatchingFiles = function(driveArray, callback) {
        
        var scb = createSafeCallback(callback, driveArray.length);
        var files = [];

        driveArray.forEach(drive => {
            glob(`${drive}/**/G???????.???`, null, (error, matches) => {
                if (error) {
                    throw error;
                }
    
                matches.forEach(match => {
                    files.push(match);
                });
    
                scb(files);
            });
        });
    }
    
    var _go = function()
    {
        getDrives(sourceVolumeName, (drives) => {
            if (drives.length === 0) {
                throw new Error(`No drives matching '${sourceVolumeName}' found.`);
            }
            findMatchingFiles(drives, (files) => {
                processFilesIntoFileGroups(files, fileGroups => {
                    scan.fileGroups = fileGroups.length;
                    scan.files = fileGroups.filesLength;
                    console.log(`Scan complete: ${scan.volumes} volumes, ${scan.fileGroups} groups and ${scan.files} files found.`);
                    guessDateOfFileGroups(fileGroups, () => {
                        createFolders(fileGroups, () => {
                            copyFiles(fileGroups, () => {
                                // done!
                            });
                        });
                    });
                });
            });
        });
    }

    this.go = _go;

}

module.exports = FusionCopy;