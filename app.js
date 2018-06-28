
// all timelines
// https://en.wikipedia.org/wiki/Category:Timelines_by_country

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
// Afgan https://en.wikipedia.org/wiki/Timeline_of_Afghan_history
 

var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var decode = require('unescape');
var decode = require('unescape');
var fs = require('fs');
var path = require('path');

var api_main = 'https://en.wikipedia.org/w/api.php?';
var action = '&action=parse&format=json';

// ############################## CHANGE THIS ###############################################################
var page="&page=Timeline_of_Indian_history";     
// var section='&section=8';                             
//to know the section number, paste this in filefox and find the section  
// https://en.wikipedia.org/w/api.php?&action=parse&format=json&page=Timeline_of_United_States_history
// ###########################################################################################################

// var page="&page=Timeline_of_Italian_history";
// var section='&section=26'; //3 records - not working as last one contains more than one entry
// var section='&section=28'; //150 records - works as last one has one record

// ############################## CHANGE THIS ###########################
var DESTINATION_FOLDER = "India";  //CHANGE THIS FOR OTHER COUNTRY
// ######################################################################

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

var url = api_main+action+page;

console.log(url);

request.get(url, function(err,resp_code,data) {

    if(err) throw err;

    data = JSON.parse(data);
    var content = data.parse.text;

    var $ = cheerio.load(content['*']);

    //remove any span tag (this is important in year collumn , otherwise proper file will not be created)
    $('span').remove();

    //remove all links
    $('a').each(function(){
        var link_html = $(this).html();
        $(this).replaceWith(link_html);
    });

    //remove subscript
    $('sup').remove();


    //  find table
    // var wikitable=$('.wikitable');
    // https://stackoverflow.com/questions/27430267/cheeriojs-looping-through-ul-with-same-class-name
    $('.wikitable').each(function(i,element){
        var table1 = cheerio.load("<table id='event_table'>" + $(element).html() + "</table>");
        cheerioTableparser(table1);
        var data = table1("#event_table").parsetable();
        create_json(data);
        

    });
    

})


function create_json(data){
    
    var event = [];
    var year = [];    

    //remove whitespaces from year...example USA timeline 1901,1902-1919
    // so that year can be converted to a integer
    for(i=0;i<data[0].length;i++){
  
        // ONLY CONSIDER THE YEAR WHICH ARE OF THE BELOW FORMAT
        // YYYY        (LENGTH=4)
        // YYYY BC     (LENGTH=7)
        // YYYY BCE    (LENGTH=8) //HIGHEST LENGTH 
        if(data[0][i].length <= 8){

            var year_suffix_bc = data[0][i].substring(data[0][i].length-2,data[0][i].length);
            var year_suffic_bce = data[0][i].substring(data[0][i].length-3,data[0][i].length)
            // YYYY BC
            if(year_suffix_bc == 'BC' || year_suffix_bc == 'bc' ){
                var year_value = data[0][i].trim().substring(0,data[0][i].length - 2);
                year.push('-'+year_value)
            }
            else if(year_suffic_bce == 'BCE' || year_suffic_bce == 'bce'){
                var year_value = data[0][i].trim().substring(0,data[0][i].length - 3);
                year.push('-'+year_value)
            }
            else
                year.push(data[0][i].trim());


            event.push(data[2][i]);
        }        
    }

    // IF THERE IS NO VALID YEAR, DISREGARD THAT SECTION
    // EXAMPLE IS "REFERENCE" ANS "SEE ALSO" SECTION OF WIKIPEDIA PAGE
    if(year.length == 0)
        return 0;

    // loop it untill the last year.length.there is different treatment for last row
    var i = year.length;
    var last_year;

    if(isNaN(parseInt(year[i - 1]))){
        while(isNaN(parseInt(year[i - 1]))){
            last_year = i;
            i--;       
        }
        //set it to the last year
        last_year=last_year - 2;
    }
    else
        last_year = event.length;
 
    
    //date = data[1]; //DISREGARDING DATE AS INCORPORATING IT WILL BE COMPLEX
    
// ############################## CHANGE THIS ###########################
    country = "India"; //CHANGE HERE FOR OTHER COUNTRY
// ######################################################################
    
    //create the initial object to hold data
    var obj = {
    year: "" ,
    
// ############################## CHANGE THIS ###########################
    India: [] //CHANGE HERE FOR OTHER COUNTRIES
// ######################################################################
    
    };

    
//    1st value was "year" & "event"..
    for (var i = 1; i < last_year; i++) {
        
        if(isNaN(parseInt(year[i]))){ // if the year column is null, that means there are more events in that year
            
            var static_year= year[i-1]; //save filename for overwriting purpose
            
            //add all the events from this year
            while(isNaN(parseInt(year[i]))){               
                //add next event 
                var event_details = decode(event[i]);

            // ############################## CHANGE THIS ###########################
                obj.India.push(event_details); //CHANGE HERE FOR DIFFERNET COUNTRIES
            // #######################################################################
                i++;
               
            }
                                   
            //adjust for the  missed count due to multiple event on previous year
           i--;
            
            //write the record in file and move on to the next year 
            //overwriting the this year's file will all the events
            //https://stackoverflow.com/questions/21976567/write-objects-into-file-with-node-js?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
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
        // ############################## CHANGE THIS ###########################
            obj.India = [];     //CHANGE HERE FOR DIFFERNET COUNTRIES
        // ############################## CHANGE THIS ###########################
        
            var event_details = decode(event[i]);

        // ############################## CHANGE THIS ###########################    
            obj.India.push(event_details);      //CHANGE HERE FOR DIFFERNET COUNTRIES     
        // ######################################################################
                                
            //write the record in file and move on to the next year
            //write the first record in file
            //https://stackoverflow.com/questions/21976567/write-objects-into-file-with-node-js?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
            fs.writeFileSync(filename+year[i]+'.json', JSON.stringify(obj, null, 2), function(err) {
                if(err) {
                    return console.log(err);
                }            
            });                        
        }                 
    }
    

    // take care of the last year
    //if last_year has single row then this part will not be executed
    // console.log(year[last_year]);

    if(typeof year[last_year] !== 'undefined'){ 
        obj.year = year[last_year];

    // ############################## CHANGE THIS ###########################
        obj.India = [];
    // ######################################################################

        for (i=last_year;i<event.length;i++){
   
                var event_details = decode(event[i]);

            // ############################## CHANGE THIS ###########################
                obj.India.push(event_details);      //CHANGE HERE FOR DIFFERNET COUNTRIES     
            // ######################################################################   
        }

        //write the record in file 
        //https://stackoverflow.com/questions/21976567/write-objects-into-file-with-node-js?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa      
            fs.writeFileSync(filename+year[last_year]+'.json', JSON.stringify(obj, null, 2), function(err) {
                if(err) {
                    return console.log(err);
                }            
            }); 
    }
    

    console.log("data writing complete - year = ");


}