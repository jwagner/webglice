#!/bin/sh
python build.py release
rsync -vrt --copy-links build/* 29a.ch:/var/www/29a.ch/sandbox/2011/webgl3/
python build.py
