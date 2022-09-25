# Walltaker-for-WallpaperEngine
A wallpaper for Wallpaper Engine that show a e621 post from your walltaker link as your background
<br>
You need a link-id from https://walltaker.joi.how/ for this Wallpaper to work.<br>
<br>
### **Note!** When walltaker pauses the background you will be shown as offline on walltaker,<br>
 to prevent that deactivate all pause options in WE settings. (settings > performance > playback)<br>
<br>
You have too much money, or just want to tip me a coffee:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/lyrcaon)


# Installation

- Download SourCode.zip
- Put "Walltaker-for-WallpaperEngine" folder in [WallpaperEngine Path*]\projects\myprojects

 _* this is the path where your wallpaper.exe i located.

# Features

### Custom Areas
You can choos between 6 postion for some elements like:

#### Setter Informations
Show Information about the Setter of your current wallpaper, like online status, friend status, links and last responses to links wallpapers <br>
<img width="250" alt="image" src="https://user-images.githubusercontent.com/80824508/170127679-b6659bec-7c61-4270-ad80-c0941b4e82c3.png">


#### Quick reactions (+ link response)
Set quick reactions to your wallpaper and see the current reaction <br>
<img width="250" alt="image" src="https://user-images.githubusercontent.com/80824508/170127488-0d7992e3-12b1-463c-89a3-fb64f072fd52.png">

### Videos & Gifs
Gifs have been supported from v0.0.1 <br>
Videos are supported from v1.0.0


## NEW!

### Custom and preset Reaction Texts
You can now choose what text is used for the reaction you set.
There are some preset Text, but you can set 6 custom ones.
<img width=250 src="https://user-images.githubusercontent.com/80824508/171394562-64a5f6c0-487d-4fb0-ab3b-95c9d46609a9.gif">


# Settings

### "walltaker.joi.how/links/":  
This Option is required for the Wallpaper to work it defines the link from witch the Wallpaper gets the posts

### "api_key"
!needed for some of the features! <br>
Get the api_key from your profile page on walltaker 

needed for:
- quick reactions
- setter friend status

### "interval (sec.)":
This option Changes the frequency of checks for changes to the link (includes setter information and wallpaper)<br>
unit: seconds

### "default video volume":
Setting for the default volume of videos.
This settings only changes the initial volume of the videos when loaded in.
If you wan't to change the current videos volume
use the UI that should apear when hovering over the video.
The volume option should be a speaker in the bottom right corner of the video

1 = 100%, 0 = 0% = mute


### "Image Fit": 
Select the image fit/scaling you want to apply to your background
  - contain: scales image to fit inside bounds while maintaining proportions
  - fill: streches image to bounds
  - cover: zooms in until images covers whole canvas area
  - scale-down: automatic chooses between none and contain to get best result
  - none: applies no fit image uses default fit (normally show image 1:1)
unti: fit-mode as string

### "Background Color": 
Changes the color of the background<br>
unit: rgb

### "Text Color": 
Changes the color of the text on the Wallpaper
unit: rgb

### "Font Size":
Change the size of the texts/UI

### "Set by":
change where Set by is shown

### "Load setter data":
Check this if you wan't to get more infos of the setter, like onlin status.<br>
Uncheck this if the wallpaper uses too much RAM or you have performance issues.

### "Setter Infos":
Where to show adittional info about setter

### "List setter links"
Check if you want infos to all puplic links of your wallpapers setter

### "Quick reactions":
Where to show the quick reactions buttons and your current link reaction

### "Zoom width/height": 
Zooms the image/video in and out <br>
100% means 100% of width/height of Desktop <br>
note that if Image fit is not fill the image will apply scale of fit using zoom as upper bound <br>
unit: % 

### "Pos x/y": 
Changes the absolute position of image/video (uses top left corner) <br>
shifts image by selected pixels in x(vertical) and y(horizontal) position <br>
unit: px

## Reaction dropdown / Reaction preset packs

Tick the boxes whose presets you want to use.<br>

### Custom Reactions
If Custom Reactions is ticked you get 6 Textboxes in wich you can put whatever text you want.<br>
Custom Reactions will show up as first entries of the dropdown .


# Currently looking into:

### Discarded
- parallax efect: not possible (no mous and keybord input for web wallpapers)
- text reactions: reason same as by paralax

### To-Do:
- preset reactions / dropdown reactions

### Testing:
- transition animations 
- preloading Images before showing 
