const badgesBaseURL = "https://s3-us-west-2.amazonaws.com/exlskills-topic-badges/";

const unknownBadgeURL = `${badgesBaseURL}default.svg`;

const topicToBadge: {[key: string]: string} = {
    "bash": "bash-shell.svg",
    "shell": "bash-shell.svg",
    "cpp": "c-plus-plus.svg",
    "c": "c.svg",
    "c-sharp": "c-sharp.svg",
    "css": "css.svg",
    "dev-ops": "dev-ops.svg",
    "dotnet": "dotnet.svg",
    "dot-net": "dotnet.svg",
    "go": "go.svg",
    "html": "html.svg",
    "java": "java.svg",
    "javascript": "javascript.svg",
    "kotlin": "kotlin.svg",
    "php": "php.svg",
    "python": "python.svg",
    "ruby": "ruby.svg",
    "r": "r.svg",
    "scala": "scala.svg",
    "sql": "sql.svg",
    "swift": "swift.svg",
    "typescript": "typescript.svg",
    "git": "git.svg",
    "github": "github.svg",
    "ui-design": "ui-design.svg",
    "ux-design": "ux-design.svg"
};

export const getBadgeURLForTopic = (topic: string | null | undefined): string => {
    if (!topic) {
        return unknownBadgeURL;
    }
    topic = topic.toLowerCase();
    topic = topic.replace(' ', '-');
    return topicToBadge[topic] ? `${badgesBaseURL}${topicToBadge[topic]}` : unknownBadgeURL;
};
