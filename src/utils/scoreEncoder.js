// 分数编码和解码工具
export const encodeScores = (scores) => {
  const scoreString = `${scores.A},${scores.B},${scores.C},${scores.D}`;
  return btoa(scoreString);
};

export const decodeScores = (encoded) => {
  try {
    const scoreString = atob(encoded);
    const [A, B, C, D] = scoreString.split(',');
    return {
      A: parseInt(A),
      B: parseInt(B),
      C: parseInt(C),
      D: parseInt(D)
    };
  } catch (error) {
    console.error('解码分数失败:', error);
    return null;
  }
};

export const generateShareUrl = (scores) => {
  const encoded = encodeScores(scores);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#/answer?partner=${encodeURIComponent(encoded)}`;
};

export const parsePartnerScores = () => {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const partnerEncoded = urlParams.get('partner');
  if (partnerEncoded) {
    return decodeScores(decodeURIComponent(partnerEncoded));
  }
  return null;
};