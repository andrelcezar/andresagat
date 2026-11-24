function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function todayInSaoPaulo() {
  return new Intl.DateTimeFormat('sv-SE', {timeZone: 'America/Sao_Paulo'}).format(new Date());
}

function formatPostDate(date) {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return [day, month, year].join('/');
}

function postUrl(value, protocols) {
  if (!value) return '';
  try {
    const url = new URL(value, document.baseURI);
    return protocols.includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

async function loadBlogPosts() {
  const response = await fetch('posts.json');
  if (!response.ok) throw new Error('Publicações indisponíveis');
  const posts = await response.json();
  return posts.map(post => ({
    ...post,
    image: postUrl(post.image, ['https:', 'http:']),
    link: postUrl(post.link, ['https:', 'http:'])
  })).sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}
