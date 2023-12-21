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

let html = ''

function createGroupChannelCollection(sb, hidden) {
    const groupChannelFilter = new GroupChannelFilter();
    groupChannelFilter.includeEmpty = false;
    groupChannelFilter.unreadChannelFilter = UnreadChannelFilter.ALL;
    groupChannelFilter.hiddenChannelFilter = hidden ? HiddenChannelFilter.HIDDEN : HiddenChannelFilter.UNHIDDEN;

    const params = {
        filter: groupChannelFilter,
        order: GroupChannelListOrder.LATEST_LAST_MESSAGE,
        limit: LIMIT,
    };

    return sb.groupChannel.createGroupChannelCollection(params);
}

async function connect() {
    const sb = SendbirdChat.init({
        appId: SB_APP_ID,
        newInstance: true,
        localCacheEnabled: true,
        modules: [new GroupChannelModule()],
    });

    await sb.connect(SB_USER_ID, SB_TOKEN);
    return sb
}

async function getChannels(sb, hidden) {
    const groupChannelCollection = createGroupChannelCollection(sb, hidden);
    let result = [];

    while (groupChannelCollection.hasMore) {
        const channels = await groupChannelCollection.loadMore();
        console.log('received messages', channels.length)
        result = [...result, ...channels];
    }

    return result;
}

function updateCounters(hiddenChannels, unhiddenChannels) {
    const el = document.querySelector('#app');
    if (el) {
        html += `Hidden channel count: ${hiddenChannels.length}; unhidden channel count: ${unhiddenChannels.length}<br/>`
        el.innerHTML = html;
    }
}


let sb
for(let i=0; i<10; ++i) {
    console.log('connecting')
    sb = await connect()
    console.log('connected')
    console.log('loading hiddeen channels')
    const hiddenChannels = await getChannels(sb, true)
    console.log('loaded hiddeen channels', hiddenChannels.length)
    console.log('disconnecting')
    await sb.disconnect()
    console.log('disconnected')
    console.log('connecting')
    sb = await connect()
    console.log('connected')

    setTimeout(async () => {
        console.log('loading unhidden channels')
        const unhiddenChannels = await getChannels(sb, false)
        console.log('loaded unhidden channels', unhiddenChannels.length)
        updateCounters(hiddenChannels, unhiddenChannels)
    }, 1000)
}
