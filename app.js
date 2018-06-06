
var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');


var api_main = 'https://en.wikipedia.org/w/api.php?';
var action = '&action=parse&format=json';
var page="&page=Timeline_of_Indian_history";
var section='&section=16';
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
console.log(data);

//before saving the event strings, decode it of the html character....Convert HTML entities to HTML characters, e.g. &gt; converts to >.
//https://www.npmjs.com/package/unescape
console.log(decode(data[2][1]));


})

