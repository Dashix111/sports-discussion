export async function getChannelPreview(reddit_url, num_posts=2) {
    const reddit_api = "https://" + reddit_url + "/top.json?count=20";

    const response = await fetch(reddit_api)
    .then((response) => {
        if(!response.ok) {
            throw Error(response.statusText);
        }
        return response.json();
    })
    .catch(error => console.log(error));

    return response.data.children.slice(0, num_posts).map(post_json => {
        return {
            title : post_json.data.title,
            ups : post_json.data.ups,
            url : post_json.data.permalink
        };
    });
}