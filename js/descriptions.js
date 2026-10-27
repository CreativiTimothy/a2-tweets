let writtenTweets = [];

// Add the two bonus columns without changing the starter table markup.
function addSentimentHeadings() {
    const headerRow = document.querySelector("table thead tr");
    if (!headerRow || document.getElementById("sentimentHeading")) return;

    const sentimentHeading = document.createElement("th");
    sentimentHeading.id = "sentimentHeading";
    sentimentHeading.scope = "col";
    sentimentHeading.textContent = "Sentiment";

    const scoreHeading = document.createElement("th");
    scoreHeading.scope = "col";
    scoreHeading.textContent = "Score";
    headerRow.appendChild(sentimentHeading);
    headerRow.appendChild(scoreHeading);
}

function updateSearchResults() {
    const searchText = document.getElementById("textFilter").value.trim();
    const normalizedSearchText = searchText.toLowerCase();
    let matchingTweets = [];

    // The rubric requires an empty table when the search box is empty.
    if (normalizedSearchText !== "") {
        matchingTweets = writtenTweets.filter(function (tweet) {
            return tweet.writtenText.toLowerCase().includes(normalizedSearchText);
        });
    }

    document.getElementById("searchCount").textContent = String(matchingTweets.length);
    document.getElementById("searchText").textContent = searchText;
    document.getElementById("tweetTable").innerHTML = matchingTweets.map(function (tweet, index) {
        return tweet.getHTMLTableRow(index + 1);
    }).join("");
}

function parseTweets(runkeeperTweets) {
    if (runkeeperTweets === undefined) {
        window.alert("No tweets returned");
        return;
    }

    // Search only the completed-event tweets that include user-written text.
    writtenTweets = runkeeperTweets.map(function (tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    }).filter(function (tweet) {
        return tweet.written;
    });
    updateSearchResults();
}

function addEventHandlerForSearch() {
    // The input event responds to typing, deletion, and pasting without Enter.
    document.getElementById("textFilter").addEventListener("input", updateSearchResults);
}

document.addEventListener("DOMContentLoaded", function () {
    addSentimentHeadings();
    addEventHandlerForSearch();
    loadSavedRunkeeperTweets().then(parseTweets).catch(function (error) {
        console.error("Unable to load the saved Runkeeper tweets:", error);
    });
});
