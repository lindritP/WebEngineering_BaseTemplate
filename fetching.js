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

export function fetchBearData() {
    var params = {
        action: "parse",
        page: title,
        prop: "wikitext",
        section: 3,
        format: "json",
        origin: "*"
      };

fetch(baseUrl + "?" + new URLSearchParams(params).toString())
        .then(function(res) { return res.json(); })
        .then(function(data) {
          console.log(data);
          extractBears(data.parse.wikitext['*']);
        });


    }

      function fetchImageUrl(fileName) {

        var imageParams = {
          action: "query",
          titles: "File:" + fileName,
          prop: "imageinfo",
          iiprop: "url",
          format: "json",
          origin: "*"
        };

        var url = baseUrl + "?" + new URLSearchParams(imageParams).toString();

        return fetch(url).then(function(res) {
          return res.json();
        }).then(function(data) {
          var pages = data.query.pages;
          var page = Object.values(pages)[0];
          console.log(page);
          if (!page.imageinfo) {
            return "media/placeholder-bear.png"; 
          }
          return page.imageinfo[0].url;
        });
      }

function extractBears(wikitext) {
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

        Promise.all(bearPromises).then(function(bears) {
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

      