// Update every repeated span that uses the same class selector.
function setTextForSelector(selector, value) {
    document.querySelectorAll(selector).forEach(function (element) {
        element.textContent = value;
    });
}

// Format every percentage consistently and avoid division by zero.
function formatPercentage(count, total) {
    return total === 0 ? "0.00%" : `${((count / total) * 100).toFixed(2)}%`;
}

function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
}

function parseTweets(runkeeperTweets) {
    if (runkeeperTweets === undefined) {
        window.alert("No tweets returned");
        return;
    }

    // Convert raw records once so the page can use the getters on Tweet.
    const tweetArray = runkeeperTweets.map(function (tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    // Count each source category in one pass through the data.
    const sourceCounts = tweetArray.reduce(function (counts, tweet) {
        counts[tweet.source] = (counts[tweet.source] || 0) + 1;
        return counts;
    }, {});
    const completedTweets = tweetArray.filter(function (tweet) {
        return tweet.source === "completed_event";
    });
    const writtenCount = completedTweets.filter(function (tweet) {
        return tweet.written;
    }).length;
    const sortedDates = tweetArray.map(function (tweet) {
        return tweet.time;
    }).sort(function (firstDate, secondDate) {
        return firstDate.getTime() - secondDate.getTime();
    });

    document.getElementById("numberTweets").textContent = String(tweetArray.length);
    document.getElementById("firstDate").textContent = formatDate(sortedDates[0]);
    document.getElementById("lastDate").textContent = formatDate(sortedDates[sortedDates.length - 1]);

    // Map each source to the count and percentage spans already in the starter HTML.
    const categories = [
        [".completedEvents", ".completedEventsPct", "completed_event"],
        [".liveEvents", ".liveEventsPct", "live_event"],
        [".achievements", ".achievementsPct", "achievement"],
        [".miscellaneous", ".miscellaneousPct", "miscellaneous"]
    ];
    categories.forEach(function (category) {
        const count = sourceCounts[category[2]] || 0;
        setTextForSelector(category[0], String(count));
        setTextForSelector(category[1], formatPercentage(count, tweetArray.length));
    });

    setTextForSelector(".written", String(writtenCount));
    setTextForSelector(".writtenPct", formatPercentage(writtenCount, completedTweets.length));
}

// Wait for the page and asynchronous starter-data loader before analyzing tweets.
document.addEventListener("DOMContentLoaded", function () {
    loadSavedRunkeeperTweets().then(parseTweets).catch(function (error) {
        console.error("Unable to load the saved Runkeeper tweets:", error);
    });
});
