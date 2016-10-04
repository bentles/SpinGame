#!/bin/bash

# use browserify to bundle javascript dependencies together nicely
# thanks obama
watchify ../scripts/main.js \
         ../scripts/touches.js \
		 ../scripts/lib/three.js \
		 -o ../scripts/bundle.js
