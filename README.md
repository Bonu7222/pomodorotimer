# zen focus

built this bcs i needed pomodoro timer that doesnt stess me out. instead of just a boring countdown, a tiny pixel plant gwos as u focus, and blooms when u finally rake a break. its dark, quiet, and keeps track of how many sessions u finish in a day.

## features 

--pixel plant: drawn from scratch on a canvas. no sprites or images. the stem gets taller, leaves pop out, and a little flower blooms at the top when the work session is done.
--pomodoro timer: standard 25 minute work sessions and 5 minute breaks
--synth chime: used the web audio apu to make a soft 3note chime when switcheng from work to break. no audio files needed.
--daily tracker: uses localstorage to count how many sessions u finish today. it resets automatically at midnoght
--zen aesthetic: dark mode, sharp borders, retro monospace font and zero distractions.

## how to run. 

just open index.html in ur browser. hit start and go do ur work. the plant will grow.

## what i learned 

this project was mostly a lesson in debugging silly mistakes. heres what actually stuck:

--the missing curly brace: i accidentally nested my entire game loop and event listeners inside the drawPlant function. everytime the plant drew a new frame, it added another click listener to the start button. it took long to realize a single missing `}` was the culprit.
--time math: i wrote 25*50 instead of 25*60 for the work time. always double check ur time constants.
--early returns: i had an if statement with a return right at the start of my draw function which meant the plant could never actually grow. making sure your functions dont exit early in crucial.

overall its a really chill tool. it forces u to focus bcs u wanna see the plant bloom.