import { ContributorResponse} from "../types";
import { fetchContributorActivity } from "../api/githubApi";


export const calcBusFactorScore = (contributorActivity: ContributorResponse[]): number => {
    if (!contributorActivity) {
        return 0;
    }

    let totalCommits = 0;
    let totalContributors = 0;
    for (const contributor of contributorActivity) {
        totalCommits += contributor.total
        ++totalContributors
    }

    const threshold = Math.ceil(totalCommits * 0.5); // 50% of commits

    let curr = 0;
    let busFactor = 0;

    // contributorActivity default sorting is least to greatest, so iterate R to L 
    for (let i = contributorActivity.length - 1; i >= 0; i--) {
        curr += contributorActivity[i].total;
        busFactor++;

        if (curr >= threshold) {
            break;
        }
    }

    const averageBusFactor = 3;
    // if bus factor is 10+, thats more than enough
    if (busFactor > 9) {
        return 1;
    }

    // scale bus factor values using sigmoid function
    return 1 - Math.exp(-(busFactor ** 2) / (2 * averageBusFactor ** 2));
}

export async function calcBusFactor(owner: string, repo: string, token: string): Promise<number> {
    let busFactor;
    const contributorActivity = await fetchContributorActivity(owner, repo, token);
    if (!contributorActivity?.data || !Array.isArray(contributorActivity.data)) {
        busFactor = -1
    } else {
        busFactor = calcBusFactorScore(contributorActivity.data);
    }

    return busFactor;
}