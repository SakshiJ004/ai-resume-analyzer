// Get color class based on score
export const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
};

// Get background color class based on score
export const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
};

// Get score label text
export const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Work';
};

// Format date to readable string
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Truncate long text with ellipsis
export const truncate = (str, maxLength = 60) => {
    if (!str) return '';
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
};

// Calculate percentage difference between two scores
export const scoreDiff = (newScore, oldScore) => {
    const diff = newScore - oldScore;
    return {
        value: Math.abs(diff),
        improved: diff > 0,
        same: diff === 0,
    };
};