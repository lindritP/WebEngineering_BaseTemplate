import type Bear from './types.js';
import { isObject } from './helper.js';


// Fetching bear data 
      var baseUrl = "https://en.wikipedia.org/w/api.php";
      var title = "List_of_ursids";

export async function fetchBearData() {
    var params = {
        action: "parse",
        page: title,
        prop: "wikitext",
        section: "3",
        format: "json",
        origin: "*"
      };

      var wikiBearUrl = baseUrl + "?" + new URLSearchParams(params).toString();
      
      try {
        var res = await fetch(wikiBearUrl);
        if (!res.ok) {
          throw new Error('Wikipedia antwortet mit Status ' + res.status);
        }
        var data : unknown = await res.json();


        // Wenn data ein error ist, dann enthält es error drinnen
        if(
          isObject(data) && 
          isObject(data.error) && 
          typeof data.error.info === "string")
          {
              throw new Error(data.error.info);
          }

          // wenn data dann die richtige antwort gibt erwarten wir dass data da ist und data.parse und data.parse.wikitext und data.parse.wikitext["*"] ein string ist 
        if(
          isObject(data) &&
          isObject(data.parse) &&
          isObject(data.parse.wikitext) &&
          typeof data.parse.wikitext['*'] === "string"
        ){
          await extractBears(data.parse.wikitext['*']);
          return
        }

        throw new Error('Unerwartetes Antwortformat von Wikipedia');
         
      }catch (error) {
        console.error('Fehler beim Abrufen der Bäreninformationen:', error);
        var errorParagraph = document.createElement('p');
        errorParagraph.textContent = 'Fehler beim Abrufen der Bäreninformationen. Bitte versuchen Sie es später erneut.';

        const moreBearsTitle = document.querySelector('.more_bears');
        if (moreBearsTitle) {
          moreBearsTitle.appendChild(errorParagraph);
        }
      }
      
    
    }

async function fetchImageUrl(fileName: string): Promise<string> {

        var imageParams = {
          action: "query",
          titles: "File:" + fileName,
          prop: "imageinfo",
          iiprop: "url",
          format: "json",
          origin: "*"
        };

        var wikiBearImageUrl = baseUrl + "?" + new URLSearchParams(imageParams).toString();

        var placeholderImageUrl = "media/placeholder-bear.png"; // Placeholder image URL

        try{
          var res = await fetch(wikiBearImageUrl);
          if (!res.ok) {
            throw new Error('Wikipedia antwortet mit Status ' + res.status);
          }
          var data: unknown = await res.json();

          if(
          isObject(data) && 
          isObject(data.error) && 
          typeof data.error.info === "string")
          {
              throw new Error(data.error.info);
          }

          if(
            isObject(data) &&
            isObject(data.query) &&
            isObject(data.query.pages)
          ){
            var pages = data.query.pages;
            var page = Object.values(pages)[0];

              if (
                isObject(page) &&
                Array.isArray(page.imageinfo) &&
                page.imageinfo.length > 0 &&
                typeof page.imageinfo[0].url === 'string'
            ) {
              return page.imageinfo[0].url;   // alles geprüft → echte URL
            }
          }
        
          return placeholderImageUrl;   

          
        } catch (error) {
          console.error('Fehler beim Abrufen der Bärenbild-URL:', error);
          return placeholderImageUrl;
        }

        
      }

async function extractBears(wikitext: string) { 
        var speciesTables = wikitext.split('{{Species table/end}}');
        var bearPromises: Promise<Bear>[] = [];

        speciesTables.forEach(function(table) {
          var rows = table.split('{{Species table/row');
          rows.forEach(function(row) {
            var nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
            var binomialMatch = row.match(/\|binomial=(.*?)\n/);
            var imageMatch = row.match(/\|image=(.*?)\n/);
            var rangeMatch = row.match(/\|range=([^|\n]*)/);


            const name = nameMatch?.[1]
            const binomial = binomialMatch?.[1]
            const image = imageMatch?.[1]


            if (name  && binomial && image) {
              var fileName = image.trim().replace('File:', '');
              
              var bearPromise = fetchImageUrl(fileName).then(function(imageUrl) {
                var bear: Bear = {
                  name: name,
                  binomial: binomial,
                  image: imageUrl,
                  range: rangeMatch?.[1]?.trim() ?? "no range info"
                };
                return bear;
              });
              bearPromises.push(bearPromise);
            }
          });
        });
        
       var bears = await Promise.all(bearPromises);
       const moreBears = document.querySelector('.more_bears');
       if (!moreBears) {
        console.error('Container .more_bears not found');
        return bears;
      }

       bears.forEach(function(bear) {
        var html = '<div class="bear">' +
                      '<img src="' + bear.image + '" alt="Image of ' + bear.name + '" style="width:200px; height:auto;">' +
                      '<p><b>' + bear.name + '</b> (' + bear.binomial + ')</p>' +
                      '<p>Range: ' + bear.range + '</p>' +
                      '</div>';
                    moreBears.innerHTML += html;
       });
       return bears;
      }

      