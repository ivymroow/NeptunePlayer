# NeptunePlayer Version History

yo this is every version and if it actually works or not. dont download the broken ones lmao

## WORKING VERSIONS

### v1.2.8 (current)
fixed discord rpc icon text, removed click sound, fixed custom cursors, fixed overlay effects

### v1.2.7
first version where convert tab actually doesnt crash the whole app. convert bar is under the tabs finally.

### v1.0.21
pride icon RPC. auto update works properly going forward from here. everything before convert tab was stable.

### v1.0.18
friends list looks clean now. neptuneplayer- prefix stripped visually. square pfps bigger.

### v1.0.14
clear all button doesnt reload the page anymore so beta notice doesnt come back. after import rename only touches current imports not your whole library. remove artist name and dash toggles added.

### v1.0.11
library right click menu works. online status is decent here.

### v1.0.5
first version where installer name is clean (NeptunePlayer.Setup.exe) and auto update should work.

### v1.0.1
first public build. it exists.

## BROKEN / DONT USE

### v1.0.34
build just got cut off cuz i was about to fix the convert bar showing everywhere bug. dont download.

### v1.0.27 - v1.0.32
convert tab placement was all over the place. top, bottom, middle, nowhere. some builds the convert button just did nothing. v1.0.27 had auto update loop too cuz of allowDowngrade flag that just made it download the same version over and over.

### v1.0.26
random files were getting imported into library from downloads folder even if u didnt download them with convert. scary as hell. fixed in later versions.

### v1.0.24 - v1.0.25
convert tab is here but UI is cooked. stuck at importing to library bug too.

### v1.0.22 - v1.0.23
first convert tab versions. unbaked as hell. binaries werent included in the build at first so it just didnt work at all.

### v1.0.19 - v1.0.20
pride icon was added but VER number was still hardcoded to 1.0.12 so the beta notice and version display was wrong. confusing.

### v1.0.16
VER constant was still stuck at 1.0.12 even tho package.json said 1.0.16. confusing if you looked at the UI.

### v1.0.15
tried switching auto update from github api to direct latest.yml url. didnt work the way i wanted so reverted next version.

### v1.0.12 - v1.0.13
auto update issues. edit name used broken prompt() so it didnt work in electron.

### v1.0.8 - v1.0.10
listen together button did nothing for a while. album art and title wouldnt update. song matching was too strict so most songs didnt match between friends.

## NOTES

- if auto update is stuck in a loop, you need to manually download the newest version from the website. auto update only fixes itself when u get on a version without the loop bug.
- only the INSTALLER (.Setup.exe) supports auto update. the portable .exe cant update itself on windows.
- every version after 1.0.21 has the github api auto updater and it works. just make sure ur on a clean version.
- versions 1.0.22+ have the convert tab bundled with yt-dlp and ffmpeg. earlier versions dont have convert at all.
- the website always links to the newest version so ur good just downloading from there.

made by ivymroow
