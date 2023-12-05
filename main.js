import './style.css'

import SendbirdChat from "@sendbird/chat";
import {
    GroupChannelFilter,
    GroupChannelListOrder,
    GroupChannelModule,
    HiddenChannelFilter,
    UnreadChannelFilter,
} from "@sendbird/chat/groupChannel";

const SB_APP_ID = "YOUR APPLICATION ID HERE";
const SB_USER_ID = "YOUR USER ID HERE";
const SB_TOKEN = "YOUR USER ACCESS TOKEN";
const LIMIT = 100;

function createGroupChannelCollection(sb) {
    const groupChannelFilter = new GroupChannelFilter();
    groupChannelFilter.includeEmpty = false;
    groupChannelFilter.unreadChannelFilter = UnreadChannelFilter.ALL;
    groupChannelFilter.hiddenChannelFilter = HiddenChannelFilter.UNHIDDEN;

    const params = {
        filter: groupChannelFilter,
        order: GroupChannelListOrder.LATEST_LAST_MESSAGE,
        limit: LIMIT,
    };

    return sb.groupChannel.createGroupChannelCollection(params);
}

async function getChannels() {
    const sb = SendbirdChat.init({
        appId: SB_APP_ID,
        newInstance: true,
        localCacheEnabled: true,
        modules: [new GroupChannelModule()],
    });

    await sb.connect(SB_USER_ID, SB_TOKEN);
    const groupChannelCollection = createGroupChannelCollection(sb);
    let result = [];

    while (groupChannelCollection.hasMore) {
        const channels = await groupChannelCollection.loadMore();
        result = [...result, ...channels];
    }

    return result;
}

const el = document.querySelector('#app');
if (el) {
    el.innerHTML = "Loading...";
    const channels = await getChannels();
    el.innerHTML = `Channel count received: ${channels.length}`;
}
