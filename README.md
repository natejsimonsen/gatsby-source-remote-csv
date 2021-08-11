# gatsby-source-remote-csv
Gatsby Source to take remote csv endpoints and turn them into gatsby graphql endpoints

This is really mostly used for an excel spreadsheet (mostly with google drive) that has an exposed csv endpoint

## Installation
To install, run 
```
npm install gatsby-source-remote-csv
```

## How to use
In your gatsby-config.js put this code
```
{
  resolve: `gatsby-source-remote-csv`,
  options: {
    url:
      "your url here",
  },
},
```
run ```gatsby develop``` and you should be able to explore the graphql schema at http://localhost:8000/___graphql

You should have a graphql endpoint at AllRemoteCsv and begin to query from there

## Features
This plugin has one feature that requires gatsby-transformer-sharp and gatsby-plugin-sharp to be installed and configured.
To use this feature run
```
npm install gatsby-plugin-sharp gatsby-transformer-sharp
```
then in your gatsby-config.js put
```
... gatsby config plugins
'gatsby-plugin-sharp',
'gatsby-transformer-sharp',
... gatsby config plugins
```
The plugin takes a remote url such as https://myimageurl.com/image.jpeg and transforms it to a gatsby image of the name ${columnName} + Image
If there is a field called avatar which had a valid url, it would make a new field on the node called avatarImage

This plugin only works for absolute urls (not relative, e.g ../images/image.png) that are valid urls that end in .jpg, .jpeg, or .png

## Plugin Options
Here are the default config options for gatsby-source-remote-csv

```
{
  resolve: `gatsby-source-remote-csv`,
  options: {
    url: '', // required
    optimizeImages: true, // if false, it does not create gatsby images from remote urls
    transformHeaders: true, // if false, the plugin does not camel case headers and keeps the names to their original state
    transData: false, // do not flag as true this is a function, more on this below
  },
},
```

NOTE: the transData option expects a function
The function receives two parameters, the current value and the current field
The function should return one value, it can be a string, array, number, boolean, etc.
This function is internaally the [transform function of the csv parser npm package papaparse](https://www.papaparse.com/docs#config)
