# Walltaker-for-WallpaperEngine
A wallpaper for Wallpaper Engine that show a e621 post from your walltaker link as your background

You need a link-id from https://walltaker.joi.how/ for this Wallpaper to work.


# Installation

- Download folder (Wallpaper Engine and Index.html get files from folder)

- *open* Wallpaper Engine

- *click* Change Background

- *click* Open Background

- *click* Offline Background

- *select* Index.html

- *input* link-ID in properties

- *enjoy*


# Properties

- "walltaker.joi.how/links/"  
This Option is required for the Wallpaper to work it defines the link from witch the Wallpaper gets the posts

- "interval (sec.)" \n
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

- "Background Color" 
Changes the color of the background
unit: rgb

- "Text Color" 
Changes the color of the text on the Wallpaper
(currently only set_by)
unit: rgb

- "zoom width/height" 
Zooms the image canvas in and out
100% means 100% of width/height of Desktop
note that if Image fit is not fill the image will apply scale of fit using zoom as upper bound
unit: % 

- "Pos x/y" 
Changes the absolute position of image canvas (uses top left corner)
shifts image by selected pixels in x(vertical) and y(horizontal) position
unit: px


