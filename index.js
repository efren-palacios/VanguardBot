const Discord = require('discord.js')
const client = new Discord.Client()
const Xray = require('x-ray')
const x = Xray()
const he = require('he')
const _ = require('lodash')
const database = require('./cards.json')
const config = require('./config.json')
const didyoumean = require('didyoumean')
didyoumean.threshold = null
const fuzzy = require('fuzzy')

const WORLD = {
  'United Sanctuary': 0xffa00a,
  'Dragon Empire': 0x8b0000,
  'Star Gate': 0x696969,
  'Dark Zone': 0x4b0082,
  Magallanica: 0x0c0c9e,
  Zoo: 0x00853e,
  None: 0x000000
}

/* function isAvailable (author) {
  const lowerBound = new Date(new Date().getTime() - duration * 1000)
  previousUses = previousUses.filter(use => use.date > lowerBound)
  if (previousUses.filter(use => use.author === author).length >= usages) {
    return false
  } else {
    previousUses.push({ author, date: new Date() })
    return true
  }
} */

client.on('ready', () => {
  console.log('I am ready!')
})

client.on('message', message => {
  if (message.content.includes('{') && message.content.includes('}')) {
    const regex = /\{(.*?)\}/g
    let str = message.content.match(regex)
    let fullart = false
    let alt = false
    if (message.content.includes('[art]') && !message.content.includes('[alt]')) fullart = true
    if (message.content.includes('[alt]') && !message.content.includes('[art]')) alt = true
    str.forEach(i => {
      let s = i.replace(/[{}]+/g, '')
      let trim = s.trim()
      if (!trim.length > 0) return
      const url = fuzzy.filter(trim, database, { extract: el => el.title })[0].original.url
      x(url,
        {
          image: '.image-thumbnail@href',
          effect: '.cftable .info-extra .effect tr:nth-of-type(2) td',
          alt: '.Japanese a@href',
          flavor: '.flavor td@html',
          label: ['.cftable .info-main table td:nth-of-type(1)'],
          des: ['.cftable .info-main table td:nth-of-type(2)']
        }
      )(function (err, obj) {
        if (obj.label.length === 0) {
          return message.channel.send("Sorry I couldn't find the card >.<")
        }
        if (err) {
          console.log(err)
          return message.channel.send("Sorry I couldn't find the card >.<")
        }
        let info = {}
        let filter = [
          'Name',
          'Card Type',
          'Grade / Skill',
          'Critical',
          'Power',
          'Shield',
          'Nation',
          'Clan',
          'Race'
        ]
        for (let i = 0; i < obj.label.length; i++) {
          const label = obj.label[i].trim()
          if (filter.includes(label)) {
            info[label] = obj.des[i].trim()
          }
        }

        if (alt) {
          if (!obj.alt) return message.channel.send("Sorry I couldn't find the card >.<")
          let embed = new Discord.RichEmbed()
          embed.setImage(obj.alt)
          embed.setColor(WORLD[info['Nation']])
          embed.setTitle(info['Name'])
          return message.channel.send({embed})
        }
        if (fullart) {
          if (!obj.image) return message.channel.send("Sorry I couldn't find the card >.<")
          let embed = new Discord.RichEmbed()
          embed.setImage(obj.image)
          embed.setColor(WORLD[info['Nation']])
          embed.setTitle(info['Name'])
          return message.channel.send({embed})
        }

        let embed = new Discord.RichEmbed()
        let flavor = obj.flavor.split('<br>')
        embed.setThumbnail(obj.image)
        embed.setColor(WORLD[info['Nation']])
        for (var item in info) {
          embed.addField(item, info[item], true)
        }
        embed.addField(
          'Card Effect',
          _.escapeRegExp(obj.effect) || 'No Card Effect'
        )
        embed.setDescription(
          he.decode(flavor[flavor.length - 1].replace(/<[^>]*>/g, ''))
)
        return message.channel.send({ embed })
      })
    })
  }
})
client.login(config.token)
