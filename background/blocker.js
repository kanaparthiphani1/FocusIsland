const RULE_ID = 1001;

function toUrlFilter(host) {
  return `||${host}^`;
}

export async function applyFocusBlocking(allowList = []) {
  const allowRegex = allowList.map((h) => h.replace(/\./g, '\\.')).join('|');
  const rule = {
    id: RULE_ID,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: { extensionPath: '/auth/blocked.html' }
    },
    condition: {
      regexFilter: `^https?:\\/\\/(?!(${allowRegex})).*`,
      resourceTypes: ['main_frame']
    }
  };

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [rule]
  });
}

export async function clearFocusBlocking() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID]
  });
}
