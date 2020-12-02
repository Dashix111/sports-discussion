import { TEAMS } from "./teams.js";

export function extractLeague(url) {
  const url_paths = url.split("/");
  const league = Object.keys(TEAMS).find((league) =>
    url_paths.includes(league.toLocaleLowerCase())
  );

  return league;
}
/* Function that extracts team names based on given inputs
 * title: String. REQUIRED.     Title of the ESPN page
 * url: String. REQUIRED.       URL of the ESPN page
 * keywords: String. REQUIRED.  Keywords meta of the ESPN Page
 * content: String              Content of the ESPN page
 */
export function extractTeams(title, url, keywords = "", content = "") {
  // get leauge from URL
  const url_paths = url.split("/");
  const league = Object.keys(TEAMS).find((league) =>
    url_paths.includes(league.toLocaleLowerCase())
  );
  console.log("league: " + league);
  console.log("title: " + title);
  console.log("keywords: " + keywords);

  let all_teams = [];
  if (league) {
    all_teams = TEAMS[league];
  } else {
    Object.keys(TEAMS).forEach((league) => {
      all_teams.concat(TEAMS[league]);
    });
  }

  // extract team names from keywords
  let teams_from_keywords = [];
  if (keywords) {
    // keywords format: "kw1, kw2, kw3, kw4"
    const kw_list = keywords.split(",").map((kw) => {
      return kw.trim().toLocaleLowerCase();
    });

    teams_from_keywords = all_teams.filter((team) => {
      return kw_list.includes(team.fullname.toLocaleLowerCase());
    });
  }
  console.log("teams_from_keywords" + teams_from_keywords);

  // extract team names from title
  let teams_from_title = all_teams.filter((team) => {
    const names = [team.fullname, team.team];
    names.concat(team.other);

    return names.some((w) => title.includes(w));
  });
  console.log("teams_from_title" + teams_from_title);

  return [...new Set([...teams_from_keywords, ...teams_from_title])];
}
