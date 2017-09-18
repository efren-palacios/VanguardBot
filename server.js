const rp = require('request-promise')
let cards = []
const fs = require('fs')

function update (query = '') {
  const url = 'https://cardfight.wikia.com/api.php?action=query&generator=categorymembers&format=json&gcmlimit=500&gcmtitle=Category:Cards&prop=info&inprop=url&gcmcontinue='
  rp(url + query).then(r => {
    let data = JSON.parse(r)
    let c = data['query-continue']
    if (c === undefined) {
      fs.writeFile('cards.json', JSON.stringify(cards), 'utf8', function (err) {
        if (err) {
          return console.log(err)
        }
        return console.log('Cards Saved!')
      })
    } else {
      for (let [, {title, fullurl}] of Object.entries(data.query.pages)) {
        if (title.includes('Gallery') || title.includes('User_blog')) continue
        cards.push({ title, url: fullurl })
      }
      update(c.categorymembers.gcmcontinue)
    }
  })
}

update()
