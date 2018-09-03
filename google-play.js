var store = require('google-play-scraper');
var Cache = require('sync-disk-cache');
var cache = new Cache('my-cache');

var fs = require('fs');

async function doSearchAndExportData(term, filename){
    var results = await getAllForTerm(term, false);

    const json2csv = require('json2csv').parse;
    const fields = ['id', 'title', 'url', 'developer', 'score', 'reviews', 'currentVersionScore', 'currentVersionReviews', 'released', 'version', 'price', 'genres', 'hasInAppPurchases', 'description', 'supportedDevices'];
    const opts = {
        fields: fields,
        flatten: true
    };

    try {
        const csv = json2csv(results, opts);
        //console.log(results);
        console.log("Saving to file: " + filename);

        fs.writeFile(filename, csv, function(){});
        //console.log(csv);
    } catch (err) {
        console.error(err);
    }

    //console.log(results);
}

async function getAllForTerm(term, resume){
    var data = [];
    var page = 1;
    if(resume && cache.has("searchResults")){
        data = cache.get("searchResults").value;
    }

    if(resume && cache.has("currentPage")){
        page = parseInt(cache.get("currentPage").value) + 1;
    }

    //If we are on the first page...  And we have data, we probably didn't leve off anywhere...
    if(page == 1 && data.length > 0){
        return data;
    }

    do {
        console.log("Getting page: " + page);
        var results = await store.search({
            term: term,
            num: 100,
            page: page,
            country: 'us',
            lang: 'lang'
        });


        for (var i in results) {
            //results[i]['genres'] = results[i]['genres'].join(",");
            //results[i]['supportedDevices'] = results[i]['supportedDevices'].join(",");
        }
        //console.log(results);
        data = data.concat(results);
        cache.set("searchResults", data);
        cache.set("currentPage", page);
        console.log("Got page: " + page + " - got " + results.length + " results for a total of " + data.length + " apps.");

        page++;
    } while (results.length > 0)

    cache.remove("currentPage");


    // var request = require('sync-request');


    // for(var i in data){
    //     console.log("Getting Url: " + data[i].url);
    //     var res = request('GET', data[i].url, {cache: 'file'});
    //     var html = res.getBody().toString();
    //     if(html.indexOf(data[i].id) == -1){
    //         throw new Exception("Error while getting page: " + data[i].url);
    //     }
    //     //data[i].hasInAppPurchases = (html.indexOf('<li class="inline-list__item inline-list__item--bulleted">Offers In-App Purchases</li>') > -1);
    //     //console.log(html);
    // }
    return data;
}

doSearchAndExportData("Pregnancy", "google-play-results.csv");



