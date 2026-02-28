const fs = require('fs');
let code = fs.readFileSync('src/lib/actions.ts', 'utf8');

// replace all occurrences of `const data = getRows(dataResult);`
code = code.replaceAll(
  'const data = getRows(dataResult);',
  'const data = getRows(dataResult).map((item: any) => { if (item.image_url) item.image_url = normalizeImageUrl(item.image_url); if (item.avatar_url) item.avatar_url = normalizeImageUrl(item.avatar_url); return item; });'
);

// Also patch createPageAction / updatePageAction / updateSiteSettingsAction / createProfileAction / updateProfileAction
const toReplace = [
  { search: 'const pageData = cleanData(data);', replace: 'const pageData = cleanData(data);\n    if (pageData.image_url) pageData.image_url = normalizeImageUrl(pageData.image_url);' },
  { search: 'const pageData = cleanData(data, [], ["id", "created_at"]);', replace: 'const pageData = cleanData(data, [], ["id", "created_at"]);\n    if (pageData.image_url) pageData.image_url = normalizeImageUrl(pageData.image_url);' },
  { search: 'const profileData = cleanData(data);', replace: 'const profileData = cleanData(data);\n    if (profileData.avatar_url) profileData.avatar_url = normalizeImageUrl(profileData.avatar_url);' },
  { search: 'const profileData = cleanData(data, [], ["id", "created_at"]);', replace: 'const profileData = cleanData(data, [], ["id", "created_at"]);\n    if (profileData.avatar_url) profileData.avatar_url = normalizeImageUrl(profileData.avatar_url);' },
  { search: 'const profileData = cleanData(data, [], ["created_at"]);', replace: 'const profileData = cleanData(data, [], ["created_at"]);\n    if (profileData.avatar_url) profileData.avatar_url = normalizeImageUrl(profileData.avatar_url);' },
  { search: 'const settingsData = cleanData(data, [], ["id"]);', replace: 'const settingsData = cleanData(data, [], ["id"]);\n    if (settingsData.logo_url) settingsData.logo_url = normalizeImageUrl(settingsData.logo_url);' },
];

toReplace.forEach(({ search, replace }) => {
  code = code.replace(search, replace);
});

fs.writeFileSync('src/lib/actions.ts', code);
