const fs = require('fs');
let code = fs.readFileSync('src/lib/actions.ts', 'utf8');

// Add normalizeImageUrl helper
const helper = `
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) {
    return url;
  }
  return '/uploads/' + url;
}
`;

if (!code.includes('normalizeImageUrl')) {
  code = code.replace('function getRows', helper + '\nfunction getRows');
}

// Now replace where image_url is returned in getPostsAction
if (!code.includes('post.image_url = normalizeImageUrl(post.image_url)')) {
  code = code.replace(
    'return { \n          ...post, ',
    'post.image_url = normalizeImageUrl(post.image_url);\n        return { \n          ...post, '
  );
}

// In createPostAction
if (!code.includes('postData.image_url = normalizeImageUrl(postData.image_url)')) {
  code = code.replace(
    'const postData = cleanData(rawPostData, ["category_id", "sub_category_id", "views"]);',
    'const postData = cleanData(rawPostData, ["category_id", "sub_category_id", "views"]);\n    if (postData.image_url) postData.image_url = normalizeImageUrl(postData.image_url);'
  );
}

// In updatePostAction
if (!code.includes('postData.image_url = normalizeImageUrl(postData.image_url)') && code.includes('const postData = cleanData(rawPostData, ["category_id", "sub_category_id", "views"], ["id", "created_at", "post_tags"]);')) {
  code = code.replace(
    'const postData = cleanData(rawPostData, ["category_id", "sub_category_id", "views"], ["id", "created_at", "post_tags"]);',
    'const postData = cleanData(rawPostData, ["category_id", "sub_category_id", "views"], ["id", "created_at", "post_tags"]);\n    if (postData.image_url) postData.image_url = normalizeImageUrl(postData.image_url);'
  );
}

// Check for getPagesAction
if (!code.includes('page.image_url = normalizeImageUrl(page.image_url)')) {
  code = code.replace(
    'const data = getRows(dataResult);',
    'const data = getRows(dataResult).map(page => {\n      if (page.image_url) page.image_url = normalizeImageUrl(page.image_url);\n      return page;\n    });'
  );
}

fs.writeFileSync('src/lib/actions.ts', code);
console.log('patched actions.ts');