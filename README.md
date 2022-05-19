# Walltaker-for-WallpaperEngine
A wallpaper for Wallpaper Engine that show a e621 post from your walltaker link as your background

You need a link-id from https://walltaker.joi.how/ for this Wallpaper to work.

### There is a preview Version of upcoming features under Releases!

# Installation

- Download SourCode.zip
- Put "Walltaker-for-WallpaperEngine" folder in [WallpaperEngine Path*]\projects\myprojects

 _* this is the path where your wallpaper.exe i located.

# Properties

- "walltaker.joi.how/links/":  
This Option is required for the Wallpaper to work it defines the link from witch the Wallpaper gets the posts

- "interval (sec.)":
This option Changes the frequency of checks for changes to the link
unit: seconds

- "Image Fit": 
Select the image fit/scaling you want to apply to your background
  - contain: scales image to fit inside bounds while maintaining proportions
  - fill: streches image to bounds
  - cover: zooms in until images covers whole canvas area
  - scale-down: automatic chooses between none and contain to get best result
  - none: applies no fit image uses default fit (normally show image 1:1)
unti: fit-mode as string

- "Background Color": 
Changes the color of the background
unit: rgb

- "Text Color": 
Changes the color of the text on the Wallpaper
(currently only set_by)
unit: rgb

- "Zoom width/height": 
Zooms the image canvas in and out
100% means 100% of width/height of Desktop
note that if Image fit is not fill the image will apply scale of fit using zoom as upper bound
unit: % 

- "Pos x/y": 
Changes the absolute position of image canvas (uses top left corner)
shifts image by selected pixels in x(vertical) and y(horizontal) position
unit: px

# Currently looking into:

### Coming next Version:
- api_key integration
- quick reactions (textinput not possible)
- content areas

### Discarded
- parallax efect: not possible (no mous and keybord input for web wallpapers)
- text reactions: reason same as by paralax

### To-Do:
- preset reactions / dropdown reactions

### Testing:
- transition animations (this one already works, but don't make sense, when image is not loaded whan animation is started)
- preloading Images before showing (testing currently, but can't get it to work right)
