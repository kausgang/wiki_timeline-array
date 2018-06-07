
var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var decode = require('unescape');
var decode = require('unescape');
var fs = require('fs');
var path = require('path');


var api_main = 'https://en.wikipedia.org/w/api.php?';
var action = '&action=parse&format=json';
var page="&page=Timeline_of_Indian_history";
var section='&section=37';

var DESTINATION_FOLDER = "india";  //CHANGE THIS FOR OTHER COUNTRY


// CHECK IF FOLDER EXISTS..IF NOT CREATE IT
fs.exists(DESTINATION_FOLDER, function (exists) {

    if (exists) {
        // console.log(exists)
    }
    else {
        console.log("creating folder");
        fs.mkdir(DESTINATION_FOLDER,function(err){

            if(err)
                console.log(err);
        })
    }

});

var fileSeparator = path.sep;
var filename = DESTINATION_FOLDER + fileSeparator ;


// var page="&page=Timeline_of_Spanish_history"

//    take the last 500 year history of the below countries
// india https://en.wikipedia.org/wiki/Timeline_of_Indian_history
// USA https://en.wikipedia.org/wiki/Timeline_of_United_States_history
// England https://en.wikipedia.org/wiki/Timeline_of_English_history
// china https://en.wikipedia.org/wiki/Timeline_of_Chinese_history
// cuba https://en.wikipedia.org/wiki/Timeline_of_Cuban_history
// France https://en.wikipedia.org/wiki/Timeline_of_French_history
// Gramany https://en.wikipedia.org/wiki/Timeline_of_German_history
// Italy https://en.wikipedia.org/wiki/Timeline_of_Italian_history
// japan https://en.wikipedia.org/wiki/Timeline_of_Japanese_history
// Mexico https://en.wikipedia.org/wiki/Timeline_of_Mexican_history
// Poland https://en.wikipedia.org/wiki/Timeline_of_Polish_history
// Russia https://en.wikipedia.org/wiki/Timeline_of_Russian_history
// Spain https://en.wikipedia.org/wiki/Timeline_of_Spanish_history
// Turkey https://en.wikipedia.org/wiki/Timeline_of_Turkish_history
 

var url = api_main+action+page+section;



request.get(url, function(err,resp_code,data) {
    
    // console.log(data);

    // var $ = cheerio.load(data);

    data = JSON.parse(data);

    //FIND sections of the page

/*     var number_of_sections = data.parse.sections.length;

 
//  every page has different sections at the end, for india, the last 3 sections are garbage data...for spain the last section is garbage
// 4 - 8 as last sections are external links,references and see also sections for the indian history timeline page

// var count = 0;
 for (let index = 4; index <= 8; index++) { 

    // console.log(data.parse.sections[number_of_sections - index])

    //save the section numbers
    var section_numbers ;
    section_numbers = data.parse.sections[number_of_sections - index].number;
    
//    form new url for section
    var section_url=url+'&section='+section_numbers;

    console.log(section_url);
   
 }
 */
 
 var content = data.parse.text;



 var $ = cheerio.load(content['*']);


 //remove all links
 $('a').each(function(){
    var link_html = $(this).html();
    $(this).replaceWith(link_html);
});

//  find table
var wikitable=$('.wikitable');

// console.log(wikitable.html());


// https://www.npmjs.com/package/cheerio-tableparser
//added the table tag as cheerioparser will accept only table tag

  var table1 = cheerio.load("<table id='event_table'>" + wikitable.html() + "</table>");

cheerioTableparser(table1);

var data = table1("#event_table").parsetable();

//display the table
// console.log(data);

//before saving the event strings, decode it of the html character....Convert HTML entities to HTML characters, e.g. &gt; converts to >.
//https://www.npmjs.com/package/unescape
// console.log(decode(data[2][1]));


create_json(data);


})




function create_json(data){
    
    var year,date,event = [];
    var country;
    
    year = data[0];
    //date = data[1]; //DISREGARDING DATE AS INCORPORATING IT WILL BE COMPLEX
    event = data[2];
    country = "india"; //CHANGE HERE FOR OTHER COUNTRY
    
    //create the initial object to hold data
    var obj = {
    year: "" ,
    //date: "",
    india: []     //ADD NEW COUNTRY AFTER THIS
    };
    

    
    
    // console.log(obj);
    
    
//    1st value was "year","date" & "event"..2nd object has already been used
    for (var i = 1; i < event.length; i++) {
        
        if(isNaN(parseInt(year[i]))){ // if the year column is null, that means there are more events in that year
            
            var static_year= year[i-1]; //save filename for overwriting purpose
            
            //add all the events from this year
            while(isNaN(parseInt(year[i]))){               
                //add next event 
                var event_details = decode(event[i]);
                obj.india.push(event_details); //CHANGE HERE FOR DIFFERNET COUNTRIES
                i++;
               
            }
           
           
           
//           INTRODUCE DELAY HERE SO THAT WHILE LOOP FINISHES FIRST AND THEN WRITE TO FILE
//https://stackoverflow.com/questions/14249506/how-can-i-wait-in-node-js-javascript-l-need-to-pause-for-a-period-of-time?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
            var waitTill = new Date(new Date().getTime() + 1 * 1000);
            while(waitTill > new Date()){}
            
            
            
           
            //adjust for the  missed count due to multiple event on previous year
           i--;
            
            //write the record in file and move on to the next year 
            //overwriting the this year's file will all the events
//            https://stackoverflow.com/questions/21976567/write-objects-into-file-with-node-js?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
            fs.writeFileSync(filename+static_year+'.json', JSON.stringify(obj, null, 2), function(err) {
                if(err) {
                    return console.log(err);
                }            
            }); 
            
        }
        else{ //this this the first event of the year
            
            //update the object
            obj.year = year[i];
            //obj.date = date[i];
           
           //empty the event array for the next year
            obj.india = [];     //CHANGE HERE FOR DIFFERNET COUNTRIES
            var event_details = decode(event[i]);
            obj.india.push(event_details);      //CHANGE HERE FOR DIFFERNET COUNTRIES     
           
           
           
           //write the record in file and move on to the next year
            //write the first record in file
//            https://stackoverflow.com/questions/21976567/write-objects-into-file-with-node-js?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

            fs.writeFileSync(filename+year[i]+'.json', JSON.stringify(obj, null, 2), function(err) {
                if(err) {
                    return console.log(err);
                }            
            }); 
         
           
        }
        

            
    }
    
    

    console.log("data writing complete");


}