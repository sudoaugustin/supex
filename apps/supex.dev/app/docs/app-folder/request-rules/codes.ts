import { schemas } from 'utils/consts';

export default {
  rule: `{
  "$schema": "${schemas['request-rules']}",
  "rules": [
    {
      "action": {
        "type": "block"
      },
      "condition": { 
        "urlFilter": "developer.mozilla.org" 
      }
    } 
  ],
  "enabled": true
}`,
  config: `{
  "permissions": {
    "required": ["declarativeNetRequest"]
  },
}`,
  rumtime: {
    rule: `{
  "$schema": "${schemas['request-rules']}",
  "rules": [
    {
      "action": {
        "type": "block"
      },
      "condition": { 
        "urlFilter": "developer.mozilla.org" 
      }
    } 
  ],
  "enabled": false
}`,
    script: `...

const enableMozillaRule = () => {
  declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: ['block-mozilla'] });
};

function Action() {
  return <div onClick={enableMozillaRule}>Enable Network Rule</div>
}

...`,
  },
};
