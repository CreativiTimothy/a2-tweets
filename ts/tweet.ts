declare var POSITIVE_WORDS: string[];
declare var NEGATIVE_WORDS: string[];

/*
 * The sentiment sets are created only when the Descriptions page first asks
 * for sentiment. Summary and Activities can therefore use Tweet without
 * loading the two large lexicon files.
 */
let positiveWordSet: Set<string> | undefined;
let negativeWordSet: Set<string> | undefined;

class Tweet {
    private text: string;
    time: Date;

    constructor(tweet_text: string, tweet_time: string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time);
    }

    // Classify the generated Runkeeper message before parsing other fields.
    get source(): string {
        if (/^Watch my\b/i.test(this.text)) return "live_event";
        if (/^(?:Achieved a new|I just set a goal)\b/i.test(this.text)) return "achievement";
        if (/^Just (?:completed|posted)\b/i.test(this.text)) return "completed_event";
        return "miscellaneous";
    }

    // A completed event is written when text remains after Runkeeper's " - " separator.
    get written(): boolean {
        return this.source === "completed_event" && this.writtenText.length > 0;
    }

    get writtenText(): string {
        if (this.source !== "completed_event") return "";
        const separatorIndex = this.text.indexOf(" - ");
        if (separatorIndex === -1) return "";

        // Remove the generated URL and hashtag while preserving the user's message.
        return this.text.slice(separatorIndex + 3)
            .replace(/https?:\/\/\S+/gi, "")
            .replace(/#Runkeeper\b/gi, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    get activityType(): string {
        if (this.source !== "completed_event") return "unknown";

        /*
         * Completed tweets have a stable structure. The activity appears after
         * an optional distance and before "with", a dash, a duration, or a URL.
         */
        const match = this.text.match(
            /^Just (?:completed|posted) (?:a|an)\s+(?:(?:\d+(?:\.\d+)?)\s*(?:km|mi)\s+)?(.+?)(?=\s+(?:with\b|-\s|in\s+\d|https?:\/\/))/i
        );
        return match ? match[1].trim().toLowerCase() : "unknown";
    }

    // Return one consistent unit. Tweets recorded in kilometers are converted to miles.
    get distance(): number {
        if (this.source !== "completed_event") return 0;
        const match = this.text.match(/(\d+(?:\.\d+)?)\s*(km|mi)\b/i);
        if (!match) return 0;
        const value = Number(match[1]);
        return match[2].toLowerCase() === "km" ? value / 1.609 : value;
    }

    get sentiment(): string {
        const counts = this.getSentimentCounts();
        if (counts.positive === 0 && counts.negative === 0) return "Neutral";
        if (counts.positive === counts.negative) return "Mixed";
        return counts.positive > counts.negative ? "Positive" : "Negative";
    }

    get sentimentScore(): number {
        const counts = this.getSentimentCounts();
        return counts.positive - counts.negative;
    }

    /*
     * Count complete-word matches from the Hu and Liu lexicon. A directly
     * preceding negation reverses the matched word's polarity.
     */
    private getSentimentCounts(): { positive: number; negative: number } {
        if (positiveWordSet === undefined) positiveWordSet = new Set(POSITIVE_WORDS);
        if (negativeWordSet === undefined) negativeWordSet = new Set(NEGATIVE_WORDS);

        const positiveWords = positiveWordSet;
        const negativeWords = negativeWordSet;
        const negations = new Set(["hardly", "never", "no", "not"]);
        const words = this.writtenText.toLowerCase().match(/[a-z0-9'+*-]+/g) || [];
        let positive = 0;
        let negative = 0;

        words.forEach(function (word, index) {
            const isNegated = index > 0 && negations.has(words[index - 1]);
            if (positiveWords.has(word)) isNegated ? negative++ : positive++;
            else if (negativeWords.has(word)) isNegated ? positive++ : negative++;
        });
        return { positive: positive, negative: negative };
    }

    // Extract the shortened Runkeeper link used by the search-results table.
    private get activityURL(): string {
        const match = this.text.match(/https?:\/\/\S+/i);
        return match ? match[0].replace(/[.,!?]+$/, "") : "";
    }

    // Escape tweet text before inserting it into generated HTML.
    private escapeHTML(value: string): string {
        return value.replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    getHTMLTableRow(rowNumber: number): string {
        const text = this.escapeHTML(this.writtenText);
        const url = this.escapeHTML(this.activityURL);
        const score = this.sentimentScore > 0 ? `+${this.sentimentScore}` : String(this.sentimentScore);
        const link = url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>` : text;

        return `<tr>
            <th scope="row">${rowNumber}</th>
            <td>${this.escapeHTML(this.activityType)}</td>
            <td>${link}</td>
            <td class="sentiment-${this.sentiment.toLowerCase()}">${this.sentiment}</td>
            <td>${score}</td>
        </tr>`;
    }
}
