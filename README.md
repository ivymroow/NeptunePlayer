# neptuneplayer

a local desktop music player for windows. it plays local audio files, downloads songs / albums / playlists from urls, and shows what you are listening to on discord!

## install

- download `NeptunePlayer.Setup.exe` and run the installer. this creates a desktop shortcut

[ latest download: https://github.com/ivymroow/NeptunePlayer/releases/latest/download/NeptunePlayer.Setup.exe ]

windows may show a warning because the app is not signed. click "more info" then "run anyway".

## how to use

1. add music. click "+ add tracks" to pick files, drag and drop audio into the window, or right-click a music file in explorer and choose "play in neptuneplayer".
2. click a song to play it.
3. the controls are at the bottom. use the buttons for shuffle, previous, play/pause, next, repeat, a-b loop, speed, and lyrics.

the sidebar has four tabs:

- library. your songs.
- playlists. groups of songs you make.
- social. listen together with friends.
- convert. paste a url to download songs / albums.

## features

- discord rich presence. shows the current song and its album art in discord.
- a-b loop. press the a-b button once to set point a, again to set point b. it loops that section. click once more it to clear. ~~**[wip]**~~ 
- synced lyrics. press the lyrics button in the bottom bar. lyrics load from lrclib. click a line to skip to that part. use the -0.3s / +0.3s buttons to fix timing.
- equalizer. player settings > equalizer. ten bands with presets. ~~**[wip]**~~ 
- crossfade. player settings > crossfade. blends the end of one song into the next. **[wip]**
- theme editor. player settings > theme editor. change colors or pick a preset. **[wip]**
- custom cursor. player settings > import cursor. pick a .png, .cur, or .ico file. **[wip]**
- song history. right-click a song and choose "song history". it saves every play, even after updates.
- edit song. right-click a song and choose "edit song". change the title, artist, album, and cover. for files on disk it renames the file and writes the tags. **[wip]**
- convert. paste a youtube or other url to download it as mp3. converted files go to `%appdata%\neptune-player\songs`. 
- explorer integration. right-click any audio file in windows explorer and choose "play in neptuneplayer". 
- notifications. a toast shows when a song changes and when the next song is about to play.
- multi-language. player settings > language. english, spanish, french, german, portuguese, and japanese. **[wip + might not be accurately translated]**
- debug console. press the delete key. it shows the browser console logs, warnings, and errors, with filter tabs and a copy button. **[note: this was implemented to stop people from stealing hours of work lol]**
- social. add a friend by their peer id to listen together. **[wip]**

## notes

- entire thing was vibedeveloped for so many nights @w@
- **[wip]** next to features are work in progress and subject to either: be polished/reworked/rewrote or probably removed from the app entirely.
- ~~**[wip]**~~ next to features mean i finished it quickly after making this fucking readme lolo hahaha fahahahahah 
