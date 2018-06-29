
// all timelines
// https://en.wikipedia.org/wiki/Category:Timelines_by_country

//    take the last 500 year history of the below countries
// india https://en.wikipedia.org/wiki/Timeline_of_Indian_history
// USA https://en.wikipedia.org/wiki/Timeline_of_United_States_history

var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var decode = require('unescape');
var fs = require('fs');
var path = require('path');

var api_main = 'https://en.wikipedia.org/w/api.php?';
var action = '&action=parse&format=json';

// ############################## CHANGE THIS ###############################################################
var page="&page=Timeline_of_Indian_history";                              

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

        // CORRECT THE INPUT DATA , FILTER AND VALIDATE THE CORRECT YEAR AND WRITE TO FILE
        correct_data(data,i)   
    });    
})


function correct_data(data,i){

    // #######################################################################################################
    // # THESE BELOW  LINES OF CODE WAS INCLUDED FOR COUNTRIES FOR WHICH DATA NEEDS MODIFICATION             #  
    // # BASED ON THE OBSERVATION AFTER RUNNING WITH MULTIPLE TIMELINE PAGES , BELOW IF CLAUSES WERE WRITTEN #
    // #######################################################################################################  
    // MALAYSIA - ALL SECTIONS FOR MALAYSIA IS NOT IN STANDARD FORMAT
    if(page=='&page=Timeline_of_Malaysian_history'){
        if(i==0 || i==1 || i==2 || i==3 || i==4 || i==5 || i==6 || i==7)
            return 0;
    }

    var year_data = data[0];
    var event_data = data[2];

     // CHECK IF DATA FORMAT IS CORRECT
     if(data[0][0]!=='Year'){
        // #######################################################################################################
        // # THESE BELOW 2 LINES OF CODE (CONSOLE.LOG) WAS USED TO FIND WHICH DATA NEEDS MODIFICATION            #  
        // # BASED ON THE OBSERVATION AFTER RUNNING WITH MULTIPLE TIMELINE PAGES , BELOW IF CLAUSES WERE WRITTEN #
        // #######################################################################################################  
        console.log("Returning page => "+page+" section => "+i);
        console.log("year array => "+data[0])
        // ###############################################################################################
        // USA
        if(page=='&page=Timeline_of_United_States_history' && i==9){
            year_data=["Year"];
            for(var i=0;i<data[0].length;i++)
                year_data.push(data[0][i])
            console.log('NEW ARRAY => '+year_data)
            // PUSH AN ELEMENT AT THE BEGINNING OF THE ARRAY
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift
            event_data.unshift("Event");
            filter(year_data,event_data);
        }
        // INDIA
        if(page=='&page=Timeline_of_Indian_history' && i==9){
            year_data=["Year"];
            for(var i=0;i<data[0].length;i++)
                year_data.push(data[0][i])
            console.log('NEW ARRAY => '+year_data)
            event_data.unshift("Event");
            filter(year_data,event_data);
        }
        // CHINA
        if(page=='&page=Timeline_of_Chinese_history' && i==45){
            year_data.unshift("Year");
            console.log('NEW ARRAY => '+year_data)
            event_data.unshift("Event");
            filter(year_data,event_data);
        }
        // CUBA
        if(page=='&page=Timeline_of_Cuban_history' && i==6){            
            year_data.unshift("Year");
            console.log('NEW ARRAY => '+year_data)
            event_data.unshift("Event");
            filter(year_data,event_data);
        }
        // PHILIPPINE
        if(page=='&page=Timeline_of_Philippine_history'){
            if(i==2 || i==3){
                year_data.shift();
                year_data.unshift("Year");
                console.log('NEW ARRAY => '+year_data)
                event_data.unshift("Event");
                filter(year_data,event_data);
            }  
        }
        // RUSSIA
        if(page=='&page=Timeline_of_Russian_history' && i==13){
            year_data.unshift("Year");
            year_data[1]='1918';
            console.log('NEW ARRAY => '+year_data)
            event_data.unshift("Event");
            filter(year_data,event_data);
        }
        // ###############################################################################################    
        else
            return 0;
    }
    else
        filter(year_data,event_data);    
}



function filter(year_data,event_data){

    var year = [],
        event = [];

    for(var i=0;i<year_data.length;i++){
        var element = year_data[i];
        var obj = validate(element);
     
        if(obj.valid){
            // console.log(obj.year)
            year.push(obj.year);
            event.push(event_data[i]);
            j=i+1;
            if(year_data[j] == ''){
                while(year_data[j]==''){
                    year.push(year_data[j]);
                    event.push(event_data[j]);
                    j++;
                }
            }
            // console.log('calling writefile with '+year)
            write_file(year,event);
            year=[];event=[];
        }    
    }    
}


function validate(element){

    // THIS IS FOR TIMELINE CHINESE HISTORY
    // ,1970,,13 September,25 October,1972
    if(typeof element == 'undefined'){
        var obj = {}
        obj.year = element;
        obj.valid = false;
        return obj;
    }

    var element1 = element;
    // console.log('validating '+element)
    // ONLY OPERATE FOR "X" TO "XXXX BCE"
    if(element.length >=1 && element.length <=8){

        // CHECK IF ENDS WITH BC,BCE,CE,AD 
        // BC
        var last = element.substring(element.length - 2,element.length) 
        if(last == 'BC')
            element = '-'+element.substring(0,element.length - 2).trim(); //REMOVE THE TRAILING WHITESPACE
        // CE
        if(last == 'CE')
            element = element.substring(0,element.length - 2).trim(); //REMOVE THE TRAILING WHITESPACE
        // AD
        if(last == 'AD')
            element = element.substring(0,element.length - 2).trim(); //REMOVE THE TRAILING WHITESPACE

        // BCE
        var last = element1.substring(element1.length - 3,element1.length) 
        if(last == 'BCE'){
            element = '-'+element1.substring(0,element1.length - 3).trim(); //REMOVE THE TRAILING WHITESPACE
        }
            
        // CHECK IF ELEMENT CAN BE CONVERTED TO A NUMBER
        if(!isNaN(parseInt(element))){
            var obj = {}
            obj.year = element;
            obj.valid = true;
            return obj;
        }            
    }
    var obj = {}
    obj.year = element;
    obj.valid = false;
    return obj;
}


function write_file(year,event){

    var filename = path.join(DESTINATION_FOLDER,year[0])+'.json'
    var obj = {};
    obj.year = year[0];
    obj[DESTINATION_FOLDER]=event;

    fs.writeFileSync(filename,JSON.stringify(obj,null,2));
    console.log("data writing complete "+DESTINATION_FOLDER+"- in "+year[0]);

}



