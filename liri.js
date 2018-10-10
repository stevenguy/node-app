require("dotenv").config();

const keys = require('./keys.js');

const Spotify = require('node-spotify-api')
const spotify = new Spotify(keys.spotify)

const moment = require('moment')
const inq = require('inquirer')

const fs = require('fs')
const request = require('request')

function menu(){
    inq.prompt([
        {
          type: 'list',
          message: 'What would you like to do',
          name: 'choice',
          choices: ['concert-this','spotify-this-song','movie-this','do-what-it-says']
        }
      ])
      .then( function (answers) {
            switch (answers.choice) {
                case `concert-this`:
                    inq.prompt([
                        {
                        type: 'input',
                        message: 'What artist would you like to find the venue of?',
                        name: 'artist'
                        }
                    ])
                    .then(answers => concertThis(answers.artist))
                    break

                case `spotify-this-song`:
                    inq.prompt([
                        {
                        type: 'input',
                        message: 'What song would you like to Spotify?',
                        name: 'song'
                        }
                    ])
                    .then(answers => spotifyThisSong(answers.song))
                    break

                case `movie-this`:
                    inq.prompt([
                        {
                        type: 'input',
                        message: 'What movie would you like to see?',
                        name: 'movie'
                        }
                    ])
                    .then(answers => movieThis(answers.movie))
                    break

                case `do-what-it-says`:
                    doWhatItSays()
                    break
            }
        })
}

function concertThis(artist){
    console.log('running concert-this...')
    request(`https://rest.bandsintown.com/artists/${artist.split(' ').join('+')}/events?app_id=codingbootcamp`, (e, r, body) => {
    if (e) { console.log(e) } else {
        const r = JSON.parse(body)[0]
        //console.log(JSON.parse(body))
        console.log(` `)
        console.log(`--------------------------------------`)
        console.log(`Venue Result for "${artist}"`)
        console.log(`--------------------------------------`)
        console.log(`Name of the venue: ${r.venue.name}`)
        console.log(`Venue location: ${r.venue.city}, ${r.venue.region}`)
        console.log(`Date of the Event: ${moment(r.datetime).format('MM/DD/YYYY')}`)
        console.log(`--------------------------------------`)
        console.log(` `)
    }
    })
}

function spotifyThisSong(song){
    console.log('running spotify-this-song')
    if(song){
        spotify.search({ type: 'track', query: song }, function(err, data) {
            if (err) {
                console.log('Error occurred: ' + err);
            }else{
                if(data.tracks.items[0]){
                    //console.log(data.tracks.items[0]) //whole response object

                    //get artists
                    let strArtists = 'Artist(s): '
                    for (const key in data.tracks.items[0].artists) {
                            strArtists += ' ' + data.tracks.items[0].artists[key].name
                            if(key != (data.tracks.items[0].artists.length-1)){
                                strArtists = strArtists + ',' 
                            }
                    }

                    //get url for either preview or spotify if available
                    let prevLink = 'Preview Link: '
                    if(data.tracks.items[0].preview_url){
                        prevLink += data.tracks.items[0].preview_url
                    }else{
                        prevLink = 'Preview Link (N/A): ' + data.tracks.items[0].external_urls.spotify
                    }

                    console.log(` `)
                    console.log(`--------------------------------------`)
                    console.log(`Spotify Track Result for "${song}"`)
                    console.log(`--------------------------------------`)
                    console.log(strArtists) //console log artist(s)
                    console.log('Song Name: ' + data.tracks.items[0].name) //console log name
                    console.log(prevLink) //console log preview url
                    console.log('Album: ' + data.tracks.items[0].album.name) //console log album name
                    console.log(`--------------------------------------`)
                    console.log(` `)
                }else{
                    console.log(` `)
                    console.log(`--------------------------------------`)
                    console.log(`NO Spotify Track Result for "${song}"`)
                    console.log(`--------------------------------------`)
                    console.log(` `)
                }
            }
        })
    }else{
        spotify.search({ type: 'track,artist', query: 'The Sign artist:Ace Of Base' }, function(err, data) {
            if (err) {
                console.log('Error occurred: ' + err);
            }else{
                // "hardcoding this"
                console.log(` `)
                console.log(`--------------------------------------`)
                console.log(`You did not enter a search query. Here is a Song by Ace of Base.`)
                console.log(`--------------------------------------`)
                console.log('Artist(s): ' + data.tracks.items[0].artists[0].name)
                console.log('Song Name: ' + data.tracks.items[0].name)
                console.log('Preview Link: ' + data.tracks.items[0].preview_url)
                console.log('Album: ' + data.tracks.items[0].album.name)
                console.log(`--------------------------------------`)
                console.log(` `)
            }
        })
    }
}

function movieThis(movieChoice){
    if (movieChoice) {
        console.log('running movie-this')
        request(`http://www.omdbapi.com/?t=${movieChoice.split(' ').join('+')}&apikey=trilogy`, (e, r, d) => {
            if (e) { console.log(e) } else {
                const movie = JSON.parse(d)
                //console.log(movie)
                if(movie[0]){
                    let rtRating = 'N/A'
                    for (const key in movie.Ratings) {
                        if (movie.Ratings[key].Source === 'Rotten Tomatoes') {
                            rtRating = movie.Ratings[key].Value
                        }
                    }
                    console.log(movie.Title)
                    console.log(`Year : ${movie.Year}`)
                    console.log(`imdb Rating : ${movie.imdbRating}`)
                    console.log(`Rotten Tomatoes Rating : ${rtRating}`)
                    console.log(`Country : ${movie.Country}`)
                    console.log(`Language : ${movie.Language}`)
                    console.log(`Plot : ${movie.Plot}`)
                    console.log(`Actors : ${movie.Actors}`)
                } else {
                    console.log(`we could not find any movie called '${movieChoice}'`)   
                }
            }
        })
    } else {
        console.log(`If you haven't watched "Mr. Nobody,"`)
        console.log(`then you should: <http://www.imdb.com/title/tt0485947/>`)
        console.log(' ')
        console.log(`It's on Netflix!`)
    }  
}

function doWhatItSays(){
    console.log('running do-what-it-says')
    fs.readFile("random.txt", "utf8", function(error, data) {

        // If the code experiences any errors it will log the error to the console.
        if (error) {
          return console.log(error)
        } else {
            var dataArr = data.split(",")
            switch(dataArr[0]){
                case `concert-this`:
                    concertThis(dataArr[1])
                    break
                case `spotify-this-song`:
                    spotifyThisSong(dataArr[1])
                    break

                case `movie-this`:
                    movieThis(dataArr[1])
                    break
            }
        }
    })
}


menu()