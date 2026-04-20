export const SELECTORS = {
  PROFILE: {
    IMAGE: '.profilePicSection_head_img__1GLm0 img',
    USERNAME: '.profilePicSection_head_userHandle__oOfFy',
    STARS: '.profilePicSection_head_stars__JrrGz',
    STREAK_CONTAINER: '.circularProgressBar_head_mid__IKjUN',
    STREAK_COUNT: '.circularProgressBar_head_mid_streakCnt__MFOF1',
    STREAK_TEXT: '.circularProgressBar_head_mid--text__UE3MA',
    GLOBAL_STREAK: '.circularProgressBar_head_mid_streakCnt--glbLongStreak__viuBP'
  },
  EDUCATION: {
    CONTAINER: '.educationDetails_head__eNlYv',
    INSTITUTION_LABEL: '.educationDetails_head_left--institute__MgUR0',
    INSTITUTION: '.educationDetails_head_left--text__tgi9I',
    ORGANIZATION_LABEL: '.educationDetails_head_mid--organization__8Xqbf',
    ORGANIZATION: '.educationDetails_head_mid--text__Gga9v',
    RANK_CONTAINER: '.educationDetails_head_left_userRankContainer__tyT6H',
    RANK_TEXT: '.educationDetails_head_left_userRankContainer--text__wt81s'
  },
  LANGUAGES: {
    LABEL: '.educationDetails_head_right--language__z7haF',
    LIST: '.educationDetails_head_right--text__lLOHI'
  },
  SCORE_CARDS: {
    CONTAINER: '.scoreCards_head__G_uNQ',
    CARD: '.scoreCard_head__nxXR8',
    LABEL: '.scoreCard_head_left--text__KZ2S1',
    SCORE: '.scoreCard_head_left--score__oSi_x',
    DIVIDER: '.scoreCards_head--hrLine__EF9qf'
  },
  DIFFICULTY: {
    CONTAINER: '.problemNavbar_head__cKSRi',
    NAV_ITEM: '.problemNavbar_head_nav__a4K6P',
    NAV_TEXT: '.problemNavbar_head_nav--text__UaGCx',
    ACTIVE: '.problemNavbar_head_active__i_qqT',
    SCHOOL: 'SCHOOL',
    BASIC: 'BASIC',
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD'
  },
  PROBLEMS: {
    LIST: '.problemList_head_list__guE6e',
    ITEM: '.problemList_head_list_item__RlO_s',
    LINK: '.problemList_head_list_item_link__dhmtd'
  }
};

export const extractors = {
  number: (element: Element | null) => {
    if (!element) return 0;
    const text = element.textContent?.trim() || '';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  },

  text: (element: Element | null) => element?.textContent?.trim() || '',

  attribute: (element: Element | null, attr: string) => element?.getAttribute(attr) || '',

  difficulties: (html: string) => {
    const difficulties: Record<string, number> = {};
    const regex = /(\w+)<!-- --> \(<!-- -->(\d+)<!-- -->\)/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      difficulties[match[1].toLowerCase()] = parseInt(match[2]);
    }
    
    return difficulties;
  },

  problemList: (element: Element | null) => {
    if (!element) return [];
    return Array.from(element.querySelectorAll('li a')).map(a => ({
      name: a.textContent?.trim() || '',
      url: (a as HTMLAnchorElement).href
    }));
  },

  streak: (element: Element | null) => {
    if (!element) return { current: 0, global: 0 };
    const streakText = element.textContent?.trim() || '';
    const matches = streakText.split('/').map(s => s.match(/\d+/)?.[0] || '0');
    const current = parseInt(matches[0] || '0');
    const global = parseInt(matches[1] || '0');
    return { current, global };
  },

  scoreCard: (element: Element | null) => {
    if (!element) return { label: '', score: 0 };
    return {
      label: element.querySelector(SELECTORS.SCORE_CARDS.LABEL)?.textContent?.trim() || '',
      score: extractors.number(element.querySelector(SELECTORS.SCORE_CARDS.SCORE))
    };
  },

  languages: (element: Element | null) => {
    if (!element) return [];
    return element.textContent?.trim().split(',').map(lang => lang.trim()) || [];
  },

  profileImage: (element: Element | null) => {
    if (!element) return '';
    const img = element.querySelector('img[srcset]') as HTMLImageElement;
    if (img?.srcset) {
      const srcset = img.srcset.split(', ');
      const lastSrc = srcset[srcset.length - 1];
      return lastSrc.split(' ')[0];
    }
    const imgWithSrc = element.querySelector('img[src]') as HTMLImageElement;
    if (imgWithSrc?.src) {
      const match = imgWithSrc.src.match(/url=([^&]+)/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
      return imgWithSrc.src;
    }
    return '';
  }
};

export class GFGDataExtractor {
  document: Document;

  constructor(document: Document) {
    this.document = document;
  }

  getProfile() {
    const streakElement = this.document.querySelector(SELECTORS.PROFILE.STREAK_COUNT);
    const streakInfo = extractors.streak(streakElement);
    const imageContainer = this.document.querySelector(SELECTORS.PROFILE.IMAGE);

    return {
      username: extractors.text(this.document.querySelector(SELECTORS.PROFILE.USERNAME)),
      userImage: extractors.profileImage(imageContainer),
      stars: extractors.text(this.document.querySelector(SELECTORS.PROFILE.STARS)),
      streak: streakInfo.current,
      globalStreak: streakInfo.global
    };
  }

  getEducation() {
    return {
      institution: extractors.text(this.document.querySelector(SELECTORS.EDUCATION.INSTITUTION)),
      organization: extractors.text(this.document.querySelector(SELECTORS.EDUCATION.ORGANIZATION)),
      instituteRank: extractors.number(this.document.querySelector(SELECTORS.EDUCATION.RANK_TEXT)),
      languages: extractors.languages(this.document.querySelector(SELECTORS.LANGUAGES.LIST))
    };
  }

  getScoreCards() {
    const cards = Array.from(this.document.querySelectorAll(SELECTORS.SCORE_CARDS.CARD));
    const scores: Record<string, number> = {};
    
    cards.forEach(card => {
      const { label, score } = extractors.scoreCard(card);
      if (label) {
        scores[label.toLowerCase().replace(/\s+/g, '_')] = score;
      }
    });

    return scores;
  }

  getDifficulties() {
    const container = this.document.querySelector(SELECTORS.DIFFICULTY.CONTAINER);
    if (!container) return {};

    const difficulties: Record<string, any[]> = {
      school: [],
      basic: [],
      easy: [],
      medium: [],
      hard: []
    };

    const problemLinks = this.document.querySelectorAll(SELECTORS.PROBLEMS.LINK);
    const allProblems = Array.from(problemLinks).map(link => ({
      title: link.textContent?.trim() || '',
      url: (link as HTMLAnchorElement).href
    }));

    container.querySelectorAll(SELECTORS.DIFFICULTY.NAV_ITEM).forEach(item => {
      const text = item.querySelector(SELECTORS.DIFFICULTY.NAV_TEXT)?.textContent || '';
      const match = text.match(/(\w+)\s*\(\s*(\d+)\s*\)/);
      if (match) {
        const [_, difficulty, countStr] = match;
        const count = parseInt(countStr);
        const problemsForDifficulty = allProblems.splice(0, count);
        
        switch(difficulty.toUpperCase()) {
          case SELECTORS.DIFFICULTY.SCHOOL:
            difficulties.school = problemsForDifficulty;
            break;
          case SELECTORS.DIFFICULTY.BASIC:
            difficulties.basic = problemsForDifficulty;
            break;
          case SELECTORS.DIFFICULTY.EASY:
            difficulties.easy = problemsForDifficulty;
            break;
          case SELECTORS.DIFFICULTY.MEDIUM:
            difficulties.medium = problemsForDifficulty;
            break;
          case SELECTORS.DIFFICULTY.HARD:
            difficulties.hard = problemsForDifficulty;
            break;
        }
      }
    });

    return difficulties;
  }

  getProblemsList() {
    const container = this.document.querySelector(SELECTORS.PROBLEMS.LIST);
    return extractors.problemList(container);
  }

  getAllData() {
    const profile = this.getProfile();
    const education = this.getEducation();
    const scores = this.getScoreCards();
    const difficulties = this.getDifficulties();

    return {
      success: true,
      data: {
        profile: {
          ...profile,
          ...education
        },
        stats: {
          ...scores,
          problemsSolved: {
            total: scores.problem_solved || 0,
            byDifficulty: {
              school: difficulties.school?.length || 0,
              basic: difficulties.basic?.length || 0,
              easy: difficulties.easy?.length || 0,
              medium: difficulties.medium?.length || 0,
              hard: difficulties.hard?.length || 0
            }
          }
        },
        problems: {
          school: difficulties.school || [],
          basic: difficulties.basic || [],
          easy: difficulties.easy || [],
          medium: difficulties.medium || [],
          hard: difficulties.hard || []
        }
      }
    };
  }
}
