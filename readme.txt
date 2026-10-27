--Readme document for Timothy Tuan Nguyen, timotn14@uci.edu--

1. How many assignment points do you believe you completed (replace the *'s with your numbers)?

11/10
- 3/3 Summarizing tweets
- 4/4 Identifying the most popular activities
- 3/3 Adding a text search interface
- 1/0 Extra credit: Implemented both optional features (Vega-lite dynamic chart visualizations + Sentiment using opinion lexicon (Hu & Liu, 2004))

2. How long, in hours, did it take you to complete this assignment?

Total: 11 hours.

Reading instructions and planning: 45 minutes.
Researching resources / tutorials for some features: 3 hours.
Programming and troubleshooting: 7 hours.
Preparing project for submission: 15 minutes.

3. What online resources did you consult when completing this assignment? (list sites like StackOverflow or specific URLs for tutorials; describe queries to Generative AI or use of AI-based code completion)

For learning and troubleshooting, I used W3Schools, StackOverflow, StackExchange, Reddit, and Generative AI. For Generative AI, I asked conceptual queries such as "How do I do [this]", "Explain [this]", "Why is [this] not working?", "Why do I get this error, [error]?", and "Is this [output] reasonable?".

I downloaded the opinion lexicon from https://www.cs.uic.edu/~liub/FBS/sentiment-analysis.html#lexicon (Hu & Liu, 2004).

4. What classmates or other individuals did you consult as part of this assignment? What did you discuss?

I consulted with a few classmates about the estimated duration of how long it would take to complete this assignment. One classmate asked about whether their graph look reasonable, so I responded saying mine was similar. No code was shared between me and any classmates.

5. Is there anything special we need to know in order to run your code?

Just run in the root folder with:
tsc --p tsconfig.json
live-server

The extra credit opinion lexicon is already stored locally as "positive_words.js" and negative_words.js, so there is nothing needed to be installed besides what the project instructions already indicate like npm, Typescript Transpiler, and Live Server.

The code in this ".zip" file is sufficient to run the code. However, here is the GitHub repository if needed.
GitHub repository: https://github.com/CreativiTimothy/a2-tweets

Citation:
Hu, M., & Liu, B. (2004). Mining and summarizing customer reviews. In Proceedings of the Tenth ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (pp. 168–177). Association for Computing Machinery. https://doi.org/10.1145/1014052.1014073

Lexicon source:
https://www.cs.uic.edu/~liub/FBS/sentiment-analysis.html#lexicon