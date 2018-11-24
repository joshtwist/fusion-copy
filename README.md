# fusion-copy

fusion-copy is a command line utility built to help with the awkward process of copying and organizing files captured by the GoPro Fusion 360 camera.

## tl;dr

1. Install the script `npm install -g fusion-copy`
2. Execute the script to copy files from your named SD cards `fusion-copy -v sd-cards-volume-name -d /Volumes/Drive/Destination/Folder`

## Why?

1. Tidy: your files will be nicely organized by date and type.

1. Fast: pulling files directly off the SD cards via a card reader tends to be much quicker than from the camera.

1. Reliable: the software provided by GoPro tends to be pretty shoddy and can't work with too many files at once. Organizing the files helps you to select the right files for import. The GoPro software itself doesn't recognize my Fusion camera on my iMac.

## What?

The utility scans your SD cards and pulls all the files of your front and back SD cards. It organizes the front and back images together into dated and then numbered folders, example:

* destination folder
  * 2018-11-17 Fusion
    * 0012 (Video)
      * GPBK0012.LRV
      * GPBK0012.MP4
      * GPBK0012.WAV
      * GPBK0012.THM
      * GPFR0012.LRV
      * GPFR0012.MP4
      * GPFR0012.THM
    * 0098 (Image)
      * GB010098.JPG
      * GB010098.JPG

The numbered folders also indicate whether the contents include a video or are just images: (Video) or (Image).

You can now selectively choose these numbered folders for import into the Fusion software.

## How?

First, give your front and back SD cards a name, I called both of mine "FusionSD" (no space) and this is the default volume name in the script so your life will be easier. 

If you haven't already, get yourself some fast Micro SD card readers. 

I got two of these from Amazon: https://amzn.to/2TDv1Lg  and one of these nice Anker USB hubs: https://amzn.to/2znR68b

![Anker USB with two fast SD card readers](https://s3-us-west-2.amazonaws.com/mlmrg/anker_usb.png)

Take the SD cards out of your Fusion camera and execute the fusion-copy script:

```bash

fusion-copy -v FusionSD -d /Volumes/YourStorage/SomeFolder/WhereYouKeep/YourGoProStuff/
```

## Installation

The script utility can be installed from npm: `npm install -g fusion-copy`

## Important

* The utility does not delete the files from your SD card. Not risking that, do it manually when you're sure the files are safely copied. 


