const express = require('express');
const app = express();
const exec = require('child_process').exec;
const matchesArgs = `-X POST -H "Content-Type: application/json" --data '{"query":"query ShmeHomeSiteMatchQuery($slug: String = null) { site(slug: $slug) { slug name tours { id name } matches(page: 0, statuses: [NOT_STARTED, UP_COMING]) { edges { id name startTime status matchHighlight { text color } squads { id name shortName squadColorPalette flag { src type } flagWithName { src type } } tour { id name slug } } } }}","variables":{"slug":"cricket"}}' https://www.dream11.com/graphql/query/pwa/shme-home-site-match-query`;
const matchArgs = ``;

app.set('json spaces', 2);

async function getMatches() {
  return new Promise(function (resolve, reject) {
    exec('curl ' + matchesArgs, function (error, stdout, stderr) {
      if (error) {
        reject(error)
      }
      const json = JSON.parse(stdout)

      resolve(json.data.site.matches.edges.map(match => {
        return {
          name: match.name,
          startTime: match.startTime,
          matchId: match.id,
          tourId: match.tour.id
        }
      }))
    })
  })
}

async function getMatch(tourId, matchId) {
  const matchesArgs = `-X POST -H "Content-Type: application/json" --data '{"query":"query ShmeCreateTeamQuery( $site: String! $tourId: Int! $teamId: Int = -1 $matchId: Int!) { site(slug: $site) { name showTeamCombination { count siteKey } teamPreviewArtwork { src } teamCriteria { totalCredits maxPlayerPerSquad totalPlayerCount } roles { id artwork { src } color name pointMultiplier shortName } playerTypes { id name minPerTeam maxPerTeam shortName artwork { src } } tour(id: $tourId) { match(id: $matchId) { id guru squads { flag { src } flagWithName { src } id jerseyColor name shortName } startTime status players(teamId: $teamId) { artwork { src } squad { id name jerseyColor shortName } credits id name points type { id maxPerTeam minPerTeam name shortName } lineupStatus { status text color } isSelected role { id artwork { src } color name pointMultiplier shortName } } tour { id } } } } me { isGuestUser showOnboarding }}","variables":{"tourId":${tourId},"matchId":${matchId},"teamId":null,"site":"cricket"}}' https://www.dream11.com/graphql/query/pwa/shme-home-site-match-query`;
  return new Promise(function (resolve, reject) {
    exec('curl ' + matchesArgs, function (error, stdout, stderr) {
      if (error) {
        reject(error)
      }
      const json = JSON.parse(stdout)

      resolve({
        tourId,
        matchId,
        startTime: json.data.site.tour.match.startTime,
        status: json.data.site.tour.match.status,
        players: json.data.site.tour.match.players.map(player => {
          return {
            team: player.squad.name,
            name: player.name,
            status: player.lineupStatus
          }
        })
      });
    })
  })
}

app.get('/matches', async (req, res) => {
  res.send(await getMatches())
})

app.get('/match/:tourId/:matchId', async (req, res) => {
  const { tourId, matchId } = req.params


  let match;
  try {
    match = await getMatch(tourId, matchId);
  } catch (e) {

  }
  res.send(match)
})

app.listen(4000, () => {
  console.log('listening on 4000')
})