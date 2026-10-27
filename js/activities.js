const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let distanceView;
let individualDistanceData = [];
let aggregatedDistanceData = [];
let showingMeans = false;

function capitalizeActivity(activityType) {
    return activityType.replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
}

function calculateMean(values) {
    if (values.length === 0) return 0;
    return values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
}

// Count each parsed activity and sort the result from most to least frequent.
function createActivityCountData(tweets) {
    const counts = tweets.reduce(function (result, tweet) {
        if (tweet.activityType !== "unknown") {
            result[tweet.activityType] = (result[tweet.activityType] || 0) + 1;
        }
        return result;
    }, {});

    return Object.keys(counts).map(function (activity) {
        return { activity: activity, count: counts[activity] };
    }).sort(function (first, second) { return second.count - first.count; });
}

// Keep distance records only for the three most common activities.
function createIndividualDistanceData(tweets, topActivities) {
    return tweets.filter(function (tweet) {
        return topActivities.includes(tweet.activityType) && tweet.distance > 0;
    }).map(function (tweet) {
        return {
            activity: tweet.activityType,
            weekday: WEEKDAYS[tweet.time.getDay()],
            distance: Number(tweet.distance.toFixed(2)),
            view: "Individual activity"
        };
    });
}

// Group by activity and weekday, then compute one mean for each group.
function createAggregatedDistanceData(individualData) {
    const groups = individualData.reduce(function (result, item) {
        const key = `${item.activity}|${item.weekday}`;
        if (!result[key]) result[key] = { activity: item.activity, weekday: item.weekday, distances: [] };
        result[key].distances.push(item.distance);
        return result;
    }, {});

    return Object.values(groups).map(function (group) {
        return {
            activity: group.activity,
            weekday: group.weekday,
            distance: Number(calculateMean(group.distances).toFixed(2)),
            view: "Mean distance"
        };
    });
}

// Compute the three written findings from the same values shown in the chart.
function updateWrittenFindings(individualData, topActivities) {
    const means = topActivities.map(function (activity) {
        const distances = individualData.filter(function (item) {
            return item.activity === activity;
        }).map(function (item) { return item.distance; });
        return { activity: activity, meanDistance: calculateMean(distances) };
    });
    const longest = means.reduce(function (a, b) { return b.meanDistance > a.meanDistance ? b : a; });
    const shortest = means.reduce(function (a, b) { return b.meanDistance < a.meanDistance ? b : a; });
    const weekday = individualData.filter(function (item) {
        return !["Saturday", "Sunday"].includes(item.weekday);
    }).map(function (item) { return item.distance; });
    const weekend = individualData.filter(function (item) {
        return ["Saturday", "Sunday"].includes(item.weekday);
    }).map(function (item) { return item.distance; });

    document.getElementById("longestActivityType").textContent = longest.activity;
    document.getElementById("shortestActivityType").textContent = shortest.activity;
    document.getElementById("weekdayOrWeekendLonger").textContent =
        calculateMean(weekend) > calculateMean(weekday) ? "weekends" : "weekdays";
}

function embedActivityCountChart(data) {
    // Vega-Lite declaratively maps activity names and counts to a bar chart.
    const specification = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        width: "container", height: 350, data: { values: data },
        mark: { type: "bar", color: "#0d6efd" },
        encoding: {
            x: { field: "activity", type: "nominal", sort: "-y", title: "Activity type", axis: { labelAngle: -45 } },
            y: { field: "count", type: "quantitative", title: "Number of tweets" },
            tooltip: [
                { field: "activity", type: "nominal", title: "Activity" },
                { field: "count", type: "quantitative", title: "Tweets" }
            ]
        }
    };
    vegaEmbed("#activityVis", specification, { actions: false });
}

function embedDistanceChart() {
    // A named dataset lets the bonus button update this same Vega view later.
    const specification = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        width: "container", height: 375,
        data: { name: "distanceData", values: individualDistanceData },
        mark: { type: "point", filled: true, opacity: 0.65, size: 75 },
        encoding: {
            x: { field: "weekday", type: "ordinal", sort: WEEKDAYS, title: "Day of the week" },
            y: { field: "distance", type: "quantitative", title: "Distance (miles)" },
            color: { field: "activity", type: "nominal", title: "Activity type" },
            tooltip: [
                { field: "activity", type: "nominal", title: "Activity" },
                { field: "weekday", type: "ordinal", title: "Day" },
                { field: "distance", type: "quantitative", format: ".2f", title: "Miles" },
                { field: "view", type: "nominal", title: "View" }
            ]
        }
    };
    return vegaEmbed("#distanceVis", specification, { actions: false }).then(function (result) {
        distanceView = result.view;
        document.getElementById("aggregate").disabled = false;
    });
}

function updateDistanceChart() {
    if (!distanceView) return;
    showingMeans = !showingMeans;
    const replacementData = showingMeans ? aggregatedDistanceData : individualDistanceData;

    // Streaming changes replace the named dataset without creating a second chart.
    const changes = vega.changeset().remove(function () { return true; }).insert(replacementData);
    distanceView.change("distanceData", changes).runAsync();

    const button = document.getElementById("aggregate");
    button.textContent = showingMeans ? "Show individual activities" : "Show means";
    button.setAttribute("aria-pressed", String(showingMeans));
}

function parseTweets(runkeeperTweets) {
    if (runkeeperTweets === undefined) {
        window.alert("No tweets returned");
        return;
    }

    const tweets = runkeeperTweets.map(function (tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    }).filter(function (tweet) { return tweet.source === "completed_event"; });
    const countData = createActivityCountData(tweets);
    const topActivities = countData.slice(0, 3).map(function (item) { return item.activity; });

    document.getElementById("numberActivities").textContent = String(countData.length);
    document.getElementById("firstMost").textContent = capitalizeActivity(topActivities[0]);
    document.getElementById("secondMost").textContent = capitalizeActivity(topActivities[1]);
    document.getElementById("thirdMost").textContent = capitalizeActivity(topActivities[2]);

    individualDistanceData = createIndividualDistanceData(tweets, topActivities);
    aggregatedDistanceData = createAggregatedDistanceData(individualDistanceData);
    updateWrittenFindings(individualDistanceData, topActivities);
    embedActivityCountChart(countData);
    embedDistanceChart();
}

document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("aggregate");
    button.disabled = true;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", updateDistanceChart);
    loadSavedRunkeeperTweets().then(parseTweets).catch(function (error) {
        console.error("Unable to load the saved Runkeeper tweets:", error);
    });
});
