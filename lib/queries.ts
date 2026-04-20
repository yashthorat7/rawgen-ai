export const USER_PROFILE_QUERY = `
query comprehensiveUserProfile($username: String!) {
    allQuestionsCount {
        difficulty
        count
    }
    matchedUser(username: $username) {
        username
        githubUrl
        twitterUrl
        linkedinUrl
        profile {
            ranking
            userAvatar
            realName
            aboutMe
            school
            websites
            countryName
            company
            jobTitle
            skillTags
            postViewCount
            postViewCountDiff
            reputation
            reputationDiff
            solutionCount
            solutionCountDiff
            categoryDiscussCount
            categoryDiscussCountDiff
            starRating
        }
        submitStats: submitStatsGlobal {
            acSubmissionNum {
                difficulty
                count
                submissions
            }
            totalSubmissionNum {
                difficulty
                count
                submissions
            }
        }
        badges {
            id
            name
            shortName
            displayName
            icon
            hoverText
            medal {
                slug
                config {
                    iconGif
                    iconGifBackground
                }
            }
            creationDate
            category
        }
        upcomingBadges {
            name
            icon
            progress
        }
        activeBadge {
            displayName
            icon
        }
        contestBadge {
            name
            expired
            hoverText
            icon
        }
        languageProblemCount {
            languageName
            problemsSolved
        }
        tagProblemCounts {
            advanced {
                tagName
                tagSlug
                problemsSolved
            }
            intermediate {
                tagName
                tagSlug
                problemsSolved
            }
            fundamental {
                tagName
                tagSlug
                problemsSolved
            }
        }
        userCalendar {
            activeYears
            streak
            totalActiveDays
            dccBadges {
                timestamp
                badge {
                    name
                    icon
                }
            }
            submissionCalendar
        }
        problemsSolvedBeatsStats {
            difficulty
            percentage
        }
        contributions {
            points
            questionCount
            testcaseCount
        }
    }
    recentAcSubmissionList(username: $username, limit: 15) {
        id
        title
        titleSlug
        timestamp
    }
    activeDailyCodingChallengeQuestion {
        date
        userStatus
        link
        question {
            acRate
            difficulty
            freqBar
            questionFrontendId
            isFavor
            isPaidOnly
            status
            title
            titleSlug
            hasVideoSolution
            hasSolution
            topicTags {
                name
                id
                slug
            }
        }
    }
}`;

export const USER_CONTEST_QUERY = `
query getUserContestRanking ($username: String!) {
    userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
        badge {
            name
        }
    }
    userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        trendDirection
        problemsSolved
        totalProblems
        finishTimeInSeconds
        contest {
            title
            startTime
        }
    }
}`;
