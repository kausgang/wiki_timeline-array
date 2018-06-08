# wiki_timeline-array
Convert wikipedia timeline data (html) to array (JSON) and save as <year>.json file.

## Setup instruction
>1.	Install node
>2.	Download and extract zip
>3.	Open cmd and navigate to the extracted folder
>4.	Run command
>>a.	npm install
>5.	Once all packages are installed, run this command
>>a.	Node app.js


## Test Run
----------
Data = https://en.wikipedia.org/wiki/Timeline_of_Indian_history#4th_century_BCE

```
C:\Users\typgang\Downloads\wiki_timeline-array-master\wiki_timeline-array-master>node app.js
[ [ 'Year',
    '400 BCE',
    '350 BCE',
    '333 BCE',
    '326 BCE',
    '',
    '321 BCE',
    '305 BCE',
    '304 BCE' ],
  [ 'Date', '', '', '', '', '', '', '', '' ],
  [ 'Event',
    'Siddharta Gautama &apos;Buddha&apos; of the Shakya polity in S. Nepal, founds Buddhism (older date: 563&#x2013;483 BCE)',
    'Panini, a resident of Gandhara, describes the grammar and morphology of Sanskrit in the text Ashtadhyayi. Panini&apos;s standardized Sanskrit is known as Classical Sanskrit.',
    'Persian rule in the northwest ends after Darius III is defeated by Alexander the Great, who establishes the Macedonian Empire after inheriting the Persian Achaemenid Empire.',
    'Ambhi king of Takshila surrenders to Alexander.',
    'Porus who ruled parts of the Punjab, fought Alexander at the Battle of the Hydaspes River.',
    'Mauryan Empire is founded by Chandragupta Maurya in Magadha after he defeats the Nanda dynasty and Macedonian Seleucid Empire. Mauryan capital city is Pataliputra (Modern Patna in Bihar)',
    'Chandragupta Maurya defeats Seleucus Nicator of the Seleucid Empire.',
    'Seleucus gives up his territories in the subcontinent (Afghanistan/Baluchistan) to Chandragupta in exchange for 500 elephants. Seleucus offers his daughter in marriage to Chandragupta to seal the
ir friendship.' ] ]

C:\Users\typgang\Downloads\wiki_timeline-array-master\wiki_timeline-array-master>
```

### To add new timeline from https://en.wikipedia.org/wiki/Category:Timelines_by_country , open app.js and change the following

>1. URL
>2. Replace all the country name present in the source code with the new country name
>3. section number (get section number from https://en.wikipedia.org/w/api.php?&action=parse&format=json&page=Timeline_of_Indian_history (change country name in the page )
>>a. Keep changing this number to get all the different sections

## Spin-off project
collaborate different country's year into one single timeline 
https://github.com/kausgang/collaborate_wiki_timeline

