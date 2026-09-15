// Fetching bear data 
      var baseUrl = "https://en.wikipedia.org/w/api.php";
      var title = "List_of_ursids";

      var params = {
        action: "parse",
        page: title,
        prop: "wikitext",
        section: 3,
        format: "json",
        origin: "*"
      };

export async function fetchBearData() {
    var params = {
        action: "parse",
        page: title,
        prop: "wikitext",
        section: 3,
        format: "json",
        origin: "*"
      };

      var wikiBearUrl = baseUrl + "?" + new URLSearchParams(params).toString();
      try {
        var res = await fetch(wikiBearUrl);
        if (!res.ok) {
          throw new Error('Wikipedia antwortet mit Status ' + res.status);
        }
        var data = await res.json();
        if (data.error) {
          throw new Error(data.error.info);
        }
         await extractBears(data.parse.wikitext['*']);
      }catch (error) {
        console.error('Fehler beim Abrufen der Bäreninformationen:', error);
        var errorParagraph = document.createElement('p');
        errorParagraph.textContent = 'Fehler beim Abrufen der Bäreninformationen. Bitte versuchen Sie es später erneut.';
        var moreBearsTitle = document.querySelector('.more_bears');
        moreBearsTitle.appendChild(errorParagraph);
      }
      
    
    }

async function fetchImageUrl(fileName) {

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
          var data = await res.json();
          if (data.error) {
            throw new Error(data.error.info);
          }
          var pages = data.query.pages;
          var page = Object.values(pages)[0];
          if (!page.imageinfo){
            return placeholderImageUrl; // Return placeholder if imageinfo is not available
          }
          return page.imageinfo[0].url;
        } catch (error) {
          console.error('Fehler beim Abrufen der Bärenbild-URL:', error);
          return placeholderImageUrl;
        }

        
      }

async function extractBears(wikitext) { 
        var speciesTables = wikitext.split('{{Species table/end}}');
        var bearPromises = [];

        speciesTables.forEach(function(table) {
          var rows = table.split('{{Species table/row');
          rows.forEach(function(row) {
            var nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
            var binomialMatch = row.match(/\|binomial=(.*?)\n/);
            var imageMatch = row.match(/\|image=(.*?)\n/);
            var rangeMatch = row.match(/\|range=([^|\n]*)/);

            if (nameMatch && binomialMatch && imageMatch) {
              var fileName = imageMatch[1].trim().replace('File:', '');
              
              var bearPromise = fetchImageUrl(fileName).then(function(imageUrl) {
                var bear = {
                  name: nameMatch[1],
                  binomial: binomialMatch[1],
                  image: imageUrl,
                  range: rangeMatch ? rangeMatch[1].trim() : "no range info"
                };
                return bear;
              });
              bearPromises.push(bearPromise);

            }
          });
        });

       return Promise.all(bearPromises).then(function(bears) {
                var moreBears = document.querySelector('.more_bears');
              
                  bears.forEach(function(bear) {
                    var html = '<div class="bear">' +
                      '<img src="' + bear.image + '" alt="Image of ' + bear.name + '" style="width:200px; height:auto;">' +
                      '<p><b>' + bear.name + '</b> (' + bear.binomial + ')</p>' +
                      '<p>Range: ' + bear.range + '</p>' +
                      '</div>';
                    moreBears.innerHTML += html;

                  });
                
              });
      }

      