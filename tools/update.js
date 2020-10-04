const axios = require('axios');
const fs = require('fs');

(async()=>{
  // see: https://www.mirko.jp/ogura/sparql.html
  const url = "https://sparql.linkedopendata.cf";
  const query = `
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX karuta: <https://github.com/tnanako/karutalod#>
PREFIX bibo: <http://bibliographic-ontology.org/bibo/>
PREFIX schema: <http://schema.org/>
PREFIX karuta: <https://github.com/tnanako/karutalod#>
SELECT distinct *
WHERE {
?s dc:identifier ?identifier;
rdfs:label ?label;
dc:contributor ?contributor;
dc:publisher ?publisher;
dc:date ?date;
bibo:owner ?owner;
dcterms:extent ?extent;
bibo:note ?note;
karuta:text ?karuta;
schema:image ?image;
rdfs:seeAlso ?seealso;
dcterms:isPartOf ?partof.
filter(LANG(?contributor) = 'ja' && LANG(?publisher) = 'ja'  && LANG(?date) = 'ja' && LANG(?owner) = 'ja' && LANG(?extent) = 'ja')
}`;
  try {
    let res = await axios.get(url+"?query="+encodeURIComponent(query),{
      headers: { "Accept": "application/json" },
      data: {}
    });
    fs.writeFileSync(__dirname + "/../src/assets/hyakunin-isshu.json", JSON.stringify(res.data));
    console.log("Completed updating quiz data.");
  } catch (e) {
    console.error("Failed updating quiz data.");
  }
})();