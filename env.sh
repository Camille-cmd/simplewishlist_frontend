#!/bin/sh
# Script to replace environment variables in JS and CSS files with the values from the environment
for i in $(env | grep TPL_)
do
    #Get the environment variable available in the container
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2-)
    echo $key=$value

    # Replace the environment variable in the JS and CSS files
    # sed JS and CSS only
    find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|${key}|${value}|g" '{}' +
done
